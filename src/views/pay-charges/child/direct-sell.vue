<template>
  <div class="direct-sell">
    <el-form :model="sellForm" ref="sellForm" :rules="rules" size="small">
      <div class="medicine">
        <el-row class="header">
          <el-col :span="5">药品名称</el-col>
          <el-col :span="3">规格</el-col>
          <el-col :span="3">数量</el-col>
          <el-col :span="3">单价</el-col>
          <el-col :span="5">金额</el-col>
          <el-col :span="2">操作</el-col>
        </el-row>
        <el-row v-for="(item, index) in sellForm.drug_list" :key="index">
          <el-col :span="5">
            <el-form-item :prop="'drug_list.' + index + '.name'" :rules="{required: true, message: ' ', trigger: 'blur, change'}" class="drug-name">
              <el-autocomplete popper-class="my-autocomplete" @blur="checkName(index)" value-key="name"
                v-model="item.name" :fetch-suggestions="querySearchAsync" placeholder="请输入药品名" 
                @select="selectMedicine($event, index)" :trigger-on-focus="false" >
                <template slot-scope="props">
                  <div class="think">
                    <span class="name">{{ props.item.drug_name }}</span>
                    <span class="spec">{{ props.item.spec_text }}</span>
                    <p class="factory">{{ props.item.producer }}</p>
                  </div>
                </template>
              </el-autocomplete>
              <span class="otc" v-if="item.otc === 1">Rx</span>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item align="center">
              <span>{{ item.spec_text }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item align="center" :prop="'drug_list.' + index + '.total'" :rules="{required: true, message: ' ', trigger: 'blur, change'}">
              <el-input v-model="item.total" @keyup.native="numberInput1('total')" @blur="calculate(index)"></el-input>
              <span>{{ item.total_unit }}</span>
              <p v-if="item.total > item.totalNum" style="color: #f00;">药品库存不足</p>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item align="center">
              <span>{{ item.price | priceFilter }}元/{{ item.bigSpecsUnit }}</span>  
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item align="center">
              <div v-if="item.total">
                <p v-if="item.drug_type === 1">
                  <span>{{ item.total }}{{ item.total_unit }} × {{ item.price | priceFilter }}元/{{ item.bigSpecsUnit }} ÷ {{ item.spec_text }} = </span>
                  <span style="color: #f00;">{{ item.total_price | priceFilter }}元</span>
                </p>
                <p v-if="item.drug_type === 0">
                  <span>{{ item.total }}{{ item.total_unit }} × {{ item.price | priceFilter }}元 = </span>
                  <span style="color: #f00;">{{ item.total_price | priceFilter }}</span>元
                </p>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-form-item align="center">
              <el-button @click="del(index)" type="danger" size="small" plain class="el-icon-delete">
                删除药品
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item align="left">
          <el-button @click="addFormItem" type="primary" size="small" plain class="el-icon-plus">
            增加药品
          </el-button>
        </el-form-item>
      </div>
      <div class="patient-message">
        <h3 style="color: #666;">客户信息</h3>
        <span @click="resetForm" class="clear">
          <i class="el-icon-delete"></i>清空
        </span>
        <el-form-item label-width="0">
          <el-col :span="7">
            <el-form-item label="姓名:" label-width="100px">
              <el-autocomplete popper-class="my-autocomplete" :disabled="oldCustomer" 
                v-model="sellForm.patient.name" :fetch-suggestions="querySearchName" value-key="name" 
                placeholder="请输入客户姓名" @select="handleSelect" :trigger-on-focus="false">
                <template slot-scope="props">
                  <div class="wrapper">
                    <span class="name">{{ props.item.name }}</span>
                    <span class="sex">{{ props.item.gender | sexFilter }}</span>
                    <p class="phone">{{ props.item.phone }}</p>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="性别:" label-width="100px">
              <el-radio v-model="sellForm.gender" :label="1">男</el-radio>
              <el-radio v-model="sellForm.gender" :label="2">女</el-radio>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label-width="0">
          <el-col :span="7">
            <el-form-item label="手机:" prop="phone" label-width="100px">
              <el-input v-model="sellForm.phone" placeholder="请输入客户号码" :maxlength="11" @keyup.native="numberInput2"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户类型:" label-width="100px">
              <el-select v-model="sellForm.patient.patienttype" style="width: 347px;">
                <el-option :label="item.name" :value="item.id" v-for="(item, index) in customerType" :key="index"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="年龄:" label-width="100px">
          <age-calculate :old="date" ref="ageRef" style="width: 200px;"></age-calculate>
        </el-form-item>
        <div class="details" @click="details = !details">
          <i class="el-icon-arrow-up" v-show="details"></i>
          <i class="el-icon-arrow-down" v-show="!details"></i>
          <span>详细信息</span>
        </div>
        <!-- 详细信息 -->
        <el-form-item label-width="0" v-show="details">
          <template solt-scope="scope">
            <el-form-item label-width="0">
              <el-col :span="7">
                <el-form-item label="身份证:" prop="cardid" label-width="100px">
                  <el-input v-model="sellForm.cardid" :maxlength="18"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="就诊卡号:" prop="patient.medicalcardid" label-width="100px">
                  <el-input v-model="sellForm.patient.medicalcardid" style="width: 347px;"></el-input>
                </el-form-item>
              </el-col>
            </el-form-item>
            <el-form-item label-width="0">
              <el-col :span="7">
                <el-form-item label="客户来源:" prop="patient.sourcetype" label-width="100px">
                  <el-select v-model="sellForm.patient.sourcetype">
                    <el-option :label="item.name" :value="item.id" v-for="item in customerSource" :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="邮箱:" prop="email" label-width="100px">
                  <el-input v-model="sellForm.email" style="width: 347px;"></el-input>
                </el-form-item>
              </el-col>
            </el-form-item>
            <el-form-item label-width="0">
              <el-col :span="7">
                <el-form-item label="民族:" prop="patient.nationid" label-width="100px">
                  <el-select v-model="sellForm.patient.nationid">
                    <el-option :label="item.name" :value="item.id" v-for="item in nationList" :key="item.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="婚姻状况:" prop="patient.maritalstatus" label-width="100px">
                  <el-select v-model="sellForm.patient.maritalstatus" style="width: 347px;">
                    <el-option label="未知" :value="0"></el-option>
                    <el-option label="未婚" :value="1"></el-option>
                    <el-option label="已婚" :value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-form-item>
            <el-form-item label-width="0">
              <el-col :span="7">
                <el-form-item label="工作单位:" prop="patient.company" label-width="100px">
                  <el-input v-model="sellForm.patient.company"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="职位:" prop="patient.jobname" label-width="100px">
                  <el-input v-model="sellForm.patient.jobname" style="width: 347px;"></el-input>
                </el-form-item>
              </el-col>
            </el-form-item>
            <el-form-item label="地址:" prop="patient.address" class="address" label-width="100px">
              <el-input v-model="sellForm.patient.address" style="width: 737px;"></el-input>
            </el-form-item>
            <el-form-item label="备注:" prop="patient.remark" label-width="100px">
              <el-input v-model="sellForm.patient.remark" type="textarea" style="width: 737px;"></el-input>
            </el-form-item>
          </template>
        </el-form-item>
      </div>
    </el-form>
    <div class="subumit">
      累计收费金额: <strong style="color: #f00;"> {{ sellForm.totalMoney | priceFilter }}</strong> 元
      <el-button type="primary" @click="submitForm('sellForm')" size="small">收费</el-button>
    </div>
    <el-dialog title="收费信息" :visible.sync="payWin">
      <div class="content">
        <p>收费机构: {{ clinicName }}</p>
        <p>总金额: ￥{{ chargeList.total_price.toFixed(2) }} 元</p>
        <p class="amount">
          <span>减免金额：</span>
          <el-input size="small" v-model="payObj.discount" @keyup.native="numberLimit('discount')" @blur="lessThanTotal"></el-input>
          <span>元</span>
        </p>
        <p class="need">
          应收: ￥<strong>{{ needPay }} 元</strong>
        </p>
        <h3 class="title">支付方式</h3>
        <p class="pay-way">
          <el-radio-group v-model="payObj.payMethod" size="small">
            <el-radio :label="1" border>现金</el-radio>
            <el-radio :label="2" border>银行卡</el-radio>
            <el-radio :label="3" border>微信支付</el-radio>
            <el-radio :label="4" border>支付宝支付</el-radio>
          </el-radio-group>
        </p>
        <p class="reality">
          <span>实收金额: </span>
          <el-input size="small" v-model="payObj.realPay" @keyup.native="numberLimit('realPay')"></el-input>
          <span>元</span>
        </p>
        <p class="change">
          找零: ￥<strong> {{ change }} 元</strong>
        </p>
      </div>
      <div class="footer">
        <el-checkbox v-model="isPrint">打印收费收据</el-checkbox>
        <el-button type="primary" @click="submit" size="small" :disabled="chargeDisable">收费</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AgeCalculate from '@/components/AgeCalculate'
import { intLimit, floatLimit } from '@/utils/inputLimit'
import { dateFilter } from '@/utils/filters'
import deepClone from '@/utils/deepClone'
export default {
  components: { AgeCalculate },
  data() {
    const mobileValidate = (rule, value, callback) => {
      const valid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (value && !valid.test(value)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    const validateIdCard = (rule, value, callback) => {
      const valid = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/
      if (value && !valid.test(value)) {
        callback(new Error('请输入合法的身份证号'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      const valid = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (value && !valid.test(value)) {
        callback(new Error('邮箱格式错误!'))
      } else {
        callback()
      }
    }
    return {
      sellForm: {
        drug_list: [
          {
            name: '',
            drug_id: '',
            spec_text: '',
            total: '',
            total_unit: '',
            price: 0,
            total_price: 0
          }
        ],
        totalMoney: 0,
        phone: '',
        cardid: '',    // 身份证
        email: '',        // 邮箱
        gender: 1,
        patient: {
          patientid: '',
          name: '',
          birthdate: '',
          patienttype: 1,   // 客户类型
          medicalcardid: '',    // 就诊卡号
          sourcetype: 1,    // 客户来源
          nationid: '01',   // 民族
          maritalstatus: 0,    // 婚姻状况
          address: '',         // 地址
          company: '',        // 工作单位
          jobname: '',           // 职业
          remark: ''       // 备注
        }
      },
      rules: {
        phone: [
          { validator: mobileValidate, trigger: 'blur' }
        ],
        cardid: [
          { validator: validateIdCard, trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ]
      },
      date: {        // 年龄
        age: '',
        month: '',
        birth: ''
      },
      doctorName: '',
      details: false,  // 详细信息显示
      oldCustomer: false,  // 是否老客户
      timeout: null,
      payWin: false,  // 收费窗口
      payCheckbox: [],
      chargeList: {
        clinic: '',
        total_price: 0,
        items: []
      },
      payObj: {
        discount: '',    // 减免金额
        realPay: '',    // 实收费用
        payMethod: 1   // 支付方式
      },
      isPrint: true,   // 打印
      chargeDisable: false,   // 是否禁用收费按钮
      clinicName: ''  // 保存诊所名
    }
  },
  methods: {
    numberInput1(str) {  // 限制数字输入
      for (let i = 0; i < this.sellForm.drug_list.length; i++) {
        this.sellForm.drug_list[i][str] = intLimit(this.sellForm.drug_list[i][str])
      }
    },
    numberInput2() {
      this.sellForm.phone = intLimit(this.sellForm.phone)
    },
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
          drug_type: -1
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
    selectMedicine(item, index) {  // 药名选择事件
      const obj = this.sellForm.drug_list.find(val => item.drug_id === val.drug_id)
      if (obj) {
        this.$message({ message: '该药品已存在！', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.sellForm.drug_list[index].name = item.drug_name
      this.sellForm.drug_list[index].medName = item.drug_name
      this.sellForm.drug_list[index].drug_id = item.drug_id
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
        if (res.data.errcode === 0) {
          this.sellForm.drug_list[index].drug_type = +res.data.data.drugtype
          if (this.sellForm.drug_list[index].drug_type === 1) {  // 中药需判断大小规格
            if (res.data.data.specs.unit_large.specs_name !== res.data.data.specs.unit_primary.specs_name && res.data.data.specs.unit_primary.specs_unit !== 0) {
              this.sellForm.drug_list[index].specs = res.data.data.specs.unit_primary.specs_unit
            } else {
              this.sellForm.drug_list[index].specs = 1
            }
            this.sellForm.drug_list[index].spec_text = res.data.data.specs_txt
            this.sellForm.drug_list[index].total = res.data.data.useall && res.data.data.useall.specs_unit ? res.data.data.useall.specs_unit.toString() : ''
            this.sellForm.drug_list[index].total_unit = res.data.data.useunit.specs_name
            this.sellForm.drug_list[index].price = res.data.data.saleprice
            this.sellForm.drug_list[index].totalNum = res.data.data.count_ulunit * res.data.data.specs.unit_primary.specs_unit || 0  // 保存库存进行检测
          } else if (this.sellForm.drug_list[index].drug_type === 0) {
            this.sellForm.drug_list[index].specs = 1
            this.sellForm.drug_list[index].spec_text = res.data.data.specs_txt
            this.sellForm.drug_list[index].total = res.data.data.useall && res.data.data.useall.specs_unit ? res.data.data.useall.specs_unit.toString() : ''
            this.sellForm.drug_list[index].total_unit = res.data.data.useall.specs_name
            this.sellForm.drug_list[index].price = res.data.data.saleprice
            this.sellForm.drug_list[index].otc = res.data.data.otc
            this.sellForm.drug_list[index].totalNum = res.data.data.count_ulunit || 0   // 保存库存进行检测
          }
          this.sellForm.drug_list[index].bigSpecsUnit = res.data.data.specs.unit_large.specs_name
          this.calculate(index)
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    querySearchName(queryString, callback) {  // 客户名联想
      clearTimeout(this.timeout)
      this.$http.post('/service/registration/patientsearch', {
        head: {
          accessToken: this.token,  // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          keyword: queryString,
          pageindex: 0,
          pagesize: 12
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          if (!res.data.data) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.data.data.entity)
          }
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
          callback([])
        }
      }).catch()
    },
    handleSelect(item) {  // 选择客户名事件
      this.$http.post('/service/registration/patientdetail', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          patientid: item.patientid
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          // 选择联想，则带出患者数据
          this.sellForm.patient = res.data.data
          this.sellForm.cardid = res.data.data.cardid
          this.sellForm.email = res.data.data.email
          this.sellForm.phone = item.phone
          this.details = true  // 展现详细信息
          this.oldCustomer = true  // 保存为老用户
          this.date.birth = new Date(item.birthdate.replace(/-/, '/'))
          this.sellForm.patient.name = item.name
          this.sellForm.gender = item.gender
          this.sellForm.patient.patienttype = 1
          this.$refs.ageRef.handleBirth()  // 调用子组件事件计算年龄
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    del(index) {
      if (this.sellForm.drug_list.length <= 1) {
        return
      }
      this.sellForm.drug_list.splice(index, 1)
      this.calculateAll()
    },
    addFormItem() {    // 增加一行
      let flag = true
      this.sellForm.drug_list.forEach(val => {
        if (val.name === '') {
          flag = false
        }
      })
      if (!flag) {
        this.$message({ message: '内容为空不能新增一行', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const obj = {
        name: '',
        drug_id: '',
        spec_text: '',
        total: '',
        total_unit: '',
        price: 0,
        total_price: 0
      }
      this.sellForm.drug_list.push(obj)
    },
    resetForm() {  // 重置客户表单
      this.sellForm.patient.patientid = ''
      this.sellForm.patient.name = ''
      this.sellForm.gender = 1
      this.sellForm.phone = ''
      this.sellForm.cardid = ''
      this.sellForm.email = ''
      this.sellForm.patient.medicalcardid = ''
      this.sellForm.patient.nationid = '01'
      this.sellForm.patient.maritalstatus = 0
      this.sellForm.patient.company = ''
      this.sellForm.patient.jobname = ''
      this.sellForm.patient.address = ''
      this.sellForm.patient.remark = ''
      this.date.age = ''
      this.date.month = ''
      this.date.birth = ''
      this.oldCustomer = false
    },
    resetSellForm() {  // 重置
      this.sellForm = {
        drug_list: [
          {
            name: '',
            drug_id: '',
            spec_text: '',
            total: '',
            total_unit: '',
            price: 0,
            total_price: 0
          }
        ],
        totalMoney: 0,
        phone: '',
        cardid: '',    // 身份证
        email: '',     // 邮箱
        gender: 1,
        patient: {
          patientid: '',
          name: '',
          birthdate: '',
          patienttype: 1,     // 客户类型
          medicalcardid: '',  // 就诊卡号
          sourcetype: 1,      // 客户来源
          nationid: '01',     // 民族
          maritalstatus: 0,   // 婚姻状况
          company: '',        // 工作单位
          jobname: '',        // 职业
          address: '',        // 地址
          remark: ''          // 备注
        }
      }
      this.payObj = {
        discount: '',    // 减免金额
        realPay: '',     // 实收费用
        payMethod: 1     // 支付方式
      }
      this.details = false  // 收起详细信息
    },
    beforeSubmit() {
      this.chargeList.clinic = this.clinic
      this.chargeList.total_price = this.sellForm.totalMoney
      this.sellForm.patient.birthdate = dateFilter(this.date.birth)
      this.sellForm.patient.phone = this.sellForm.phone
      this.sellForm.patient.cardid = this.sellForm.cardid
      this.sellForm.patient.email = this.sellForm.email
      this.sellForm.patient.gender = this.sellForm.gender
      this.payWin = true
      this.getClinicName()
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        let flag = true
        this.sellForm.drug_list.forEach(val => {
          if (val.total === '0' || val.total > val.totalNum) {
            flag = false
          }
        })
        if (!flag) {
          this.$message({ message: '数量错误', type: 'error', showClose: true, duration: 1000 })
          return
        }
        if (this.sellForm.patient.name) {
          if (!this.date.birth) {
            this.$message({ message: '请填写年龄', type: 'error', showClose: true, duration: 1000 })
            return false
          }
        }
        if (valid) {
          const otcFlag = this.sellForm.drug_list.find(val => val.otc === 1)
          if (otcFlag) {
            this.$confirm('药品中包含处方药，是否继续?', '提示', { 
              confirmButtonText: '确定', 
              cancelButtonText: '取消', 
              type: 'warning' 
            }).then(() => {
              this.beforeSubmit()
            }).catch(() => {
              this.$message({ type: 'info', message: '已取消', showClose: true, duration: 1000 })
            })
          } else {
            this.beforeSubmit()
          }
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    checkName(index) {  // 检验名字
      if (this.sellForm.drug_list[index].name !== this.sellForm.drug_list[index].medName) {
        this.sellForm.drug_list[index].drug_id = ''
        this.sellForm.drug_list[index].name = ''
        this.sellForm.drug_list[index].spec_text = ''
        this.sellForm.drug_list[index].total = ''
        this.sellForm.drug_list[index].total_unit = ''
        this.sellForm.drug_list[index].price = 0
        this.sellForm.drug_list[index].total_price = 0
        this.sellForm.drug_list[index].otc = ''
      }
    },
    calculate(index) {  // 计算金额
      if (this.sellForm.drug_list[index].total > this.sellForm.drug_list[index].totalNum) {
        this.$message({ message: `库存量为：${this.sellForm.drug_list[index].totalNum}${this.sellForm.drug_list[index].total_unit}`, type: 'error', showClose: true, duration: 1000 })
      }
      this.sellForm.drug_list[index].total_price = Number((this.sellForm.drug_list[index].total * this.sellForm.drug_list[index].price / this.sellForm.drug_list[index].specs).toFixed(2))
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      let sum = 0
      this.sellForm.drug_list.forEach(val => sum += val.total_price)
      this.sellForm.totalMoney = sum  // 超出库存提示
    },
    save() {
      let copy = deepClone(this.sellForm.patient)
      if (copy.name === '') {
        copy = {}
      }
      this.sellForm.drug_list.forEach(val => val.total -= 0)
      this.$http.post('/service/drugsales/create', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          total_price: this.sellForm.totalMoney,
          doctor: this.doctorName,
          drug_list: this.sellForm.drug_list,
          patient: copy,
          charging: {
            clinicid: this.clinic,
            cashierid: this.user.userid,  // 收银员
            patientid: this.sellForm.patient.patientid,
            patientname: this.sellForm.patient.name,
            totalprice: +this.sellForm.totalMoney,
            reduceprice: +this.payObj.discount,
            realprice: +this.needPay,
            paymethod: this.payObj.payMethod   // 支付方式
          }
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({ type: 'success', message: '收费成功!', showClose: true, duration: 1000 })
          this.chargeList.name = this.sellForm.patient.name
          this.chargeList.phone = this.sellForm.phone
          this.sellForm.drug_list.forEach(val => {
            this.chargeList.items.push({
              type: 5,
              data: val
            })
          })
          if (this.isPrint) {
            this.print()
          }
          this.resetSellForm()   // 页面恢复
          this.payWin = false
          this.chargeDisable = false
          this.oldCustomer = false
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
          this.chargeDisable = false
        }
      }).catch()
    },
    numberLimit(str) {  // 限制数字输入
      this.payObj[str] = floatLimit(this.payObj[str], 2)
    },
    getClinicName() {  // 获取诊所名
      this.$http.post('/service/public/clinic_name', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.clinicName = res.data.data.clinic_name
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      })
    },
    // 折扣不能大于总价
    lessThanTotal() {
      const total = parseFloat(this.chargeList.total_price)
      const discount = this.payObj.discount ? parseFloat(this.payObj.discount) : 0
      if (discount > total) {
        this.$message({ message: '减免金额不能大于总金额', type: 'error', showClose: true, duration: 1000 })
        this.payObj.discount = ''
      }
    },
    submit() {
      if (this.change === '') {
        this.$message({ message: '支付金额不足', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.chargeDisable = true    // 点击收费后，需禁用收费按钮，防止再次发送收费请求
      this.save()
    },
    print() {
      const change = this.change ? parseFloat(this.change) : 0
      const realPay = parseFloat(this.payObj.realPay) - change
      const discount = this.payObj.discount ? parseFloat(this.payObj.discount) : 0
      const needPay = this.chargeList.total_price
      this.chargeList.discount = discount
      this.chargeList.needPay = needPay
      this.chargeList.realPay = realPay
      this.$store.commit('user/SET_FEE_PRINT', this.chargeList)
      window.open('/print/fee-print-1')
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'customerType', 'customerSource', 'nationList']),
    needPay() {
      const discount = this.payObj.discount ? parseFloat(this.payObj.discount) : 0
      const total = parseFloat(this.chargeList.total_price)
      const needPay = total - discount
      return needPay < 0 ? 0 : needPay.toFixed(2)
    },
    change() {
      const realPay = this.payObj.realPay ? parseFloat(this.payObj.realPay) : 0
      const needPay = this.needPay
      const exchange = realPay - needPay
      return exchange < 0 ? '' : exchange.toFixed(2)
    }
  },
  created() {
    this.doctorName = this.user.truename ? this.user.truename : this.user.phone
  }
}
</script>

<style lang="scss" scoped>
.direct-sell {
  margin-top: 20px;
  margin-left: 30px;
}
.el-form {
  .medicine {
    min-height: 300px;
    border-bottom: 1px dashed #ccc;
    margin-bottom: 20px;
    .header {
      margin-bottom: 10px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-bottom: 1px solid #ccc;
    }
    .el-col {
      margin-right: 10px;
      color: #666;
    }
    .drug-name {
      position: relative;
      .otc {
        color: rgb(221, 116, 17);
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        display: inline-block;
        width: 30px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border-radius: 15px;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        background-color: #f00;
        opacity: 0.7;
      }
    }
    .el-autocomplete {
      width: 100%;
    }
    .el-input {
      width: 80%;
    }
  }
  .patient-message {
    h3 {
      line-height: 30px;
    }
    .clear {
      color: #f00;
      cursor: pointer;
      margin-left: 38px;
      line-height: 30px;
    }
    .el-input {
      width: 200px;
    }
    .el-autocomplete {
      width: 200px;
    }
    .el-select {
      width: 200px;
    }
    .el-form-item {
      margin-bottom: 8px;
      &.address {
        margin-bottom: 10px;
        .el-input {
          width: 500px;
        }
      }
    }
    .details {
      color: #09f;
      font-size: 16px;
      cursor: pointer;
      margin-left: 8px;
    }
  }
}
.subumit {
  margin-top: 10px;
  line-height: 60px;
  border-top: 1px dashed #ccc;
  .el-button {
    margin-left: 35%;
  }
}
// 联想样式
.think {
  line-height: 26px;
  .spec {
    color: #999;
    font-size: 12px;
    margin-left: 5px;
  }
  .factory {
    color: #999;
    line-height: 18px;
    font-size: 12px;
    margin-bottom: 5px;
    border-bottom: 1px solid #ccc;
  }
}
.wrapper {
  border-bottom: 1px solid #ccc;
  line-height: 25px;
  height: 50px;
  padding-left: 5px;
  .phone {
    color: #09f;
  }
}
</style>
