<template>
  <div class="infusion">
    <el-form :model="infusionMedForm" ref="infusionMedForm" size="small">
      <el-form-item v-for="(infusionMedForm, index1) in InfusionArr2" :key="index1">
        <el-form-item>
          <div class="team-1">
            <strong>输液组 {{ index1 + 1 }}</strong>
            <span @click="delForm(index1)" v-show="!infusionMedPre.infusionPreStatus.isDisabled">删除该组</span>
            <span @click="addForm('infusionMedForm')" v-show="!infusionMedPre.infusionPreStatus.isDisabled">新增输液组</span>
          </div>
        </el-form-item>
        <!-- 第零行 -->
        <el-form-item>
          <el-row>
            <el-col :span="1">序号</el-col>
            <el-col :span="5">药品名称</el-col>
            <el-col :span="4">规格</el-col>
            <el-col :span="3">单次剂量</el-col>
            <el-col :span="2">皮试</el-col>
            <el-col :span="3">数量</el-col>
            <el-col :span="2">单价</el-col>
            <el-col :span="2">金额</el-col>
            <el-col :span="2">操作</el-col>
          </el-row>
        </el-form-item>
        <!-- 第一行 -->
        <el-form-item v-for="(item, index2) in infusionMedForm.drug_list" :key="index2">
          <!-- 序号 -->
          <el-col :span="1">
            <el-form-item>
              <span>{{ (index2 + 1) }}</span>
            </el-form-item>
          </el-col>
          <!-- 药品名称 -->
          <el-col :span="5">
            <el-form-item>
              <el-autocomplete popper-class="my-autocomplete" v-model="item.name" 
                @focus="addFormItem(index1, index2)" @blur="checkName(index1, index2)" 
                :fetch-suggestions="querySearchAsync" placeholder="请输入药品名" 
                @select="infusionNameSelect($event, index1, index2)" :trigger-on-focus="false" 
                 :disabled="infusionMedPre.infusionPreStatus.isDisabled" value-key="name">
                <template slot-scope="props">
                  <div class="think">
                    <span>{{ props.item.drug_name }}</span>
                    <span>{{ props.item.spec_text }}</span>
                    <p>{{ props.item.producer }}</p>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
          <!-- 规格 -->
          <el-col :span="4">
            <el-form-item>
              <span>{{ item.spec_text }}</span>
            </el-form-item>
          </el-col>
          <!-- 单次剂量 -->
          <el-col :span="3">
            <el-form-item>
              <el-input v-model="item.dosage" @keyup.native="numberInput1(index1, index2, 'dosage')" :disabled="infusionMedPre.infusionPreStatus.isDisabled"></el-input>
              <span>{{ item.dose_unit }}</span>
            </el-form-item>
          </el-col>
          <!-- 皮试 -->
          <el-col :span="2">
            <el-form-item prop="skin_test">
              <el-checkbox v-model="item.skin_test" :disabled="infusionMedPre.infusionPreStatus.isDisabled"></el-checkbox>
            </el-form-item>
          </el-col>
          <!-- 数量 -->
          <el-col :span="3">
            <el-form-item>
              <el-input v-model="item.total" @keyup.native="numberInput1(index1, index2, 'total', 4)" @change="calculate(index1, index2)" :disabled="infusionMedPre.infusionPreStatus.isDisabled"></el-input>
              <span>{{ item.total_unit }}</span>
            </el-form-item>
            <span v-if="item.total > item.totalNum">药品库存不足</span>
          </el-col>
          <!-- 单价 -->
          <el-col :span="2">
            <el-form-item prop="price">
              <span>￥ {{ item.price | priceFilter }}</span>
            </el-form-item>
          </el-col>
          <!-- 金额 -->
          <el-col :span="2">
            <el-form-item prop="temperature">
              <span>￥ {{ item.total_price | priceFilter }}</span>
            </el-form-item>
          </el-col>
          <!-- 操作 -->
          <el-col :span="2">
            <el-form-item prop="temperature">
              <i class="el-icon-delete" @click="del(index1, index2)" v-show="!infusionMedPre.infusionPreStatus.isDisabled"></i>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item>
          <span @click="addFormItem(index1, InfusionArr2[index1].drug_list.length - 1)" v-show="!infusionMedPre.infusionPreStatus.isDisabled">
            <i class="el-icon-circle-plus-outline"></i> 增加一行
          </span>
          <span class="total-money">
            合计: <strong>{{ infusionMedForm.totalMoney | priceFilter }}</strong>元
          </span>
        </el-form-item> 
        <!-- 第二行 -->
        <el-form-item>
          <!-- 用法 -->
          <el-col :span="6">
            <el-form-item prop="use_method" label="用法">
              <el-autocomplete popper-class="my-autocomplete" v-model="infusionMedForm.use_method" 
                 :fetch-suggestions="usageSearch" placeholder="请输入用法" 
                :disabled="infusionMedPre.infusionPreStatus.isDisabled">
              </el-autocomplete>
            </el-form-item>
            <!-- 频次 -->
          </el-col>
          <el-col :span="6">
            <el-form-item prop="frequency">
              <span>频次: </span>
              <el-select v-model="infusionMedForm.frequency" :disabled="infusionMedPre.infusionPreStatus.isDisabled">
                <el-option v-for="(val, index) in frequencyList" :key="index" :label="val.name" :value="val.name"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 滴速 -->
          <el-col :span="6">
            <el-form-item prop="infusion_speed">
              <span>滴速: </span>
              <el-input @keyup.native="numberInput2(index1, 'infusion_speed')" v-model="infusionMedForm.infusion_speed" :disabled="infusionMedPre.infusionPreStatus.isDisabled"></el-input>
              <el-select placeholder="滴速" v-model="infusionMedForm.infu_speed_unit" :disabled="infusionMedPre.infusionPreStatus.isDisabled">
                <el-option label="g/分钟" value="g/分钟"></el-option>
                <el-option label="ml/分钟" value="ml/分钟"></el-option>
                <el-option label="ml/小时" value="ml/小时"></el-option>
                <el-option label="分钟/次" value="分钟/次"></el-option>
                <el-option label="ug/分钟" value="ug/分钟"></el-option>
                <el-option label="滴/分钟" value="滴/分钟"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <!-- 第三行 -->
        <el-form-item>
          <el-col :span="7">
            <el-form-item label="开始日期">
              <el-date-picker type="date" v-model="infusionMedForm.begin_date" placeholder="选择日期" :clearable="false" :editable="false" :disabled="infusionMedPre.infusionPreStatus.isDisabled"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="days" label="连续天数">
              <el-input @keyup.native="numberInput2(index1, 'days')" v-model="infusionMedForm.days" :disabled="infusionMedPre.infusionPreStatus.isDisabled"></el-input>
              <span>天</span>
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form-item>
    </el-form>
    <div class="charge-icon" v-show="infusionMedPre.infusionPreStatus.isIconShow"></div>
    <!-- 底部 -->
    <div class="doctor-message">
      <span class="name">医生: {{ patientMsg.doctorTip.name }}</span>
      <el-button type="primary" @click="submitForm('infusionMedForm')" v-show="!infusionMedPre.infusionPreStatus.isDisabled" size="mini">保存</el-button>
      <el-button type="primary" v-show="infusionMedPre.infusionPreStatus.isDisabled" @click="modifyPrescript" size="mini">修改</el-button>
      <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
import { floatLimit } from '@/utils/inputLimit'
import service from '@/utils/request'
import { presSearchDrug, presDrugInfo, addPre, modifyPre } from '@/serve/api'
import savePreFunc from './savePreFunc'
export default {
  data() {
    return {
      infusionMedForm: {   // 单个输液组
        drug_list: [
          {
            name: '',   // 药品名
            spec_text: '',
            dosage: '',    // 剂量
            dose_unit: '',      // 剂量(单位)
            skin_test: false,     // 皮试
            total: '',           // 数量
            total_unit: '',     // 数量单位
            price: 0,        // 单价
            total_price: 0    // 金额
          }
        ],
        use_method: '',        // 用法
        frequency: '',      // 频次
        infusion_speed: '',     // 滴速
        infu_speed_unit: '',     // 滴速(单位)
        begin_date: new Date(),        // 日期
        days: ''      // 天数
      },
      // 用于克隆的模板
      infusionMedForm2: {
        totalMoney: 0,    // 总价
        drug_list: [
          {
            name: '',   // 药品名
            spec_text: '',
            dosage: '',    // 剂量
            dose_unit: '',      // 剂量(单位)
            skin_test: false,     // 皮试
            total: '1',           // 数量
            total_unit: '',     // 数量单位
            price: 0,        // 单价
            total_price: 0     // 金额
          }
        ],
        use_method: '',        // 用法
        frequency: '',      // 频次
        infusion_speed: '',     // 滴速
        infu_speed_unit: '',     // 滴速(单位)
        begin_date: '',        // 日期
        days: ''     // 天数
      },
      timeout: null
    }
  },
  methods: {
    numberInput1(index1, index2, key, num = 2) { // 限制数字输入
      this.InfusionArr2[index1].drug_list[index2][key] = floatLimit(this.InfusionArr2[index1].drug_list[index2][key], num)
    },
    numberInput2(index1, key) { // 限制数字输入
      this.InfusionArr2[index1][key] = floatLimit(this.InfusionArr2[index1][key], 2)
    },
    addFormItem(index1, index2) {
      if (index2 === this.InfusionArr2[index1].drug_list.length - 1 && index2 < 9) {
        const obj = {
          name: '',   // 药品名
          spec_text: '',
          dosage: '',    // 剂量
          dose_unit: '',      // 剂量(单位)
          skin_test: false,     // 皮试
          total: '1',           // 数量
          total_unit: '',     // 数量单位
          price: 0,        // 单价
          total_price: 0     // 金额
        }
        this.InfusionArr2[index1].drug_list.push(obj)
      }
    },
    checkName(index1, index2) {
      if (this.InfusionArr2[index1].drug_list[index2].name !== this.InfusionArr2[index1].drug_list[index2].medName) {
        this.InfusionArr2[index1].drug_list[index2].name = ''
        this.InfusionArr2[index1].drug_list[index2].drug_id = ''
        this.InfusionArr2[index1].drug_list[index2].spec_text = ''
        this.InfusionArr2[index1].drug_list[index2].dosage = ''
        this.InfusionArr2[index1].drug_list[index2].dose_unit = ''
        this.InfusionArr2[index1].drug_list[index2].skin_test = false
        this.InfusionArr2[index1].drug_list[index2].total = ''
        this.InfusionArr2[index1].drug_list[index2].total_unit = ''
        this.InfusionArr2[index1].drug_list[index2].price = 0
        this.InfusionArr2[index1].drug_list[index2].total_price = 0
        this.calculateAll()
      }
    },
    del(index1, index2) {
      if (this.InfusionArr2[index1].drug_list.length <= 1) {
        return
      }
      this.InfusionArr2[index1].drug_list.splice(index2, 1)
      this.calculateAll()
    },
    querySearchAsync(queryString, callback) {  // 药名联想
      clearTimeout(this.timeout)
      service(presSearchDrug, {
        drug_name: queryString,
        drug_type: 0
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (!res.data) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.data)
          }
        }
      }).catch(() => {
        callback([])
      })
    },
    infusionNameSelect(item, index1, index2) {   // 药名选择事件
      const obj = this.InfusionArr2[index1].drug_list.find(val => item.drug_id === val.drug_id)
      if (obj) {
        this.$message({ message: '该药品已存在！', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.InfusionArr2[index1].drug_list[index2].name = item.drug_name
      this.InfusionArr2[index1].drug_list[index2].spec_text = item.spec_text
      this.InfusionArr2[index1].drug_list[index2].drug_id = item.drug_id
      this.InfusionArr2[index1].drug_list[index2].medName = item.drug_name  //  保存药名检测
      service(presDrugInfo, {
        drug_id: item.drug_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res) {
            this.InfusionArr2[index1].drug_list[index2].dosage = res.useunit.specs_unit === 0 ? '' : res.useunit.specs_unit.toString()
            this.InfusionArr2[index1].drug_list[index2].dose_unit = res.useunit.specs_name
            this.InfusionArr2[index1].drug_list[index2].total = res.useall.specs_unit === 0 ? '' : res.useall.specs_unit + ''
            this.InfusionArr2[index1].drug_list[index2].total_unit = res.useall.specs_name
            this.InfusionArr2[index1].drug_list[index2].price = res.cf_price
            // 保存库存进行检测
            this.InfusionArr2[index1].drug_list[index2].totalNum = res.count_ulunit
            this.calculate(index1, index2)
          } else {
            this.$message({ message: '库存0', type: 'error', showClose: true, duration: 1000 })
          }
        }
      })
    },
    usageSearch(queryString, callback) {  // 用法联想
      const westUsageArr = this.usageList
      const results = queryString ? westUsageArr.filter(this.createFilter(queryString)) : westUsageArr
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    // 使用频率联想
    TimesSearch(queryString, callback) {
      const medicine = this.frequencyList
      const results = queryString ? Medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    createFilter(queryString) {
      return array => array.name.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
    },
    calculate(index1, index2) {  // 计算金额
      const drugList = this.InfusionArr2[index1].drug_list[index2]
      drugList.total_price = drugList.total * drugList.price  // 计算当前价格
      if (drugList.total > drugList.totalNum) {
        this.$message({ message: `库存量为：${drugList.totalNum}${drugList.total_unit}`, type: 'error', showClose: true, duration: 1000 })
      }
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      this.InfusionArr2.forEach(val => {
        let sum = 0
        val.drug_list.forEach(val2 => sum += val2.total_price)
        val.totalMoney = sum
      })
    },
     // 保存
    submitForm(formName) {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      if (!this.patientMsg.medicalRecordsForm.medical_id) {
        this.$message({ message: '请先填写病历', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      let valid = true
      // 校验药品名
      this.InfusionArr2.forEach(group => group.drug_list = group.drug_list.filter(drug => drug.name))
      // 校验剂量
      this.InfusionArr2.forEach(group => {
        group.drug_list.forEach(drug => {
          if (!drug.dosage || drug.dosage === '0') {
            this.$message({ message: '请填写单次剂量', type: 'error', showClose: true, duration: 1000 })
            valid = false
          }
        })
      })
      // 校验数量
      this.InfusionArr2.forEach(group => {
        group.drug_list.forEach(drug => {
          if (!drug.total || drug.total === '0') {
            this.$message({ message: '请填写数量', type: 'error', showClose: true, duration: 1000 })
            valid = false
          }
        })
      })
      // 校验用法
      this.InfusionArr2.forEach(group => {
        if (!group.use_method) {
          this.$message({ message: '请填写用法', type: 'error', showClose: true, duration: 1000 })
          valid = false
        }
      })
      // 校验频次
      this.InfusionArr2.forEach(group => {
        if (!group.frequency) {
          this.$message({ message: '请选择频次', type: 'error', showClose: true, duration: 1000 })
          valid = false
        }
      })
      // 校验滴数
      this.InfusionArr2.forEach(group => {
        if (!group.infusion_speed || group.infusion_speed === '0') {
          this.$message({ message: '请选择滴数', type: 'error', showClose: true, duration: 1000 })
          valid = false
        }
      })
      // 校验滴数单位
      this.InfusionArr2.forEach(group => {
        if (!group.infu_speed_unit) {
          this.$message({ message: '请选择滴数单位', type: 'error', showClose: true, duration: 1000 })
          valid = false
        }
      })
      // 校验天数
      this.InfusionArr2.forEach(group => {
        const days = Number(group.days)
        if (!days || days === 0 || days >= 100) {
          this.$message({ message: '天数格式错误', type: 'error', showClose: true, duration: 1000 })
          valid = false
        }
      })
      if (!valid) {
        return
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          delete (this.infusionMedPre.infusionMedForm.flag)
          // 调用处理处方函数
          this.patientMsg.presForm = savePreFunc.allChange(this.patientMsg)
          // 调用保存处方
          this.savePre()
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    savePre() {  // 保存处方
      service(addPre, {
        prescriptions: this.patientMsg.presForm
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ type: 'success', message: '保存成功', showClose: true, duration: 1000 })
          this.infusionMedPre.infusionPreStatus.isDisabled = true  // 保存按钮改变
          const sum = this.patientMsg.presForm.findIndex(val => val.prescript_id === '')
          if (sum !== -1) {
            this.infusionMedPre.infusionMedForm.prescript_id = res[sum].prescript_id
          }
          // 1绑定信息 2处方id 3挂号id 4处方类别（1西药 2中药 3输液）
          if (this.patientMsg.details.szsbcardid && this.shebao.hospitalCode) {  // 存在电脑号则走智慧医保
            const prescriptId = this.infusionMedPre.infusionMedForm.prescript_id || res[sum].prescript_id
            savePreFunc.sbAudit(this.shebao, prescriptId, this.patientMsg, 3)  // 智慧医保处方审批
          }
        }
      })
    },
    addForm() {
      let flag = true
      this.InfusionArr2.forEach(val => {
        val.drug_list.forEach(val2 => {
          if (val2.name === '') {
            flag = false
          }
        })
      })
      if (!flag) {
        this.$message({ message: '该组内容不能留空', type: 'error', showClose: true, duration: 1000 })
        return
      }
      if (this.infusionMedPre.InfusionArr.length >= 64) {
        this.$message({ message: '单个处方最多64个分组', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const copy = deepClone(this.infusionMedForm2)
      copy.begin_date = new Date()
      this.infusionMedPre.InfusionArr.push(copy)
    },
    delForm(index) {
      if (this.InfusionArr2.length <= 1) {
        return
      }
      this.infusionMedPre.InfusionArr.splice(index, 1)
    },
    modifyPrescript() {  // 修改
      service(modifyPre, {
        regist_id: this.patientMsg.registid,
        prescript_id: this.infusionMedPre.infusionMedForm.prescript_id,
        prescript_type: 3,
        status: -1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res.status === 0) {
            this.infusionMedPre.infusionPreStatus.isDisabled = false  // 可修改处方
          } else {
            this.infusionMedPre.infusionPreStatus.isIconShow = true
            this.$message({ message: '该处方已缴费', type: 'error', showClose: true, duration: 1000 })
          }
        }
      })
    }
  },
  computed: {
    ...mapGetters([ 'token', 'user', 'clinic', 'shebao', 'frequencyList', 'usageList'])
  },
  props: ['InfusionArr2', 'infusionMedPre', 'patientMsg', 'infusionId']
}
</script>

<style lang="scss" scoped>
.doctor-message {
  text-align: right;
  margin-right: 5px;
  .name {
    margin-right: 20px;
    color: #09f;
  }
}
</style>
