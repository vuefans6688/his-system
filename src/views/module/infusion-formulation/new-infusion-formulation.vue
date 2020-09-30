<template>
  <div class="new-infusion-formulation">
    <div class="header">
      <h3 class="title">{{ title }}</h3>
      <div class="action">
        <el-button type="primary" @click="submit('form')" size="small">保存</el-button>
        <el-button type="warning" @click="cancel" size="small">取消</el-button>
      </div>
    </div>
    <el-form :model="form" ref="form" :rules="infusionRules" size="small" label-width="90px">
      <el-form-item label="模板名称:" prop="name" style="width: 70%;"
        :rules="{ required: true, message: '模板名称不能为空', trigger: 'blur,change' }">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="模板类型:">
        <el-radio-group v-model="form.owner_type_str">
        <el-radio label="个人"></el-radio>
        <el-radio label="通用"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form :model="form.data" ref="groupList" size="small" label-width="90px">
        <div v-for="(group, index1) in form.data.groupList" :key="index1" class="content">
          <el-form-item label="标题:">
            <span style="font-size: 18px;color: #666;">处方内容</span>
          </el-form-item>
          <el-form-item label="组项:">
            <strong style="color: #42b983;font-size: 18px;">第{{ index1 + 1 }}组</strong>
            <el-button type="text" @click="delGroup(index1)" style="color: #f00;margin-left: 20px;">删除输液组</el-button>
            <el-button type="text" @click="addGroup">新增输液组</el-button>
          </el-form-item>
          <div v-for="(item, index2) in group.drug_list" :key="index2">
            <!-- 序号 -->
            <el-form-item label="序号:">
              <span style="color: #42b983;font-size: 18px;">({{ index2 + 1 }})</span>
            </el-form-item>
            <!-- 药品名称 -->
            <el-form-item label="药品名称:">
              <el-autocomplete popper-class="my-autocomplete" v-model="item.name" 
                :fetch-suggestions="querySearchAsync" placeholder="请输入药品名称"
                @select="westNameSelect($event, index1, index2)" :trigger-on-focus="false" 
                 @blur="checkName(index1, index2)" style="width: 100%;" value-key="name">
                <template slot-scope="props">
                  <div class="think">
                    <span class="name">{{ props.item.drug_name }}</span>
                    <span class="spec">{{ props.item.spec_text }}</span>
                    <p class="producer">{{ props.item.producer }}</p>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <!-- 规格 -->
            <el-form-item label="规格:">
              <el-input v-model="item.spec_text" placeholder="请输入药品规格"></el-input>
            </el-form-item>
            <!-- 单次剂量 -->
            <el-form-item label="单次剂量:">
              <el-input v-model="item.dosage" @keyup.native="floatLimitDrug('dosage', 4)" style="width: 50%;"></el-input>
              <el-autocomplete popper-class="my-autocomplete" v-model="item.dose_unit" style="width: 50%;"
                 :fetch-suggestions="doesUnitSearch" placeholder="请输入剂量">
              </el-autocomplete>
            </el-form-item>
            <!-- 皮试 -->
            <el-form-item label="皮试:">
              <el-checkbox v-model="item.skin_test" :true-label="1" :false-label="0"></el-checkbox>
            </el-form-item>
            <!-- 数量 -->
            <el-form-item label="数量:">
              <el-input v-model="item.total" @keyup.native="numberLimitDrug('total')" style="width: 50%;"></el-input>
              <el-autocomplete popper-class="my-autocomplete" v-model="item.total_unit" style="width: 50%;" 
                 :fetch-suggestions="totalUnitSearch" placeholder="请输入单位">
              </el-autocomplete>
            </el-form-item>
            <!-- 用法 -->
            <el-form-item label="用法:">
              <el-autocomplete popper-class="my-autocomplete" v-model="group.use_method" style="width: 100%;"
                 :fetch-suggestions="medAskForSearch" placeholder="请输入用法">
              </el-autocomplete>
            </el-form-item>
            <!-- 频次 -->
            <el-form-item label="频次:">
              <el-autocomplete popper-class="my-autocomplete2" v-model="group.frequency" style="width: 100%;"
                 :fetch-suggestions="TimesSearch" placeholder="请输入频次">
              </el-autocomplete>
            </el-form-item>
            <!-- 滴速 -->
            <el-form-item label="滴速:">
              <el-input v-model="group.infusion_speed" @keyup.native="floatLimitGroup('infusion_speed', 4)"
                style="width: 50%;"></el-input>
              <el-autocomplete popper-class="my-autocomplete" v-model="group.infu_speed_unit" style="width: 50%;"
                 :fetch-suggestions="infuSpeedUnitSearch" placeholder="请输入滴速">
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="连续天数:">
              <el-input v-model="group.days" @keyup.native="numberLimitGroup('days')" style="width: 96%;"></el-input>
              <span style="margin-left: 5px;color: #666;">天</span>
            </el-form-item>
            <!-- 操作 -->
            <el-form-item prop="temperature">
              <el-button @click="del(index1, index2)" type="danger" plain class="el-icon-delete">删除模板</el-button>
              <el-button @click="addDrugItem(index1)" type="primary" plain class="el-icon-plus">增加模板</el-button>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit, floatLimit } from '@/utils/inputLimit'
import deepClone from '@/utils/deepClone'
const templateTypeNames = ['', '门诊病历', '西/成药', '中药', '输液']
export default {
  data() {
    return {
      infusionRules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { max: 64, message: '模板名称长度不超过64个字符', trigger: 'blur' }
        ]
      },
      // 表单数据
      form: {
        clinic_id: '',
        template_id: '',
        name: '',  // 模板名字
        type: -1,  // 类型默认值
        owner_type_str: '',   // 模板类型
        owner_type: 0,  // 类型整数，默认个人
        data: {
          groupList: [{  // 输液组合
            use_method: '',
            frequency: '',
            infusion_speed: 0.0,
            infu_speed_unit: '',
            begin_date: new Date(), 
            days: 0,
            drug_list: [{
              drug_id: 'none',
              drug_type: 0,
              name: '',
              spec_text: '',
              dosage: 0,
              dose_unit: '',
              skin_test: 0,
              total: 0,
              total_unit: ''
            }]
          }]
        }
      },
      title: '新增输液处方模板',
      isNew: true,
      isDisabled: false,   // 禁用表单
      tcmUsage: [
        { name: '静脉注射' },
        { name: '静脉滴注' },
        { name: '皮下注射' },
        { name: '肌肉注射' },
        { name: '皮内注射' },
        { name: '静脉推注' },
        { name: '体腔内注射' },
        { name: '动脉注射' },
        { name: '内心注射' }
      ],
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
      ],
      // 使用频率
      tcmTimes: [
        { name: '每日一次(qd)', index: 1 },
        { name: '每日二次(bid)', index: 2 },
        { name: '每日三次(tid)', index: 3 },
        { name: '每日四次(qid)', index: 4 },
        { name: '隔日一次(qod)', index: 5 },
        { name: '必要时(prn)', index: 6 },
        { name: '每周一次(pw)', index: 7 },
        { name: '立即(st)', index: 8 }
      ],
      infuSpeedUnit: [
        { name: 'g/分钟' },
        { name: 'ug/分钟' },
        { name: '滴/分钟' },
        { name: 'ml/分钟' },
        { name: 'ml/小时' },
        { name: '分钟/次' }
      ]
    }
  },
  methods: {
    dateString(date) {
      const year = (1900 + date.getYear()) * 10000
      const month = (1 + date.getMonth()) * 100
      const day = date.getDate()
      const str = '' + (year + month + day)
      return (str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2))
    },
    checkName(index1, index2) {  // 检验名字
      const medList = this.form.data.groupList[index1].drug_list[index2]
      if (medList.name !== medList.medName) {
        medList.drug_id = 'none'
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
        this.parseResponseData(data)
        this.form.type = tplType
        this.form.name = data.name
        this.form.owner_type_str = (data.owner_type === 0 || data.owner_type === '个人模板') ? '个人' : '通用'
        this.form.template_id = data.template_id
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
    // 中药使用频率联想
    TimesSearch(queryString, callback) {
      const medicine = this.tcmTimes
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    // 中药特殊要求联想
    medAskForSearch(queryString, callback) {
      const medicine = this.tcmUsage
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    doesUnitSearch(queryString, callback) {
      const medicine = this.doseUnit
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    totalUnitSearch(queryString, callback) {
      const medicine = this.totalUnit
      const results = queryString ? medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    infuSpeedUnitSearch(queryString, callback) {
      const medicine = this.infuSpeedUnit
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
      for (let n = 0; n < this.form.data.groupList.length; n++) {
        for (let i = 0; i < this.form.data.groupList[n].drug_list.length; i++) {
          const v = this.form.data.groupList[n].drug_list[i]
          const preStr = '第' + (n + 1) + '组第' + (i + 1) + '行'
          if (!v.name) {
            return preStr + '请输入药品名称'
          }
        }
        const v = this.form.data.groupList[n]
        v.infusion_speed = parseFloat(v.infusion_speed, 10)
        v.days = parseInt(v.days, 10)
      }
      for (let n = 0; n < this.form.data.groupList.length; n++) {
        for (let i = 0; i < this.form.data.groupList[n].drug_list.length; i++) {
          const v = this.form.data.groupList[n].drug_list[i]
          v.group_index_str = '' + (n + 1)
          v.use_method = this.form.data.groupList[n].use_method
          v.frequency = this.form.data.groupList[n].frequency
          v.infusion_speed = this.form.data.groupList[n].infusion_speed
          v.infu_speed_unit = this.form.data.groupList[n].infu_speed_unit
          v.begin_date = this.form.data.groupList[n].begin_date
          v.days = this.form.data.groupList[n].days
        }
      }
      return ''
    },
    makePostData() {
      const data = { 
        drug_list: [] 
      }
      for (let n = 0; n < this.form.data.groupList.length; n++) {
        for (let i = 0; i < this.form.data.groupList[n].drug_list.length; i++) {
          data.drug_list.push(this.form.data.groupList[n].drug_list[i])
        }
      }
      const formData = deepClone(this.form)
      formData.data = data
      return formData
    },
    parseResponseData(resp) {
      this.form.create_time = resp.create_time
      this.form.creator_id = resp.creator_id
      this.form.name = resp.name
      this.form.owner_type = resp.owner_type
      this.form.template_id = resp.template_id
      this.form.type = resp.type
      const data = { 
        groupList: [] 
      }
      for (let i = 0; i < resp.data.drug_list.length; i++) {
        const n = parseInt(resp.data.drug_list[i].group_index_str, 10);
        if (n > data.groupList.length) {  // 新增组
          for (let k = 0; k < (n - data.groupList.length); k++) {
            const json = {
              use_method: '',
              frequency: '',
              infusion_speed: 0.0,
              infu_speed_unit: '',
              begin_date: '',
              days: 0,
              drug_list: []
            }
            data.groupList.push(json)
          }
        }
        const group = data.groupList[n - 1]
        group.use_method = resp.data.drug_list[i].use_method
        group.frequency = resp.data.drug_list[i].frequency
        group.infusion_speed = resp.data.drug_list[i].infusion_speed
        group.infu_speed_unit = resp.data.drug_list[i].infu_speed_unit
        group.begin_date = new Date(Date.parse(resp.data.drug_list[i].begin_date))
        group.days = resp.data.drug_list[i].days
        group.drug_list.push(resp.data.drug_list[i])
      }
      this.form.data = data
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
      const data = {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: this.makePostData()
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
    // 限制drug数字输入
    numberLimitDrug(str) {
      this.form.data.groupList.forEach((group, index1) => {
        group.drug_list.forEach((drug, index2) => {
          this.form.data.groupList[index1].drug_list[index2][str] = intLimit(drug[str])
        })
      })
    },
    // 限制药的小数输入
    floatLimitDrug(str, bit) {
      this.form.data.groupList.forEach((group, index1) => {
        group.drug_list.forEach((drug, index2) => {
          this.form.data.groupList[index1].drug_list[index2][str] = floatLimit(drug[str], bit)
        })
      })
    },
    // 限制组的小数输入
    floatLimitGroup(str, bit) {
      this.form.data.groupList.forEach((group, index) => {
        this.form.data.groupList[index][str] = floatLimit(group[str], bit)
      })
    },
    // 限制组数字输入
    numberLimitGroup(str) {
      this.form.data.groupList.forEach((group, index) => {
        this.form.data.groupList[index][str] = intLimit(group[str])
      })
    },
    delGroup(index) {
      if (this.form.data.groupList.length <= 1) {
        this.$message({ message: '最少保留一个组', type: 'error', showClose: true, duration: 1000 })
        return;
      }
      this.form.data.groupList.splice(index, 1)
    },
    addGroup() {
      if (this.form.data.groupList.length >= 64) {
        this.$message({ message: '单个处方最多64个分组', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const json = {
        use_method: '',
        frequency: '',
        infusion_speed: 0.0,
        infu_speed_unit: '',
        begin_date: new Date(),
        days: 0,
        drug_list: [{
          drug_id: 'none',
          drug_type: 0,
          name: '',
          spec_text: '',
          dosage: 0,
          dose_unit: '',
          skin_test: 0,
          total: 0,
          total_unit: ''
        }]
      }
      this.form.data.groupList.push(json)
    },
    addDrugItem(index1) {
      let flag = true
      this.form.data.groupList[index1].drug_list.forEach(val => {
        if (!val.name) {
          flag = false
        }
      })
      if (!flag) {
        this.$message({ message: '内容为空不能新增一行', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      if (this.form.data.groupList[index1].drug_list.length >= 64) {
        this.$message({ message: '单个处方最多64种药品', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const json = {
        drug_id: 'none',
        drug_type: 0,
        name: '',
        spec_text: '',
        dosage: 0,
        dose_unit: '',
        skin_test: 0,
        total: 0,
        total_unit: ''
      }
      this.form.data.groupList[index1].drug_list.push(json)
    },
    del(index1, index2) {
      if (this.form.data.groupList[index1].drug_list.length <= 1) {
        return
      }
      this.form.data.groupList[index1].drug_list.splice(index2, 1)
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
    westNameSelect(item, index1, index2) {
      this.form.data.groupList[index1].drug_list[index2].name = item.drug_name
      this.form.data.groupList[index1].drug_list[index2].drug_id = item.drug_id
      this.form.data.groupList[index1].drug_list[index2].medName = item.drug_name  // 保存药名检测
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
          this.form.data.groupList[index1].drug_list[index2].spec_text = res.data.data.specs_txt
          this.form.data.groupList[index1].drug_list[index2].use_method = res.data.data.yongfa
          this.form.data.groupList[index1].drug_list[index2].dosage = res.data.data.useunit.specs_unit
          this.form.data.groupList[index1].drug_list[index2].dose_unit = res.data.data.useunit.specs_name
          this.form.data.groupList[index1].drug_list[index2].days = res.data.data.usedall_days
          this.form.data.groupList[index1].drug_list[index2].total = res.data.data.useall.specs_unit
          this.form.data.groupList[index1].drug_list[index2].total_unit = res.data.data.useall.specs_name
          this.form.data.groupList[index1].drug_list[index2].frequency = this.tcmTimes[res.data.data.usedaily_times - 1].name
          this.form.data.groupList[index1].frequency = this.tcmTimes[res.data.data.usedaily_times - 1].name
          this.form.data.groupList[index1].use_method = res.data.data.yongfa
          this.form.data.groupList[index1].days = res.data.data.usedall_days
        }
      }).catch()
    },
    // 字符串转化为数字
    stringNumber() {
      this.form.data.groupList.forEach((group, index1) => {
        this.form.data.groupList[index1].infusion_speed = parseFloat(group.infusion_speed)
        this.form.data.groupList[index1].days = parseFloat(group.days)
        group.drug_list.forEach((drug, index2) => {
          this.form.data.groupList[index1].drug_list[index2].dosage = parseFloat(drug.dosage)
          this.form.data.groupList[index1].drug_list[index2].total = parseFloat(drug.total)
        })
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
.new-infusion-formulation {
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
    width: 70%;
    .content {
      border-top: 1px dashed #ddd;
      padding-top: 10px;
    }
  }
}
</style>
