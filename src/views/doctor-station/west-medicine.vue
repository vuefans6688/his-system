<template>
  <div class="west-medicine">
    <el-form :model="westMedPre.westMedForm" ref="westMedForm" size="small">
      <el-form-item>
        <el-row class="header">
          <el-col :span="1">组合</el-col>
          <el-col :span="4">药品名称</el-col>
          <el-col :span="3">包装规格</el-col>
          <el-col :span="3">用法</el-col>
          <el-col :span="2">单次剂量</el-col>
          <el-col :span="3">用药频次</el-col>
          <el-col :span="1">天数</el-col>
          <el-col :span="2">开药数量</el-col>
          <el-col :span="2">单价</el-col>
          <el-col :span="2">金额</el-col>
          <el-col :span="1">操作</el-col>
        </el-row>
      </el-form-item>
      <el-row v-for="(item, index) in westMedPre.westMedForm.drug_list" :key="index">
        <!-- 组合 -->
        <el-col :span="1">
          <el-form-item>
            <el-input v-model="item.group_index_str" :maxlength="2" 
              @keyup.native="numberInput('group_index_str')" :disabled="westMedPre.westPreStatus.isDisabled">
            </el-input>
          </el-form-item>
        </el-col>
        <!-- 药品名称 -->
        <el-col :span="4">
          <el-form-item :prop="'drug_list.' + index + '.name'" :rules="{required: true, message: ' ', 
            trigger: 'blur, change'}">
            <el-autocomplete popper-class="my-autocomplete" @focus="addFormItem('', index)" 
              @blur="checkName(index)" :disabled="westMedPre.westPreStatus.isDisabled" 
              v-model="item.name" :fetch-suggestions="querySearchAsync" placeholder="请输入药品名" 
              @select="westNameSelect($event, index)" :trigger-on-focus="false" value-key="name">
              <template slot-scope="props">
                <div class="think">
                  <span>{{ props.item.drug_name }}</span>
                  <span>{{ props.item.spec_text }}</span>
                  <span>{{ props.item.producer }}</span>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>
        <!-- 包装规格 -->
        <el-col :span="3">
          <el-form-item prop="spec_text">
            <span>{{ item.spec_text }}</span>
          </el-form-item>
        </el-col>
        <!-- 用法 -->
        <el-col :span="3">
          <el-form-item :prop="'drug_list.' + index + '.use_method'" :rules="{required: true, message: '用法不能为空', trigger: 'blur, change'}">
            <el-autocomplete popper-class="my-autocomplete" :fetch-suggestions="usageSearch"
              :disabled="westMedPre.westPreStatus.isDisabled" v-model="item.use_method" placeholder="请输入用法">
            </el-autocomplete>
          </el-form-item>
        </el-col>
        <!-- 单次剂量 -->
        <el-col :span="2">
          <el-form-item :prop="'drug_list.' + index + '.dosage'" :rules="{required: true, message: '剂量不能为空', trigger: 'blur, change'}">
            <el-input v-model="item.dosage" @keyup.native="priceInput('dosage')" 
              :disabled="westMedPre.westPreStatus.isDisabled">
            </el-input>
            <span>{{ item.dose_unit }}</span>
          </el-form-item>
          <span v-if="item.dosage === '0'">不能为0</span>
        </el-col>
        <!-- 用药频次 -->
        <el-col :span="3">
          <el-form-item :prop="'drug_list.' + index + '.frequency'" :rules="{required: true, message: '频次不能为空', trigger: 'blur, change'}">
            <el-select v-model="item.frequency" :disabled="westMedPre.westPreStatus.isDisabled">
              <el-option v-for="(val, index) in frequencyList" :key="index" :label="val.name" 
                :value="val.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 天数 -->
        <el-col :span="1">
          <el-form-item  :prop="'drug_list.' + index + '.days'" :rules="{required: true, message: '天数不能为空', trigger: 'blur, change'}">
            <el-input v-model="item.days" @keyup.native="numberInput('days')" :maxlength="2" 
              :disabled="westMedPre.westPreStatus.isDisabled">
            </el-input>
          </el-form-item>
          <span v-if="item.days === '0'">不能为0</span>
        </el-col>
        <!-- 开药数量 -->
        <el-col :span="2">
          <el-form-item :prop="'drug_list.' + index + '.total'" :rules="{required: true, message: '开药数量不能为空', trigger: 'blur, change'}">
            <el-input v-model="item.total" @keyup.native="priceInput('total', 4)" @blur="calculate(index)" 
              :disabled="westMedPre.westPreStatus.isDisabled">
            </el-input>
            <span>{{ item.total_unit }}</span>
          </el-form-item>
          <span v-if="item.total > item.totalNum">药品库存不足</span>
          <span v-if="item.total === '0'">不能为0</span>
        </el-col>
        <!-- 单价 -->
        <el-col :span="2">
          <el-form-item prop="price">
            <span>￥ {{ item.price | priceFilter }}</span>
          </el-form-item>
        </el-col>
        <!-- 金额 -->
        <el-col :span="2">
          <el-form-item prop="total_price">
            <span>￥ {{ item.total_price | priceFilter }}</span>
          </el-form-item>
        </el-col>
        <!-- 操作 -->
        <el-col :span="1">
          <el-form-item prop="del">
            <span class="el-icon-delete" @click="del(index)" v-if="!westMedPre.westPreStatus.isDisabled"></span>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="add-total">
        <el-button type="primary" class="el-icon-circle-plus-outline" @click="addFormItem('add')" 
          v-show="!westMedPre.westPreStatus.isDisabled" size="mini">
          增加一行
        </el-button>
        <p class="money">
          合计: <strong class="price">{{ westMedPre.westMedForm.totalMoney | priceFilter }}</strong>元
        </p>
      </div>
      <div class="doctor-message">
        <span class="name">医生: {{ patientMsg.doctorTip.name }}</span>
        <el-button type="primary" @click="submitWestForm('westMedForm')" v-if="!westMedPre.westPreStatus.isDisabled" size="mini">保存</el-button>
        <el-button type="primary" v-show="westMedPre.westPreStatus.isDisabled" @click="modifyPrescript" size="mini">修改</el-button>
        <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
      </div>
    </el-form>
    <div class="charge-icon" v-show="westMedPre.westPreStatus.isIconShow"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { presSearchDrug, presDrugInfo, addPre, modifyPre } from '@/serve/api'
import { intLimit, floatLimit } from '@/utils/inputLimit'
import savePreFunc from './savePreFunc'
export default {
  methods: {
    numberInput(str) {  // 限制数字输入
      for (let i = 0; i < this.westMedPre.westMedForm.drug_list.length; i++) {
        this.westMedPre.westMedForm.drug_list[i][str] = intLimit(this.westMedPre.westMedForm.drug_list[i][str])
      }
    },
    priceInput(str, num = 3) {  // 限制小数输入
      for (let i = 0; i < this.westMedPre.westMedForm.drug_list.length; i++) {
        this.westMedPre.westMedForm.drug_list[i][str] = floatLimit(this.westMedPre.westMedForm.drug_list[i][str], num)
      }
    },
    addFormItem(act = '', index) {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      if (act === 'add' || (index === this.westMedPre.westMedForm.drug_list.length - 1 && index < 4)) {
        const json = {
          group_index_str: '',     // 组合
          drug_id: '',   // 药品id
          name: '',   // 药品名
          spec_text: '',     // 规格
          use_method: '',     // 用法
          dosage: '',    // 单次剂量
          dose_unit: '',      // 单次剂量(单位)
          frequency: '',     // 用药频次
          days: '',      // 天数
          total: '',    // 开药数量
          total_unit: '',       // 开药数量(单位)
          price: 0,     // 单价
          total_price: 0    // 金额
        }
        this.westMedPre.westMedForm.drug_list.push(json)
      }
      if (index === 4) {
        this.$message({ type: 'warning', message: '该处方药品达到上限，请新开处方单', showClose: true, duration: 1000 })
      }
    },
    del(index) {
      if (this.westMedPre.westMedForm.drug_list.length <= 1) {
        this.westMedPre.westMedForm.totalMoney = 0
        this.westMedPre.westMedForm.drug_list = [
          {
            group_index_str: '',     // 组合
            drug_id: '',   // 药品id
            name: '',   // 药品名
            spec_text: '',     // 规格
            use_method: '',     // 用法
            dosage: '',    // 单次剂量
            dose_unit: '',      // 单次剂量(单位)
            frequency: '',     // 用药频次
            days: '',      // 天数
            total: '',    // 开药数量
            total_unit: '',       // 开药数量(单位)
            price: 0,     // 单价
            total_price: 0    // 金额
          }
        ]
        return
      }
      this.westMedPre.westMedForm.drug_list.splice(index, 1)
      this.calculateAll()
    },
    checkName(index) {  // 检验名字
      if (this.westMedPre.westMedForm.drug_list[index].name !== this.westMedPre.westMedForm.drug_list[index].medName) {
        this.westMedPre.westMedForm.drug_list[index].group_index_str = ''
        this.westMedPre.westMedForm.drug_list[index].drug_id = ''
        this.westMedPre.westMedForm.drug_list[index].name = ''
        this.westMedPre.westMedForm.drug_list[index].spec_text = ''
        this.westMedPre.westMedForm.drug_list[index].use_method = ''
        this.westMedPre.westMedForm.drug_list[index].dosage = ''
        this.westMedPre.westMedForm.drug_list[index].dose_unit = ''
        this.westMedPre.westMedForm.drug_list[index].frequency = ''
        this.westMedPre.westMedForm.drug_list[index].days = ''
        this.westMedPre.westMedForm.drug_list[index].total = ''
        this.westMedPre.westMedForm.drug_list[index].total_unit = ''
        this.westMedPre.westMedForm.drug_list[index].price = 0
        this.westMedPre.westMedForm.drug_list[index].total_price = 0
        this.calculateAll()
      }
    },
    calculate(index) {  // 计算金额
      this.westMedPre.westMedForm.drug_list[index].total_price =
      this.westMedPre.westMedForm.drug_list[index].total *
        this.westMedPre.westMedForm.drug_list[index].price  // 计算当前价格
      if (this.westMedPre.westMedForm.drug_list[index].total > this.westMedPre.westMedForm.drug_list[index].totalNum) {
        this.$message({ message: `库存量为：${this.westMedPre.westMedForm.drug_list[index].totalNum}${this.westMedPre.westMedForm.drug_list[index].total_unit}`, type: 'error', showClose: true, duration: 1000 })
      }
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      let sum = 0
      this.westMedPre.westMedForm.drug_list.forEach(val => sum += val.total_price)
      this.westMedPre.westMedForm.totalMoney = sum  // 超出库存提示
    },
    resetForm() {  // 重置表单
      this.westMedPre.westMedForm = {
        totalMoney: 0,    // 总价
        drug_list: [
          {
            group_index_str: '',     // 组合
            drug_id: '',   // 药品id
            name: '',   // 药品名
            spec_text: '',     // 规格
            use_method: '',     // 用法
            dosage: '',    // 单次剂量
            dose_unit: '',      // 单次剂量(单位)
            frequency: '',     // 用药频次
            days: '',      // 天数
            total: '',    // 开药数量
            total_unit: '',       // 开药数量(单位)
            price: 0,     // 单价
            total_price: 0    // 金额
          }
        ]
      }
    },
    querySearchAsync(querystring, callback) {  // 药名联想
      clearTimeout(this.timeout)
      service(presSearchDrug, {
        drug_name: querystring,
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
    usageSearch(queryString, callback) {  // 用法联想
      const westUsageArr = this.usageList
      const results = queryString ? westUsageArr.filter(this.createFilter(queryString)) : westUsageArr
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    createFilter(queryString) {
      return array => array.name.toLowerCase().includes(queryString.toLowerCase())
    },
    westNameSelect(item, index) {   // 西药名选择事件
      const obj = this.westMedPre.westMedForm.drug_list.find(val => item.drug_id === val.drug_id)
      if (obj) {
        this.$message({ message: '该药品已存在！', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.westMedPre.westMedForm.drug_list[index].name = item.drug_name
      this.westMedPre.westMedForm.drug_list[index].drug_id = item.drug_id
      this.westMedPre.westMedForm.drug_list[index].medName = item.drug_name  // 保存药名检测
      service(presDrugInfo, {
        drug_id: item.drug_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res) {
            this.westMedPre.westMedForm.drug_list[index].spec_text = res.specs_txt
            this.westMedPre.westMedForm.drug_list[index].price = res.cf_price
            this.westMedPre.westMedForm.drug_list[index].use_method = res.yongfa
            this.westMedPre.westMedForm.drug_list[index].dosage = res.useunit.specs_unit ? res.useunit.specs_unit.toString() : ''
            this.westMedPre.westMedForm.drug_list[index].dose_unit = res.useunit.specs_name
            this.westMedPre.westMedForm.drug_list[index].days = res.usedall_days ? res.usedall_days.toString() : ''
            this.westMedPre.westMedForm.drug_list[index].total = res.useall && res.useall.specs_unit ? res.useall.specs_unit.toString() : ''
            this.westMedPre.westMedForm.drug_list[index].total_unit = res.useall && res.useall.specs_name ? res.useall.specs_name : '请填写'
            this.westMedPre.westMedForm.drug_list[index].frequency = res.usedaily_times ? res.usedaily_times : ''
            if (this.westMedPre.westMedForm.drug_list[index].frequency) {
              const times = this.frequencyList.find(val => val.index === res.usedaily_times)
              this.westMedPre.westMedForm.drug_list[index].frequency = times.name
            }
            // 保存库存进行检测
            this.westMedPre.westMedForm.drug_list[index].totalNum = res.count_ulunit || 0
            this.calculate(index)
          } else {
            this.$message({ message: '库存0', type: 'error', showClose: true, duration: 1000 })
          }
        }
      })
    },
    submitWestForm(formName) {  // 添加处方
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      if (!this.patientMsg.medicalRecordsForm.medical_id) {
        this.$message({ message: '请先填写病历', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      this.westMedPre.westMedForm.drug_list = this.westMedPre.westMedForm.drug_list.filter(val => val.name)
      if (!this.westMedPre.westMedForm.drug_list.length) {
        this.$message({ message: '处方内容不可为空', type: 'warning', showClose: true, duration: 1000 })
        this.addFormItem('add')
        return
      }
      setTimeout(() => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            let totalFlag = true
            let priceFlag = true
            this.westMedPre.westMedForm.drug_list.forEach(val => {
              if (val.total === '0' || val.dosage === '0' || val.days === '0' || +val.total > val.totalNum) {
                totalFlag = false
              }
              if (!val.price) {
                priceFlag = false
              }
            })
            if (!totalFlag) {
              this.$message({ message: '数量错误', type: 'error', showClose: true, duration: 1000 })
              return
            }
            if (!priceFlag) {
              this.$message({ message: '该药未入库', type: 'error', showClose: true, duration: 1000 })
              return
            }
            if (this.type === 'print') {  // 若为子组件则传值
              this.$emit('formMes', this.westMedPre.westMedForm)
            }
            delete (this.westMedPre.westMedForm.flag)
            // 调用处理处方函数
            this.patientMsg.presForm = savePreFunc.allChange(this.patientMsg)
            // 调用保存处方
            this.savePrescript()
          } else {
            this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
            return false
          }
        })
      }, 500)
    },
    modifyPrescript() {  // 修改处方
      service(modifyPre, {
        regist_id: this.patientMsg.registid,
        prescript_id: this.westMedPre.westMedForm.prescript_id,
        prescript_type: 1,
        status: -1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res.status === 0) {  // 可修改处方
            this.westMedPre.westPreStatus.isDisabled = false  
          } else {
            this.westMedPre.westPreStatus.isIconShow = true
            this.$message({ message: '该处方已缴费', type: 'error', showClose: true, duration: 1000 })
          }
        }
      })
    },
    savePrescript() {  // 保存处方
      service(addPre, {
        prescriptions: this.patientMsg.presForm
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ type: 'success', message: '保存成功', showClose: true, duration: 1000 })
          this.westMedPre.westPreStatus.isDisabled = true  // 保存按钮改变
          const sum = this.patientMsg.presForm.findIndex(val => val.prescript_id === '')
          if (sum !== -1) {
            this.westMedPre.westMedForm.prescript_id = res[sum].prescript_id
          }
          // 1绑定信息 2处方id 3挂号id 4处方类别（1西药 2中药 3输液）
          if (this.patientMsg.details.szsbcardid && this.shebao.hospitalCode) {  // 存在电脑号则走智慧医保
            const prescriptId = this.westMedPre.westMedForm.prescript_id || res[sum].prescript_id
            savePreFunc.sbAudit(this.shebao, prescriptId, this.patientMsg, 1)  // 智慧医保处方审批
          }
        }
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'shebao', 'frequencyList', 'usageList'])
  },
  props: {
    westMedPre: {
      type: Object
    },
    patientMsg: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  margin-top: 20px;
  .el-col {
    text-align: center;
    border: 1px solid #ccc;
    color: #666;
  }
  .add-total {
    padding: 3px;
    .money {
      margin-top: 30px;
      .price {
        color: #f00;
      }
    }
  }
}
.doctor-message {
  text-align: right;
  .name {
    margin-right: 20px;
    color: #09f;
  }
}
</style>
