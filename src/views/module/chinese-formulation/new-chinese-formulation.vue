<template>
  <div class="new-chinese-formulation">
    <div class="header">
      <h3 class="title">{{ title }}</h3>
      <div class="action">
        <el-button type="primary" @click="submit('form')" size="small">保存</el-button>
        <el-button type="warning" @click="cancel" size="small">取消</el-button>
      </div>
    </div>
    <el-form :model="form" ref="form" size="small" label-width="90px">
      <el-form-item label="模板名称:" prop="name" :rules="{ required: true, message: '模板名称不能为空', trigger: 'blur, change' }">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="模板类型:">
        <el-radio-group v-model="form.owner_type_str">
          <el-radio label="个人"></el-radio>
          <el-radio label="通用"></el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-for="(item, index) in form.data.drug_list" :key="index" class="content">
        <el-form-item label="标题:">
          <span style="font-size: 18px;color: #666;">处方内容</span>
        </el-form-item>
        <!-- 序号 -->
        <el-form-item label="序号:">
          <span style="color: #42b983;font-size: 20px;">({{ index + 1 }})</span>
        </el-form-item>
        <!-- 药品名称 -->
        <el-form-item :prop="'data.drug_list.' + index + '.name'" label="药品名称:"
          :rules="{ required: true, message: '药品名称不能为空', trigger: 'blur, change' }">
          <el-autocomplete popper-class="my-autocomplete" @blur="checkName(index)" 
            v-model="item.name" :fetch-suggestions="querySearchAsync" 
            placeholder="请输入药品名" @select="westNameSelect($event, index)" 
            :trigger-on-focus="false" style="width: 100%;" value-key="name">
            <template slot-scope="props">
              <div class="think">
                <span class="name">{{ props.item.drug_name }}</span>
                <span class="spec">{{ props.item.spec_text }}</span>
                <p class="phone">{{ props.item.producer }}</p>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <!-- 规格 -->
        <el-form-item label="规格:">
          <el-input v-model="item.spec_text" :maxlength="64" placeholder="请输入规格"></el-input>
        </el-form-item>
        <!-- 剂量 -->
        <el-form-item label="剂量:">
          <el-input v-model="item.dosage" @keyup.native="floatLimitDrug('dosage', 4)" placeholder="请输入剂量"
            style="width: 50%;"></el-input>
          <el-autocomplete popper-class="my-autocomplete" v-model="item.dose_unit"  
            :fetch-suggestions="doesUnitSearch" placeholder="请输入剂量单位" style="width: 50%;">
          </el-autocomplete>
        </el-form-item>
        <!-- 煎法/用法 -->
        <el-form-item label="煎法/用法:">
          <el-autocomplete popper-class="my-autocomplete" v-model="item.use_note"  
            :fetch-suggestions="medAskForSearch" placeholder="请输入用法" style="width: 100%;">
          </el-autocomplete>
        </el-form-item>
        <!-- 内用/外用 -->
        <el-form-item label="内用/外用:">
          <el-radio v-model="form.data.use_method" label="内服"></el-radio>
          <el-radio v-model="form.data.use_method" label="外用"></el-radio>
        </el-form-item>
        <!-- 剂数 -->
        <el-form-item label="剂数:">
          <el-input v-model="form.data.total" @keyup.native="numberLimitDosage('total')" style="width: 96%;"></el-input>
          <span style="margin-left: 6px;color: #666;">剂</span>
        </el-form-item>
        <!-- 频次 -->
        <el-form-item label="频次:">
          <el-select v-model="form.data.frequency" style="width: 100%;">
            <el-option v-for="(val, index) in frequencyList" :key="index" :label="val.name" :value="val.name"></el-option>
          </el-select>
        </el-form-item>
        <!-- 整剂用法 -->
        <el-form-item prop="daily_use" label="整剂用法:">
          <el-autocomplete popper-class="my-autocomplete" v-model="all_use_note"  
            :fetch-suggestions="medAskForSearch" @select="handleSelect" 
            placeholder="批量填写煎法/用法" style="width: 87%;">
          </el-autocomplete>
          <span style="color: #f00;">（非必填）</span>
        </el-form-item>
        <el-form-item label="其它要求:">
          <el-input type="textarea" :rows="3" v-model="form.data.taking_note"></el-input>
        </el-form-item>
        <!-- 操作 -->
        <el-form-item prop="del">
          <el-button type="danger" @click="del(index)" v-show="!isDisabled" class="el-icon-delete" plain>
            删除模板
          </el-button>
          <el-button type="primary" @click="addFormItem" v-show="!isDisabled" class="el-icon-plus" plain>
            增加模板
          </el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit, floatLimit } from '@/utils/inputLimit'
const templateTypeNames = ['', '门诊病历', '西/成药', '中药']
export default {
  data() {
    return {
      all_use_note: '',
      // 表单数据
      form: {
        clinic_id: '',
        template_id: '',
        name: '',  // 模板名字
        type: -1,  // 类型默认值
        owner_type_str: '',  // 模板类型
        owner_type: 0,  // 类型整数，默认个人
        data: {
          use_method: '内服',
          frequency: '',
          total: 1,
          total_unit: '剂',
          taking_note: '',
          drug_list: [  // 处方列表
            {
              drug_id: 'none',
              drug_type: 1,
              name: '',
              spec_text: '',
              use_note: '',
              dosage: '',
              dose_unit: ''
            }
          ]
        }  
      },
      title: '新增中药处方模板',
      isNew: true,
      isDisabled: false   // 禁用表单
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
        this.form.type = tplType
        this.form.owner_type_str = '个人'
      } else {
        this.title = '修改' + templateTypeNames[tplType] + '模板'
        this.isNew = false
        this.form.data = data.data
        this.form.type = tplType
        this.form.name = data.name
        this.form.owner_type_str = (data.owner_type === 0 || data.owner_type === '个人模板') ? '个人' : '通用'
        this.form.template_id = data.template_id
      }
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
    validateDrugName(str) {
      if (!str || str.length > 64) {
        this.$message({ message: '请输入药品名称', type: 'error', showClose: true, duration: 1000 })
      }
      if (str.length > 64) {
        this.$message({ message: '药品名称长度不能超过64个字符', type: 'error', showClose: true, duration: 1000 })
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
    // 中药使用频率联想
    TimesSearch(queryString, callback) {
      const medicine = this.frequencyList
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    // 中药特殊要求联想
    medAskForSearch(queryString, callback) {
      const medicine = this.chinaUsage
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    // 中药单次剂量联想
    doesUnitSearch(queryString, callback) {
      const medicine = this.doseUnitList
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    validateAllInputs() {
      if (!this.form.name) {
        return '请输入模板名称'
      }
      if (this.form.name.length > 64) {
        return '模板名称长度不能超64个字符'
      }
      if (!this.form.data.drug_list || this.form.data.drug_list.length === 0) {
        return '请至少输入一种药品'
      }
      for (let i = 0; i < this.form.data.drug_list.length; i++) {
        const v = this.form.data.drug_list[i]
        const preStr = '第' + (i + 1) + '行'
        if (!v.name) {
          return preStr + '请输入药品名称'
        }
        if (v.name.length > 64) {
          return preStr + '药品名称长度不能超64个字符'
        }
        v.dosage = parseInt(v.dosage, 10)
        if (!v.dosage) {
          return preStr + '请输入药品剂量'
        }
        if (!v.use_note) {
          return preStr + '请输入药品煎法/用法'
        }
        if (v.use_note.length > 64) {
          return preStr + '煎法 / 用法长度不能超64个字符'
        }
      }
      if (!this.form.data.use_method) {
        return '请选择 内服 / 外用'
      }
      if (!this.form.data.total) {
        return '请输入开药剂数'
      }
      this.form.data.total = parseInt(this.form.data.total, 10)
      if (this.form.data.total === 0) {
        return '请输入开药剂数'
      }
      if (!this.form.data.frequency) {
        return '请输入用药频次'
      }
      if (this.form.data.frequency.length > 64) {
        return '用药频次长度不能超64个字符'
      }
      if (this.form.data.taking_note && this.form.data.taking_note.length > 256) {
        return '其他要求长度不能超256个字符'
      }
      for (let i = 0; i < this.form.data.drug_list.length; i++) {
        this.form.data.drug_list[i].use_method = this.form.data.use_method
        this.form.data.drug_list[i].frequency = this.form.data.frequency
        this.form.data.drug_list[i].total = this.form.data.total
        this.form.data.drug_list[i].total_unit = this.form.data.total_unit
        this.form.data.drug_list[i].taking_note = this.form.data.taking_note
      }
      return ''
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
      const url = this.isNew ? '/service/template/create' : '/service/template/modify'
      const data = {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: this.form
      }
      this.$http.post(url, data).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data && res.data.clinic_id === this.clinic) {
          this.$message({ message: '保存成功', type: 'success', showClose: true, duration: 1000 })
          this.$router.back()
        } else if (res.errcode !== 0) {
          this.$message({ message: res.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    // 限制药品数字输入
    floatLimitDrug(str, bit) {
      for (let i = 0; i < this.form.data.drug_list.length; i++) {
        this.form.data.drug_list[i][str] = floatLimit(this.form.data.drug_list[i][str], bit)
      }
    },
    // 限制处方数字输入
    numberLimitDosage(str) {
      this.form.data[str] = intLimit(this.form.data[str])
    },
    addFormItem() {
      let flag = true
      this.form.data.drug_list.forEach(val => {
        if (!val.name) {
          flag = false
        }
      })
      if (!flag) {
        this.$message({ message: '内容为空不能新增一行', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      if (this.form.data.drug_list.length >= 64) {
        this.$message({ message: '单个中药处方最多64种药品', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const json = {
        drug_id: 'none',
        drug_type: 1,
        name: '',
        spec_text: '',
        use_note: '',
        dosage: '',
        dose_unit: ''
      }
      this.form.data.drug_list.push(json)
    },
    del(index) {
      if (this.form.data.drug_list.length <= 1) {
        return
      }
      this.form.data.drug_list.splice(index, 1)
    },
    checkName(index) {  // 检验名字
      if (this.form.data.drug_list[index].name !== this.form.data.drug_list[index].medName) {
        this.form.data.drug_list[index].drug_id = 'none'
      }
    },
    // 联想
    querySearchAsync(queryString, callback) { // 药名联想
      clearTimeout(this.timeout)
      this.$http.post('/service/prescription/search_drug', {
        head: {
          accessToken: this.token,   // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          drug_name: queryString,
          drug_type: 1
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
      const westUsageArr = this.Usage
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
      const obj = this.form.data.drug_list.find(val => item.drug_id === val.drug_id)
      if (obj) {
        this.$message({ message: '该药品已存在！', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.form.data.drug_list[index].name = item.drug_name
      this.form.data.drug_list[index].drug_id = item.drug_id
      this.form.data.drug_list[index].medName = item.drug_name  // 保存药名检测
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
          this.form.data.drug_list[index].spec_text = res.data.data.specs_txt
          this.form.data.drug_list[index].use_note = res.data.data.yongfa
          this.form.data.drug_list[index].dosage = res.data.data.useunit.specs_unit
          this.form.data.drug_list[index].dose_unit = res.data.data.useunit.specs_name
          this.form.data.drug_list[index].total = res.data.data.useall.specs_unit
          this.form.data.drug_list[index].total_unit = res.data.data.useall.specs_name
          this.form.data.drug_list[index].frequency = this.tcmTimes[res.data.data.usedaily_times - 1].name
          this.form.data.frequency = this.tcmTimes[res.data.data.usedaily_times - 1].name
        }
      }).catch()
    },
    // 字符串转化为数字
    stringNumber() {
      this.form.data.total = parseFloat(this.form.data.total)
      this.form.data.drug_list.forEach((drug, index) => {
        this.form.data.drug_list[index].dosage = parseFloat(this.form.data.drug_list[index].dosage)
      })
    },
    handleSelect(item) {
      this.all_use_note = item.name
      this.form.data.drug_list.forEach(d => d.use_note === item.name)
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'frequencyList', 'chinaUsage', 'doseUnitList'])
  },
  mounted() {
    this.initData()
  }
}
</script>

<style lang="scss" scoped>
.new-chinese-formulation {
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
