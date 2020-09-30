<template>
  <div class="new-other-objects">
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
      <div v-for="(item, index) in form.data.item_list" :key="index" class="content">
        <el-form-item label="标题:">
          <span style="font-size: 18px;color: #666;">处方内容</span>
        </el-form-item>
        <!-- 序号 -->
        <el-form-item label="序号:">
          <span style="font-size: 18px;color: #42b983;">({{ index + 1 }})</span>
        </el-form-item>
        <!-- 药品名称 -->
        <el-form-item label="药品名称:" :prop="'data.item_list.' + index + '.name'" :rules="{ required: true, message: '项目名称不能为空', trigger: 'blur, change' }">
          <el-autocomplete popper-class="my-autocomplete"  v-model="item.name" placeholder="请输入名称" 
            :fetch-suggestions="querySearchAsync" value-key="name"
            @select="westNameSelect($event, index)" :trigger-on-focus="false" style="width: 100%;">
            <template slot-scope="props">
              <div class="think">
                <span class="name">{{ props.item.name }}</span>
                <span class="spec">{{ `${props.item.price元}` }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <!-- 数量 -->
        <el-form-item label="数量:" :prop="'data.item_list.' + index + '.total'" :rules="{ required: true, message: '数量不能为空', trigger: 'blur, change' }">
          <el-input v-model="item.total" @keyup.native="numberInput('total')"></el-input>
        </el-form-item>
        <!-- 数量单位 -->
        <el-form-item label="数量单位:" :prop="'data.item_list.' + index + '.total_unit'" :rules="{ required: true, message: '单位不能为空', trigger: 'blur, change' }">
          <el-input placeholder="数量单位" v-model="item.total_unit" :maxlength="64"></el-input>
        </el-form-item>
        <!-- 操作 -->
        <el-form-item prop="del">
          <el-button @click="del(index)" type="danger" plain class="el-icon-delete">删除模板</el-button>
          <el-button @click="addFormItem" type="primary" plain class="el-icon-plus">增加模板</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit } from '@/utils/inputLimit'
const templateTypeNames = ['', '门诊病历', '西/成药', '中药', '输液', '诊疗项目', '耗材组合', '其他项目', '常用医嘱']
export default {
  data() {
    return {
      // 表单数据
      form: {
        clinic_id: '',
        template_id: '',
        name: '',  // 模板名字
        type: 7,  // 类型默认值
        owner_type_str: '',  // 模板类型
        owner_type: 0, // 类型整数，默认个人
        data: {
          item_list: [
            {
              item_id: 'none',
              item_type: 7,
              name: '',
              total: '',
              total_unit: ''
            }
          ]
        }
      },
      title: '新增其他项目模板',
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
        this.form.type = 7
        this.form.owner_type_str = '个人'
      } else {
        this.title = '修改' + templateTypeNames[tplType] + '模板'
        this.isNew = false
        this.form.data = data.data
        this.form.type = 7
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
      if (!this.form.data.item_list || this.form.data.item_list.length === 0) {
        return '请至少输入一项'
      }
      for (let i = 0; i < this.form.data.item_list.length; i++) {
        const v = this.form.data.item_list[i]
        const preStr = '第' + (i + 1) + '行'
        if (!v.name) {
          return preStr + '请输入名称'
        }
        if (v.name.length > 64) {
          return preStr + '名称长度不能超64个字符'
        }
        if (!v.total) {
          return preStr + '请输入数量'
        }
        if (!v.total_unit) {
          return preStr + '请输入数量单位'
        }
        if (v.total_unit.length > 64) {
          return preStr + '数量单位长度不能超64个字符'
        }
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
      // 字符串转化为数字
      this.stringNumber()
      this.form.clinic_id = this.clinic
      if (this.form.owner_type_str === '通用') {
        this.form.owner_type = 1
      } else {
        this.form.owner_type = 0
      }
      const errMessage = this.validateAllInputs()
      if (errMessage) {
        this.$message({ message: errMessage, type: 'error', showClose: true, duration: 1000 })
        return
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
    addFormItem() {
      const json = {
        item_id: 'none',
        item_type: 7,
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
      this.$http.post('/service/clinic/search_chargitem', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          item_name: queryString,
          item_type: 6
        }
      }).then(res => {
        if (res.data.errcode === 0 && res.data.data.clinic_id === this.clinic) {
          if (!res.data.data.items) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.data.data.items)
          }
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
          callback([])
        }
      }).catch(e => {
        this.$message({ message: e, type: 'error', showClose: true, duration: 1000 })
      })
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
      this.form.data.item_list[index].name = item.name
      this.form.data.item_list[index].total_unit = item.unit
      this.form.data.item_list[index].item_id = item.item_id
    },
    // 字符串转化为数字
    stringNumber() {
      this.form.data.item_list.forEach((item, index) => {
        this.form.data.item_list[index].total = parseFloat(item.total)
      })
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
.new-other-objects {
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
    .content {
      border-top: 1px dashed #ddd;
      padding-top: 10px;
    }
  }
}
</style>
