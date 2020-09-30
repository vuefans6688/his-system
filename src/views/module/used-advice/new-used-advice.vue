<template>
  <div class="new-used-advice">
    <div class="header">
      <h3 class="title">{{ title }}</h3>
      <div class="action">
        <el-button type="primary" @click="submit('form')" size="small">保存</el-button>
        <el-button type="warning" @click="cancel" size="small">取消</el-button>
      </div>
    </div>
    <el-form :model="form" ref="form" size="small" label-width="90px">
      <el-form-item label="模板名称:" prop="name" :rules="{ required: true, message: '模板名称不能为空', trigger: 'blur, change' }">
        <el-input v-model="form.name" :maxlength="64"></el-input>
      </el-form-item>
      <el-form-item label="模板类型:">
        <el-radio-group v-model="form.owner_type_str">
          <el-radio label="个人"></el-radio>
          <el-radio label="通用"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="医嘱内容:" prop="data.advice" :rules="{ required: true, message: '医嘱内容不能为空', trigger: 'blur, change' }">
        <el-input type="textarea" :rows="6" placeholder="医嘱内容不能超过2000字" v-model="form.data.advice" :maxlength="2000"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit, floatLimit } from '@/utils/inputLimit'
const templateTypeNames = ['', '门诊病历', '西/成药', '中药', '输液', '诊疗项目', '耗材组合', '其他项目', '常用医嘱']
export default {
  data() {
    return {
      // 表单数据
      form: {
        clinic_id: '',
        template_id: '',
        name: '',  // 模板名字
        type: 8,  // 类型默认值
        owner_type_str: '',  // 模板类型
        owner_type: 0,  // 类型整数，默认个人
        data: {
          advice: ''
        }
      },
      title: '新增常用医嘱模板',
      isNew: true
    }
  },
  methods: {
    initData() {
      const data = this.$route.params.data
      const tplType = this.$route.params.tplType
      if (!data) {
        this.title = '新增' + templateTypeNames[tplType] + '模板'
        this.isNew = true
        this.form.owner_type = 0
        this.form.type = 8
        this.form.owner_type_str = '个人'
      } else {
        this.title = '修改' + templateTypeNames[tplType] + '模板'
        this.isNew = false
        this.form.data = data.data
        this.form.type = 8
        this.form.name = data.name
        this.form.owner_type_str = (data.owner_type === 0 || data.owner_type === '个人模板') ? '个人' : '通用'
        this.form.template_id = data.template_id
      }
    },
    cancel() {
      this.$confirm('是否取消保存?', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.$router.back()
      }).catch()
    },
    validateAllInputs() {
      if (!this.form.name) {
        return '请输入模板名称'
      }
      if (this.form.name.length > 64) {
        return '模板名称长度不能超64个字符'
      }
      if (!this.form.data.advice) {
        return '请输入医嘱内容'
      }
      if (this.form.data.advice.length > 6000) {
        return '医嘱内容长度不能超2000字'
      }
      return ''
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.save()
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    save() {
      this.form.clinic_id = this.clinic
      if (this.form.owner_type_str === '通用') {
        this.form.owner_type = 1
      } else {
        this.form.owner_type = 0
      }
      const url = this.isNew ? '/service/template/create' : '/service/template/modify'
      this.$http.post(url, {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: this.form
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data && res.data.clinic_id === this.clinic) {
          this.$message({ message: '保存成功!', type: 'success', showClose: true, duration: 1000 })
          this.$router.back()
        } else if (res.errcode !== 0) {
          this.$message({ message: res.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    numberInput(str) {  // 限制数字输入
      for (let i = 0; i < this.form.data.item_list.length; i++) {
        this.form.data.item_list[i][str] = intLimit(this.form.data.item_list[i][str])
      }
    },
    priceInput(str) {  // 限制数字输入
      for (let i = 0; i < this.form.data.item_list.length; i++) {
        this.form.data.item_list[i][str] = floatLimit(this.form.data.item_list[i][str], 2)
      }
    },
    addFormItem() {
      if (this.form.data.item_list.length >= 5) {
        this.$message({ message: '单个处方最多5种药品', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const json = {
        item_id: 'none',
        item_type: 8,
        name: '',
        total: 0.0,
        total_unit: ''
      }
      this.form.data.item_list.push(json)
    },
    del(index) {
      if (this.form.data.item_list.length <= 1) {
        return
      }
      this.form.data.item_list.splice(index, 1)
    },
    // 联想
    querySearchAsync(queryString, callback) {  // 药名联想
      clearTimeout(this.timeout)
      this.$http.post('/service/prescription/search_drug', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          drug_name: queryString,
          drug_type: 0
        }
      }).then(res => {
        if (res.data.errcode === 0 && res.data.data.clinic_id === this.clinic) {
          if (!res.data.data.data) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.data.data.data)
          }
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
          callback([])
        }
      }).catch()
    },
    usageSearch(queryString, callback) {  // 用法联想
      const westUsageArr = this.usage
      const results = queryString ? westUsageArr.filter(this.createFilter(queryString)) : westUsageArr
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    timesSearch(queryString, callback) {  // 用药频次联想
      const timesArr = this.frequency
      const results = queryString ? timesArr.filter(this.createFilter(queryString)) : timesArr
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    createFilter(queryString) {
      return array => array.name.toLowerCase().includes(queryString.toLowerCase())
    },
    // 西药名称选择事件
    westNameSelect(item, index) {
      this.form.data.item_list[index].name = item.drug_name
      this.form.data.item_list[index].drug_id = item.drug_id
      this.form.data.item_list[index].medName = item.drug_name  // 保存药名检测
      this.$http.post('/service/prescription/drug_info', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          drug_id: item.drug_id
        }
      }).then(res => {
        if (res.data.data) {
          this.validation = false
          this.form.data.item_list[index].spec_text = res.data.data.specs_txt
          this.form.data.item_list[index].use_method = res.data.data.yongfa
          this.form.data.item_list[index].dosage = res.data.data.useunit.specs_unit
          this.form.data.item_list[index].dose_unit = res.data.data.useunit.specs_name
          this.form.data.item_list[index].days = res.data.data.usedall_days
          this.form.data.item_list[index].total = res.data.data.useall.specs_unit
          this.form.data.item_list[index].total_unit = res.data.data.useall.specs_name
          this.form.data.item_list[index].frequency = this.frequency[res.data.data.usedaily_times - 1].name
        }
      }).catch()
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  mounted() {
    this.initData()
  }
}
</script>

<style lang="scss" scoped>
.new-used-advice {
  margin-top: 20px;
  margin-left: 30px;
  .header {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    .title {
      color: #42b983;
    }
    .action {
      margin-right: 50px;
    }
  }
  .el-form {
    margin-top: 20px;
    width: 50%;
  }
}
</style>
