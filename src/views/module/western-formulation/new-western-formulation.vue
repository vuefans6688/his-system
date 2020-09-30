<template>
  <div class="new-western-formulation">
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
      <div v-for="(item, index) in form.data.drug_list" :key="index" class="content">
        <el-form-item label="标题:">
          <span style="font-size: 18px;color: #666;">处方内容</span>
        </el-form-item>
        <!-- 组合 -->
        <el-form-item label="用法:">
          <el-input v-model="item.group_index_str" :maxlength="2" @keyup.native="numberInput('group_index_str')"></el-input>
        </el-form-item>
        <!-- 药品名称 -->
        <el-form-item :prop="'data.drug_list.' + index + '.name'" label="药品名称:"
          :rules="{required: true, message: '药品名称不能为空', trigger: 'blur, change'}">
          <el-autocomplete popper-class="my-autocomplete" @blur="checkName(index)" :maxlength="64" 
            v-model="item.name" :fetch-suggestions="querySearchAsync" placeholder="请输入药品名称" 
            @select="westNameSelect($event, index)" :trigger-on-focus="false" value-key="name"
            style="width: 100%;">
            <template slot-scope="props">
              <div class="think">
                <span class="name">{{ props.item.drug_name }}</span>
                <span class="spec">{{ props.item.spec_text }}</span>
                <p class="phone">{{ props.item.producer }}</p>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <!-- 包装规格 -->
        <el-form-item label="包装规格:">
          <el-input v-model="item.spec_text" :maxlength="64" placeholder="请输入规格"></el-input>
        </el-form-item>
        <!-- 用法 -->
        <el-form-item label="用法:">
          <el-autocomplete popper-class="my-autocomplete" v-model="item.use_method" 
             :fetch-suggestions="usageSearch" placeholder="请输入用法" style="width: 100%;">
          </el-autocomplete>
        </el-form-item>
        <!-- 单次剂量 -->
        <el-form-item label="单次剂量:">
          <el-input v-model="item.dosage" :maxlength="8" @keyup.native="priceInput('dosage', 4)" style="width: 50%;"></el-input>
          <el-autocomplete popper-class="my-autocomplete" v-model="item.dose_unit" 
             :fetch-suggestions="doseunitSearch" placeholder="请输入剂量单位" style="width: 50%;">
          </el-autocomplete>
        </el-form-item>
        <!-- 用药频次 -->
        <el-form-item label="用药频次:">
          <el-autocomplete :maxlength="64" v-model="item.frequency"  style="width: 100%;"
            :fetch-suggestions="timesSearch" placeholder="请输入用药频次">
          </el-autocomplete>
        </el-form-item>
        <!-- 天数 -->
        <el-form-item label="天数:">
          <el-input v-model="item.days" @keyup.native="numberInput('days')" :maxlength="2"></el-input>
        </el-form-item>
        <!-- 开药数量 -->
        <el-form-item label="开药数量:">
          <el-input v-model="item.total" @keyup.native="numberInput('total')" style="width: 50%;"></el-input>
          <el-autocomplete popper-class="my-autocomplete" v-model="item.total_unit" style="width: 50%;" 
            :fetch-suggestions="totalunitSearch" placeholder="请输入单位">
          </el-autocomplete>
        </el-form-item>
        <!-- 操作 -->
        <el-form-item prop="del">
          <el-button type="danger" plain @click="del(index)" class="el-icon-delete">删除模板</el-button>
          <el-button type="primary" plain @click="addFormItem" class="el-icon-plus">增加模板</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit, floatLimit } from '@/utils/inputLimit'
const templateTypeNames = ['', '门诊病历', '西/成药']
export default {
  data() {
    return {
      // 表单数据
      form: {
        clinic_id: '',
        template_id: '',
        name: '',  // 模板名字
        type: -1,  // 类型默认值
        owner_type_str: '',  // 模板类型
        owner_type: 0,  // 类型整数，默认个人
        data: {
          drug_list: [  // 处方列表
            {
              group_index_str: '',
              drug_id: 'none',
              drug_type: 0,
              name: '',
              spec_text: '',
              producer: '',
              use_method: '',
              dosage: 0,
              dose_unit: '',
              frequency: '',
              days: 0,
              total: 0,
              total_unit: ''
            }
          ]
        }  
      },
      title: '新增西/成药处方模板',
      isNew: true,
      doseUnit: [
        { name: 'g' },
        { name: 'mg' },
        { name: 'ml' },
        { name: 'ug' },
        { name: '板' },
        { name: '小包' },
        { name: '小袋' },
        { name: '粒' },
        { name: '片' },
        { name: '枚' },
        { name: '张' },
        { name: '贴' },
        { name: '支' },
        { name: '只' },
        { name: '饼' },
        { name: '袋' },
        { name: '盒' },
        { name: '桶' },
        { name: '单位' },
        { name: '万单位' },
        { name: '把' },
        { name: '%' }
      ],
      usage: [  // 用法
        { name: '口服' },
        { name: '冲服' },
        { name: '外用' },
        { name: '滴眼' },
        { name: '灌肠' },
        { name: '雾化' },
        { name: '皮下注射' },
        { name: '肌肉注射' },
        { name: '静脉注射' },
        { name: '静脉滴注' },
        { name: '肌肉注射皮试' },
        { name: '静脉滴注皮试' },
        { name: '雾化皮试' },
        { name: '穴位注射' },
        { name: '局部封闭' }
      ],
      frequency: [  // 频次
        { name: '每日一次(qd)', index: 1 },
        { name: '每日二次(bid)', index: 2 },
        { name: '每日三次(tid)', index: 3 },
        { name: '每日四次(qid)', index: 4 },
        { name: '隔日一次(qod)', index: 5 },
        { name: '必要时(prn)', index: 6 },
        { name: '每周一次(pw)', index: 7 },
        { name: '立即(st)', index: 8 }
      ],
      totalUnit: [
        { name: '盒' },
        { name: '袋' },
        { name: '包' },
        { name: 'ug' },
        { name: 'mg' },
        { name: 'ml' },
        { name: 'kg' },
        { name: 'g' },
        { name: '单位' },
        { name: '瓶' },
        { name: '桶' },
        { name: '万单位' },
        { name: '把' },
        { name: '板' },
        { name: '小包' },
        { name: '小袋' },
        { name: '粒' },
        { name: '枚' },
        { name: '片' },
        { name: '张' },
        { name: '只' },
        { name: '支' },
        { name: '贴' },
        { name: '%' }
      ]
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
        this.form.type = 2
        this.form.owner_type_str = '个人'
      } else {
        this.title = '修改' + templateTypeNames[tplType] + '模板'
        this.isNew = false
        this.form.data = data.data
        this.form.type = 2
        this.form.name = data.name
        this.form.owner_type_str = (data.owner_type === 0 || data.owner_type === '个人模板') ? '个人' : '通用'
        this.form.template_id = data.template_id
      }
    },
    checkName(index) {  // 检验名字
      const medList = this.form.data.drug_list[index]
      if (medList.name !== medList.medName) {
        medList.drug_id = 'none'
      }
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
        if (v.spec_text.length > 64) {
          return preStr + '药品规格长度不能超64个字符'
        }
        if (!v.use_method) {
          return preStr + '请输入药品用法'
        }
        if (v.use_method.length > 64) {
          return preStr + '用法长度不能超64个字符'
        }
        if (!v.dosage) {
          return preStr + '请输入药品剂量'
        }
        if (!v.dose_unit) {
          return preStr + '请输入药品剂量单位'
        }
        if (v.dose_unit.length > 64) {
          return preStr + '剂量单位长度不能超64个字符'
        }
        if (!v.frequency) {
          return preStr + '请输入用药频次'
        }
        if (v.frequency.length > 64) {
          return preStr + '用药频次长度不能超64个字符'
        }
        if (!v.days) {
          return preStr + '请输入开药天数'
        }
        if (!v.total) {
          return preStr + '请输入开药数量'
        }
        if (!v.total_unit) {
          return preStr + '请输入开药数量单位'
        }
        if (v.total_unit.length > 64) {
          return preStr + '开药数量长度不能超64个字符'
        }
      }
      return ''
    },
    save() {
      this.findStrThatNeedToChange('dosage', 'days', 'total')
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
      for (let i = 0; i < this.form.data.drug_list.length; i++) {
        this.form.data.drug_list[i][str] = intLimit(this.form.data.drug_list[i][str])
      }
    },
    priceInput(str, bit) {  // 限制小数输入
      for (let i = 0; i < this.form.data.drug_list.length; i++) {
        this.form.data.drug_list[i][str] = floatLimit(this.form.data.drug_list[i][str], bit)
      }
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
      if (this.form.data.drug_list.length >= 5) {
        this.$message({ message: '单个处方最多5种药品', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      const json = {
        group_index_str: '',
        drug_id: 'none',
        drug_type: 0,
        name: '',
        spec_text: '',
        producer: '',
        use_method: '',
        dosage: 0,
        dose_unit: '',
        frequency: '',
        days: 0,
        total: 0,
        total_unit: ''
      }
      this.form.data.drug_list.push(json)
    },
    del(index) {
      if (this.form.data.drug_list.length <= 1) {
        return
      }
      this.form.data.drug_list.splice(index, 1)
    },
    // 联想
    querySearchAsync(queryString, callback) {  // 药名联想
      clearTimeout(this.timeout)
      this.$http.post('/service/prescription/search_drug', {
        head: {
          accessToken: this.token,  // 用户身份标识，必选参数
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
    doseunitSearch(queryString, callback) {  // 剂量单位联想
      const results = queryString ? this.doseUnit.filter(this.createFilter(queryString)) : this.doseUnit
      // 调用 callback 返回建议列表的数据
      callback(results)
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
    totalunitSearch(queryString, callback) {  // 数量单位联想
      const results = queryString ? this.totalUnit.filter(this.createFilter(queryString)) : this.totalUnit
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
        this.$message({ message: '该药品已存在！', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      this.form.data.drug_list[index].name = item.drug_name
      this.form.data.drug_list[index].drug_id = item.drug_id
      this.form.data.drug_list[index].medName = item.drug_name  // 保存药名检测
      this.$http.post('/service/prescription/drug_info', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: '',
        },
        body: {
          clinic_id: this.clinic,
          drug_id: item.drug_id
        }
      }).then(res => {
        if (res.data.data) {
          this.validation = false
          this.form.data.drug_list[index].spec_text = res.data.data.specs_txt
          this.form.data.drug_list[index].use_method = res.data.data.yongfa
          this.form.data.drug_list[index].dosage = res.data.data.useunit.specs_unit
          this.form.data.drug_list[index].dose_unit = res.data.data.useunit.specs_name
          this.form.data.drug_list[index].days = res.data.data.usedall_days
          this.form.data.drug_list[index].total = res.data.data.useall.specs_unit
          this.form.data.drug_list[index].total_unit = res.data.data.useall.specs_name
          this.form.data.drug_list[index].frequency = this.frequency[res.data.data.usedaily_times - 1].name
        }
      }).catch()
    },
    // 搜索需要转化的字段
    findStrThatNeedToChange() {
      this.form.data.drug_list.forEach((drug, index) => {
        const items = Array.prototype.slice.call(arguments)
        items.forEach(name => this.form.data.drug_list[index][name] = this.stringToNumber(drug[name]))
      })
    },
    // 字符串转化为数字
    stringToNumber(str) {
      return parseFloat(str)
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
.new-western-formulation {
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
