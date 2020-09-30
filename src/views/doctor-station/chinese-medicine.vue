<template>
  <div class="chinese-medicine">
    <el-form :model="chinaMedPre.chinaMedForm" ref="chinaMedForm" size="small">
      <el-form-item>
        <el-row class="header">
          <el-col :span="1">序号</el-col>
          <el-col :span="5">药品名称</el-col>
          <el-col :span="3">规格</el-col>
          <el-col :span="3">单次剂量</el-col>
          <el-col :span="3">煎法/用法</el-col>
          <el-col :span="3">单价</el-col>
          <el-col :span="5">金额</el-col>
          <el-col :span="1">操作</el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-for="(item, index) in chinaMedPre.chinaMedForm.drug_list" :key="index">
        <!-- 序号 -->
        <el-col :span="1">
          <el-form-item>
            <template slot-scope="scope">
              <span>({{ scope.$index + 1 }})</span>
            </template>
          </el-form-item>
        </el-col>
        <!-- 中药名称 -->
        <el-col :span="5">
          <el-form-item :prop="'drug_list.' + index + '.name'" :rules="{required: true, message: '', trigger: 'blur, change'}">
            <el-autocomplete popper-class="my-autocomplete" @focus="addFormItem('', index)" 
              @blur="checkName(index)" :disabled="chinaMedPre.chinaPreStatus.isDisabled" 
              v-model="item.name" :fetch-suggestions="querySearchAsync" placeholder="请输入药品名" 
              @select="chinaNameSelect($event, index)" :trigger-on-focus="false" value-key="name">
              <template slot-scope="props">
                <div class="think">
                  <p>{{ props.item.drug_name }}</p>
                  <p>{{ props.item.spec_text }}</p>
                  <p>{{ props.item.producer }}</p>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>
         <!-- 规格 -->
        <el-col :span="3">
          <el-form-item align="center">
            <span>{{ item.spec_text }}</span>
          </el-form-item>
        </el-col>
        <!-- 剂量 -->
        <el-col :span="3">
          <el-form-item :prop="'drug_list.' + index + '.dosage'" :rules="{required: true, message: ' ', trigger: 'blur, change'}" align="left">
            <el-input v-model="item.dosage" :disabled="chinaMedPre.chinaPreStatus.isDisabled" 
              @keyup.native="priceInput('dosage')" @blur="calculate(index)">
            </el-input>
            <span>{{ item.dose_unit }}</span>
          </el-form-item>
          <span v-if="item.dosage * chinaMedPre.chinaMedForm.total > item.totalNum">药品库存不足</span>
          <span v-if="item.dosage === '0'">不能为0</span>
        </el-col>
        <!-- 煎法、用法 -->
        <el-col :span="3">
          <el-form-item :prop="'drug_list.' + index + '.use_note'">
            <el-autocomplete popper-class="my-autocomplete" :disabled="chinaMedPre.chinaPreStatus.isDisabled" 
              v-model="item.use_note"  :fetch-suggestions="medAskForSearch" 
              placeholder="请输入用法">
            </el-autocomplete>
          </el-form-item>
        </el-col>
        <!-- 单价 -->
        <el-col :span="3">
          <el-form-item :prop="'drug_list.' + index + '.price'" :rules="{required: true, message: ' ', 
            trigger: 'blur, change'}">
            <span>{{ item.price | priceFilter }}元</span>
            <span>/{{ item.bigSpecsUnit }}</span>
          </el-form-item>
        </el-col>
        <!-- 金额 -->
        <el-col :span="5">
          <el-form-item prop="temperature">
            <p v-if="item.dosage">{{ item.dosage }}{{ item.dose_unit}} × {{ item.price | priceFilter }}元/{{ item.bigSpecsUnit }} ÷ {{ item.spec_text }} = <span>{{ item.total_price | priceFilter(4) }}</span>元</p>
          </el-form-item>
        </el-col>
        <!-- 操作 -->
        <el-col :span="1">
          <el-form-item prop="temperature">
            <span class="el-icon-delete" @click="del(index)" v-show="!chinaMedPre.chinaPreStatus.isDisabled"></span>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item align="left">
        <el-button class="el-icon-circle-plus-outline" @click="addFormItem('add')" 
          v-show="!chinaMedPre.chinaPreStatus.isDisabled" type="primary" size="mini">
          增加一行
        </el-button>
      </el-form-item>
      <!-- 第二行 -->
      <el-form-item prop="use_method" align="left" :rules="{required: true, message: '请选择', trigger: 'blur, change'}">
        <el-col :span="4">
          <el-radio v-model="chinaMedPre.chinaMedForm.use_method" label="内服" 
            :disabled="chinaMedPre.chinaPreStatus.isDisabled">
          </el-radio>
          <el-radio v-model="chinaMedPre.chinaMedForm.use_method" label="外用" 
            :disabled="chinaMedPre.chinaPreStatus.isDisabled">
          </el-radio>
        </el-col>
        <el-col :span="4">
          <el-form-item prop="total" label="总共:" :rules="{required: true, message: '请输入总数', trigger: 'blur, change'}">
            <el-input v-model="chinaMedPre.chinaMedForm.total" @keyup.native="numberInput1('total')" 
              @blur="calculateAll" :disabled="chinaMedPre.chinaPreStatus.isDisabled" style="width: 90px;">
            </el-input>
            <span>剂</span>
          </el-form-item>
          <span v-if="chinaMedPre.chinaMedForm.total === '0'">不能为0</span>
        </el-col>
        <el-col :span="5">
          <el-form-item prop="frequency" :rules="{required: true, message: '请输入频次', trigger: 'blur, change'}" 
            label="频次:" label-width="80px">
            <el-select v-model="chinaMedPre.chinaMedForm.frequency" style="width: 120px;" 
              :disabled='chinaMedPre.chinaPreStatus.isDisabled'>
              <el-option v-for="(val, index) in frequencyList" :key="index" :label="val.name" :value="val.name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item prop="daily_use" label="整剂用法:" label-width="100px">
            <el-autocomplete popper-class="my-autocomplete" v-model="all_use_note" 
              :disabled="chinaMedPre.chinaPreStatus.isDisabled"  
              :fetch-suggestions="medAskForSearch" @select="handleSelect" 
              placeholder="批量填写煎法/用法" style="width: 160px;">
            </el-autocomplete>
            <span style="color: #f00;">（非必填）</span>
          </el-form-item>
        </el-col>
        <el-col :span="4" align="center">
          <span class="total-money">
            合计: <strong style="color: #f00;">{{ total_money }}</strong>元
          </span>
        </el-col>
      </el-form-item>
      <el-form-item label="其它要求:" align="left">
        <el-input type="textarea" :rows="3" v-model="chinaMedPre.chinaMedForm.taking_note" 
          :disabled="chinaMedPre.chinaPreStatus.isDisabled">
        </el-input>
      </el-form-item>
      <div class="doctor-message">
        <span class="name">医生: {{ patientMsg.doctorTip.name }}</span>
        <el-button type="primary" @click="submitForm('chinaMedForm')" v-show="!chinaMedPre.chinaPreStatus.isDisabled" size="mini">保存</el-button>
        <el-button type="primary" @click="modifyPrescript" v-show="chinaMedPre.chinaPreStatus.isDisabled" size="mini">修改</el-button>
        <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
      </div>
    </el-form>
    <div class="charge-icon" v-show="chinaMedPre.chinaPreStatus.isIconShow"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit, floatLimit } from '@/utils/inputLimit'
import service from '@/utils/request'
import { presSearchDrug, presDrugInfo, addPre, modifyPre } from '@/serve/api'
import savePreFunc from './savePreFunc'
export default {
  data() {
    return {
      chinaMedForm: {
        drug_list: [
          {
            name: '',   // 药品名
            dosage: '',    // 单次剂量
            dose_unit: '',      // 单次剂量(单位)
            use_note: '',    // 煎法，用法
            price: 0,    // 单价
            total_price: 0,     // 金额
            total_unit: '剂'
          }
        ],
        use_method: '',        // 煎法用法
        total: 0,      // 剂数
        frequency: '',       // 频次
        taking_note: ''     // 要求
      },
      isDisabled: false,   // 禁用表单
      isIconShow: false,      // 收费图标
      validation: false,    // 验证
      total_money: 0,
      all_use_note: ''
    }
  },
  methods: {
    numberInput1(str) {  // 限制数字输入
      this.chinaMedPre.chinaMedForm[str] = intLimit(this.chinaMedPre.chinaMedForm[str])
    },
    numberInput2(str) {  // 限制数字输入
      for (let i = 0; i < this.chinaMedPre.chinaMedForm.drug_list.length; i++) {
        this.chinaMedPre.chinaMedForm.drug_list[i][str] = intLimit(this.chinaMedPre.chinaMedForm.drug_list[i][str])
      }
    },
    priceInput(str) { // 限制价格输入
      for (let i = 0; i < this.chinaMedPre.chinaMedForm.drug_list.length; i++) {
        this.chinaMedPre.chinaMedForm.drug_list[i][str] = floatLimit(this.chinaMedPre.chinaMedForm.drug_list[i][str], 2)
      }
    },
    checkName(index) {
      if (this.chinaMedPre.chinaMedForm.drug_list[index].name !== this.chinaMedPre.chinaMedForm.drug_list[index].medName) {
        this.chinaMedPre.chinaMedForm.drug_list[index].name = ''
        this.chinaMedPre.chinaMedForm.drug_list[index].drug_id = ''
        this.chinaMedPre.chinaMedForm.drug_list[index].dosage = ''
        this.chinaMedPre.chinaMedForm.drug_list[index].dose_unit = ''
        this.chinaMedPre.chinaMedForm.drug_list[index].use_note = ''
        this.chinaMedPre.chinaMedForm.drug_list[index].price = 0
        this.chinaMedPre.chinaMedForm.drug_list[index].total_price = 0
        this.calculateAll()
      }
    },
    addFormItem(act = '', index) {
      if (!this.patientMsg.registid) {
        this.$message({ type: 'warning', message: '请先接诊客户', showClose: true, duration: 1000 })
        return
      }
      if (act === 'add' || (index === this.chinaMedPre.chinaMedForm.drug_list.length - 1)) {
        const json = {
          name: '',   // 药品名
          spec_text: '',  // 规格
          bigSpecsUnit: '',  // 大单位
          dosage: '',    // 单次剂量
          drug_type: 1,
          dose_unit: '',      // 单次剂量(单位)
          use_note: '',    // 煎法，用法
          price: 0,    // 单价
          total_price: 0,     // 金额
          total_unit: '剂'
        }
        this.chinaMedPre.chinaMedForm.drug_list.push(json)
      }
    },
    handleSelect(item) {
      this.all_use_note = item.name
      this.chinaMedPre.chinaMedForm.drug_list.forEach(d => d.use_note = item.name)
    },
    savePrescript() {  // 保存处方
      service(addPre, {
        prescriptions: this.patientMsg.presForm
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ type: 'success', message: '保存成功', showClose: true, duration: 1000 })
          this.chinaMedPre.chinaPreStatus.isDisabled = true  // 保存按钮改变
          const sum = this.patientMsg.presForm.findIndex(val =>  val.prescript_id === '')
          if (sum !== -1) {
            this.chinaMedPre.chinaMedForm.prescript_id = res[sum].prescript_id
          }
          // 1绑定信息 2处方id 3挂号id 4处方类别（1西药2中药3输液）
          if (this.patientMsg.details.szsbcardid && this.shebao.hospitalCode) {  // 存在电脑号则走智慧医保
            const prescriptId = this.chinaMedPre.chinaMedForm.prescript_id || res[sum].prescript_id
            savePreFunc.sbAudit(this.shebao, prescriptId, this.patientMsg, 2)  // 智慧医保处方审批
          }
        }
      })
    },
    modifyPrescript() {  // 修改处方
      service(modifyPre, {
        regist_id: this.patientMsg.registid,
        prescript_id: this.chinaMedPre.chinaMedForm.prescript_id,
        prescript_type: 1,
        status: -1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res.status === 0) {
            this.chinaMedPre.chinaPreStatus.isDisabled = false
          } else {
            this.chinaMedPre.chinaPreStatus.isIconShow = true
            this.$message({ message: '该处方已缴费', type: 'error', showClose: true, duration: 1000 })
          }
        }
      })
    },
    del(index) {
      if (this.chinaMedPre.chinaMedForm.drug_list.length <= 1) {
        this.chinaMedPre.chinaMedForm.totalMoney = 0
        this.total_money = 0
        this.chinaMedPre.chinaMedForm.drug_list = [
          {
            name: '',   // 药品名
            dosage: '',    // 单次剂量
            dose_unit: '',      // 单次剂量(单位)
            use_note: '',    // 煎法，用法
            price: 0,    // 单价
            total_price: 0,     // 金额
            total_unit: '剂'
          }
        ]
        return
      }
      this.chinaMedPre.chinaMedForm.drug_list.splice(index, 1)
      this.calculateAll()
    },
    calculate(index) {  // 计算当前金额
      const chinaMedForm = this.chinaMedPre.chinaMedForm
      if (!chinaMedForm.drug_list[index].dosage || !chinaMedForm.drug_list[index].name) {
        return
      }
      const sum = Number((chinaMedForm.drug_list[index].dosage * chinaMedForm.drug_list[index].price / chinaMedForm.drug_list[index].specs).toFixed(2))
      this.$set(chinaMedForm.drug_list[index], 'total_price', sum)
      this.calculateAll()
    },
    calculateAll() { // 计算总价
      const chinaMedForm = this.chinaMedPre.chinaMedForm
      // 计算总价
      let sum = 0
      chinaMedForm.drug_list.forEach((val, index) => {
        sum += val.total_price
        sum = Number(sum.toFixed(2))
        if (chinaMedForm.drug_list[index].dosage * chinaMedForm.total > chinaMedForm.drug_list[index].totalNum) {
          this.$message({ message: `库存量为：${chinaMedForm.drug_list[index].totalNum}${chinaMedForm.drug_list[index].dose_unit}`, type: 'error', showClose: true, duration: 1000 })
        }
      })
      sum *= chinaMedForm.total
      chinaMedForm.totalMoney = sum
      this.total_money = sum
    },
    // 联想
    querySearchAsync(queryString, callback) {  // 药名联想
      clearTimeout(this.timeout)
      service(presSearchDrug, {
        drug_name: queryString,
        drug_type: 1
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
    TimesSearch(queryString, callback) {  // 频次联想
      const medicine = this.frequencyList
      const results = queryString ? Medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    // 中药特殊要求联想
    medAskForSearch(queryString, callback) {
      const medicine = this.chinaUsage
      const results = queryString ? Medicine.filter(this.createFilter(queryString)) : medicine
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    createFilter(queryString) {
      return medicine => medicine.name.toLowerCase().indexOf(queryString.includes())
    },
    // 选择中药名事件
    chinaNameSelect(item, index) {
      const obj = this.chinaMedPre.chinaMedForm.drug_list.find(val => item.drug_id === val.drug_id)
      if (obj) {
        this.$message({ message: '该药品已存在！', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.chinaMedPre.chinaMedForm.drug_list[index].name = item.drug_name
      this.chinaMedPre.chinaMedForm.drug_list[index].drug_id = item.drug_id
      this.chinaMedPre.chinaMedForm.drug_list[index].medName = item.drug_name  // 保存药名检测
      service(presDrugInfo, {
        drug_id: item.drug_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res) {
            this.chinaMedPre.chinaMedForm.drug_list[index].dosage = res.useunit.specs_unit === 0 ? '' : res.useunit.specs_unit + ''
            if ((res.specs.unit_large.specs_name !== res.specs.unit_primary.specs_name) && (res.specs.unit_primary.specs_unit !== 0)) {
              this.chinaMedPre.chinaMedForm.drug_list[index].specs = res.specs.unit_primary.specs_unit
            } else {
              this.chinaMedPre.chinaMedForm.drug_list[index].specs = 1
            }
            this.chinaMedPre.chinaMedForm.drug_list[index].spec_text = res.specs_txt
            this.chinaMedPre.chinaMedForm.drug_list[index].bigSpecsUnit = res.specs.unit_large.specs_name
            this.chinaMedPre.chinaMedForm.drug_list[index].dose_unit = res.useunit.specs_name  // 小单位
            this.chinaMedPre.chinaMedForm.drug_list[index].use_note = res.yongfa
            this.chinaMedPre.chinaMedForm.drug_list[index].price = res.cf_price
            this.calculate(index)
            // 保存库存进行检测
            this.chinaMedPre.chinaMedForm.drug_list[index].totalNum = res.count_ulunit * res.specs.unit_primary.specs_unit || 0
          } else {
            this.$message({ message: '库存0', type: 'error', showClose: true, duration: 1000 })
          }
        }
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
      this.chinaMedPre.chinaMedForm.drug_list = this.chinaMedPre.chinaMedForm.drug_list.filter(val => {
        return val.name
      })
      if (!this.chinaMedPre.chinaMedForm.drug_list.length) {
        this.$message({ message: '处方内容不可为空', type: 'warning', showClose: true, duration: 1000 })
        this.addFormItem('add')
        return
      }
      setTimeout(() => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            let dosageFlag = true
            this.chinaMedPre.chinaMedForm.drug_list.forEach(val => {
              if (val.dosage === '0' || val.dosage * this.chinaMedPre.chinaMedForm.total > val.totalNum) {
                dosageFlag = false
              }
            })
            if (!dosageFlag || this.chinaMedPre.chinaMedForm.total === '0') {
              this.$message({ message: '数量错误', type: 'error', showClose: true, duration: 1000 })
              return
            }
            delete (this.chinaMedPre.chinaMedForm.flag)
            this.chinaMedPre.chinaMedForm.drug_list.map(val => {
              val.use_method = this.chinaMedPre.chinaMedForm.use_method
              val.total = +this.chinaMedPre.chinaMedForm.total
              val.frequency = this.chinaMedPre.chinaMedForm.frequency
              val.taking_note = this.chinaMedPre.chinaMedForm.taking_note
              val.dosage -= 0
              return this.chinaMedPre.chinaMedForm
            })
            delete (this.chinaMedPre.chinaMedForm.totalNum)
            delete (this.chinaMedPre.chinaMedForm.medName)
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
    }
  },
  computed: {
    ...mapGetters(['user', 'clinic', 'token', 'shebao', 'frequencyList', 'chinaUsage'])
  },
  props: {
    chinaMedPre: {
      type: Object,
      default() {
        return {}
      }
    },
    patientMsg: {
      type: Object,
      default() {
        return {}
      }
    },
    chinaMedPreId: {
      type: Number,
      default: 0
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
}
.total-money {
  margin-left: 20px;
}
.doctor-message {
  text-align: right;
  .name {
    margin-right: 20px;
    color: #09f;
  }
}
</style>
