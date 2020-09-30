<template>
  <div class="customer-info">
    <div class="content">
      <!-- 基本信息 -->
      <h4 class="title">基本信息</h4>
      <p>
        <span>客户姓名: {{ customer.patient.name }}</span>
        <span>性别: {{ customer.patient.gender | sexFilter }}</span>
      </p>
      <p>
        <span>手机: {{ customer.patient.phone }}</span>
        <span>生日: {{ customer.patient.birthdate }}</span>
      </p>
      <!-- 详细信息 -->
      <h4 class="title">详细信息</h4>
      <p>
        <span>身份证号: {{ customer.patient.cardid }}</span>
        <span>就诊卡号: {{ customer.patient.medicalcardid }}</span>
      </p>
      <p>
        <span>客户类型: {{ customer.patient.patienttype | customerTypeFilter(customerType) }}</span>
        <span>来源渠道: {{ customer.patient.sourcetype | sourceFilter(customerSource) }}</span>
      </p>
      <p>
        <span>民族: {{ customer.patient.nationid | nationFilter(nationList) }}</span>
        <span>婚姻状况: {{ customer.patient.maritalstatus | marriageFilter(marriageStatus) }}</span>
      </p>
      <p>
        <span>工作单位: {{ customer.patient.company }}</span>
        <span>职位: {{ customer.patient.jobname }}</span>
      </p>
      <p>
        <span>标签: </span>
        <span>地址: {{ customer.patient.address }}</span>
      </p>
      <p>
        <span>邮箱: {{ customer.patient.email }}</span>
        <span>备注: {{ customer.patient.remark }}</span>
      </p>    
      <!-- 就诊信息 -->
      <h4 class="title">就诊信息</h4>
      <p>
        <span>最近就诊时间: {{ customer.visittime }}</span>
        <span>最近就诊医生: {{ customer.doctor }}</span>
      </p>
      <p>
        <span>就诊次数: {{ customer.amount }}</span>
        <span>总消费金额: {{ customer.chargeprice }}</span>
      </p>
      <div class="modify-button">
        <el-button type="primary" size="small" @click="modifyCustomerMethod">修改信息</el-button>
      </div>
    </div>
    <el-dialog title="修改客户信息" :visible.sync="modifyCustomerShow" :before-close="handleClose" align="center">
      <el-form :model="modifyCustomer" :rules="rules" ref="modifyCustomer" label-width="90px" size="small">
        <el-form-item label="姓名:" prop="name">
          <el-input v-model="modifyCustomer.name"></el-input>
        </el-form-item>
        <el-form-item label="性别:" prop="gender" align="left">
          <el-radio-group v-model="modifyCustomer.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机:" prop="phone">
          <el-input v-model="modifyCustomer.phone"></el-input>
        </el-form-item>
        <el-form-item label="年龄:">
          <age-calculate :old="old"></age-calculate>
        </el-form-item>
        <el-form-item label="身份证号:" prop="cardid">
          <el-input v-model="modifyCustomer.cardid"></el-input>
        </el-form-item>
        <el-form-item label="就诊卡号:" prop="medicalcardid">
          <el-input v-model="modifyCustomer.medicalcardid"></el-input>
        </el-form-item>
        <el-form-item label="客户类型:" prop="patienttype">
          <el-select v-model="modifyCustomer.patienttype" filterable style="width: 100%;">
            <el-option v-for="item in customerType" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源渠道:" prop="sourcetype">
          <el-select v-model="modifyCustomer.sourcetype" filterable style="width: 100%;">
            <el-option v-for="item in customerSource" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select> 
        </el-form-item>
        <el-form-item label="民族:" prop="nationid">
          <el-select v-model="modifyCustomer.nationid" filterable style="width: 100%;">
            <el-option v-for="item in nationList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="婚姻状况:" prop="maritalstatus">
          <el-select v-model="modifyCustomer.maritalstatus" filterable style="width: 100%;">
            <el-option v-for="item in marriageStatus" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作单位:" prop="company">
          <el-input v-model="modifyCustomer.company"></el-input>
        </el-form-item>
        <el-form-item label="职位:" prop="jobname">
          <el-input v-model="modifyCustomer.jobname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="modifyCustomer.email"></el-input>
        </el-form-item>
        <el-form-item label="地址:" prop="address">
          <el-input v-model="modifyCustomer.address"></el-input>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input v-model="modifyCustomer.remark"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyCustomerConfirm('modifyCustomer')">保存</el-button>
          <el-button @click="modifyCustomerCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AgeCalculate from '@/components/AgeCalculate'
import deepClone from '@/utils/deepClone'
import { customerInfo, customerInfoUpdate } from '@/serve/api'
import service from '@/utils/request'
export default {
  props: {
    customerId: {
      type: String,
      default: ''
    }
  },
  data() {
    const ageValidate = (rule, value, callback) => {
      if (!this.old.age && !this.old.month && !this.old.birth) {
        callback(new Error('请至少输入一个年龄'))
      } else {
        callback()
      }
    }
    const mobileValidate = (rule, value, callback) => {
      const isValid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    const idCardValidate = (rule, value, callback) => {
      const isValid = /^\d{17}[\d|X]$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合法的身份证号'))
      } else {
        callback()
      }
    }
    const emailValidate = (rule, value, callback) => {
      const isValid = /^[A-Za-z1-9][A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]{2,}[-.])+[A-Za-z\d]{2,5}([-.][A-Za-z\d]{2,})*$/
      if (value && !isValid.test(value)) {
        callback(new Error('邮箱格式错误!'))
      } else {
        callback()
      }
    }
    return {
      modifyCustomerShow: false,
      customer: {
        patient: {}  // 客户信息
      },   
      customerStatistics: {},  // 客户就诊统计
      modifyCustomer: {},
      old: {
        age: '',
        month: '',
        birth: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        age: [
          { validator: ageValidate, trigger: 'blur' }
        ],
        month: [
          { validator: ageValidate, trigger: 'blur' }
        ],
        year: [
          { validator: ageValidate, trigger: 'blur' }
        ],
        phone: [
          { validator: mobileValidate, trigger: 'blur' }
        ],
        cardid: [
          { validator: idCardValidate, trigger: 'blur' }
        ],
        email: [
          { validator: emailValidate, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    modifyCustomerMethod() {
      this.modifyCustomerShow = true
      this.modifyCustomer = deepClone(this.customer.patient)
      if (this.customer.patient.birthdate) {
        const birth = this.customer.patient.birthdate.split('-')
        this.old.birth = new Date(birth[0], birth[1] - 1, birth[2])
      }
    },
    modifyCustomerCancel() {
      this.modifyCustomerShow = false
      // 重置表单
      this.$refs.modifyCustomer.resetFields()
      this.modifyCustomer = {}
      this.old.age = ''
      this.old.month = ''
      this.old.birth = ''
    },
    handleClose() {
      this.modifyCustomerShow = false
      // 重置表单
      this.$refs.modifyCustomer.resetFields()
    },
    modifyCustomerConfirm(formName) {
      if (this.old.month > 11) {
        this.$message({
          message: '月份必须小于12',
          type: 'error',
          duration: 1000,
          showClose: true
        })
        return
      }
      // 修改客户档案成功的处理
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.modifyCustomerRequest()
        } else {
          return false
        }
      })
    },
    // 获取客户详细信息
    getCustomerInfo() {
      service(customerInfo, {
        patientid: this.customerId
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.customer = res
        }
      })
    },
    // 修改客户信息
    modifyCustomerRequest() {
      service(customerInfoUpdate, {
        patientid: this.customerId,
        ...this.modifyCustomer,
        birthdate: this.old.birth.format('yyyy-MM-dd')
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$emit('customerInfoUpdated')
          this.$message.success({ message: '修改客户信息成功', duration: 1000, showClose: true })
          this.customer.patient = res
        }
        this.modifyCustomerCancel()
      })
    }
  },
  components: { AgeCalculate },
  computed: {
    ...mapGetters(['token', 'clinic', 'nationList', 'customerType', 'marriageStatus', 'customerSource'])
  },
  filters: {
    // 客户来源过滤
    sourceFilter(id, sourceList) {
      const source = sourceList.find(item => item.id === id)
      return source ? source.name : ''
    },
    // 客户类型过滤
    customerTypeFilter(id, typeList) {
      const type = typeList.find(item => item.id === id)
      return type ? type.name : ''
    },
    // 民族过滤
    nationFilter(id, nationList) {
      const nation = nationList.find(item => item.id === id)
      return nation ? nation.name : ''
    },
    // 婚姻状况过滤
    marriageFilter(id, marriageList) {
      const marriage = marriageList.find(item => item.id === id)
      return marriage ? marriage.label : ''
    }
  },
  created() {
    this.getCustomerInfo()
  }
}
</script>

<style lang="scss" scoped>
.content {
  margin-left: 30px;
  width: 1200px;
  .title {
    height: 40px;
    line-height: 40px;
    padding-left: 6px;
    background: #eee;
    color: #666;
  }
  p {
    display: flex;
    color: #666;
    span {
      flex: 1;
      margin-left: 20px;
    }
  }
  .modify-button {
    text-align: center;
    margin-right: 50px;
  }
}
</style>

