<template>
  <div class="customer-list">
    <el-form class="search-form" :model="searchCondition" size="small" label-width="80px">
      <el-form-item label="建档日期:" prop="dateRange">
        <el-date-picker v-model="searchCondition.dateRange" type="daterange" 
          range-separator="-" :editable="false" :clearable="false"
          unlink-panels start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="名字:" prop="name">
        <el-input v-model="searchCondition.name" placeholder="请输入客户姓名或手机号" style="width: 280px;"></el-input>
        <el-button type="primary" @click="createCustomer" style="margin-left: 10px;">新增客户</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="customersList" stripe>
      <el-table-column type="index" align="center" label="序号" width="70"></el-table-column>
      <el-table-column prop="name" align="center" label="姓名"></el-table-column>
      <el-table-column align="center" label="性别">
        <template slot-scope="scope">
          <span>{{ scope.row.gender | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="年龄">
        <template slot-scope="scope">
          <span>{{ scope.row.birthdate | formatBirth }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" align="center" label="手机" width="120"></el-table-column>
      <el-table-column align="center" label="客户类型">
        <template slot-scope="scope">
          <span>{{ scope.row.patienttype | customerTypeFilter(customerType) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户来源">
        <template slot-scope="scope">
          <span>{{ scope.row.patientsource | sourceFilter(customerSource) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deptname" align="center" label="最近就诊科室" width="120"></el-table-column>
      <el-table-column prop="doctor" align="center" label="最近就诊医生" width="120"></el-table-column>
      <el-table-column align="center" prop="visittime" label="最近就诊时间" width="160"></el-table-column>
      <el-table-column align="center" prop="createtime" label="建档时间" width="160"></el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="showCustomerDetail(scope.row.patientid)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handleCurrentChange" :page-size="page.pagesize"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="新增客户档案" :visible.sync="createCustomerShow" :before-close="handleClose" align="center">
      <el-form :rules="rules" ref="createCustomer" :model="customer" label-width="90px" size="small">
        <el-form-item label="客户姓名:" prop="name">
          <el-input v-model="customer.name"></el-input>
        </el-form-item>
        <el-form-item label="性别:" prop="gender" align="left">
          <el-radio-group v-model="customer.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机:" prop="phone">
          <el-input v-model="customer.phone" :maxlength="11" @keyup.native="limitMobile('phone')"></el-input>
        </el-form-item>
        <el-form-item label="年龄:">
          <age-calculate :old="old"></age-calculate>
        </el-form-item>
        <el-form-item label="身份证号:" prop="cardid">
          <el-input v-model="customer.cardid"></el-input>
        </el-form-item>
        <el-form-item label="就诊卡号:" prop="medicalcardid">
          <el-input v-model="customer.medicalcardid"></el-input>
        </el-form-item>
        <el-form-item label="来源渠道:" prop="sourcetype">
          <el-select v-model="customer.sourcetype" filterable style="width: 100%;">
            <el-option v-for="item in customerSource" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select> 
        </el-form-item>
        <el-form-item label="客户类型:" prop="patienttype">
          <el-select v-model="customer.patienttype" filterable style="width: 100%;">
            <el-option v-for="item in customerType" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="民族:" prop="nation">
          <el-select v-model="customer.nationid" filterable style="width: 100%;">
            <el-option v-for="item in nationList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="婚姻状况:" prop="maritalstatus">
          <el-select v-model="customer.maritalstatus" filterable style="width: 100%;">
            <el-option v-for="item in marriageStatus" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作单位:" prop="company">
          <el-input v-model="customer.company"></el-input>
        </el-form-item>
        <el-form-item label="职位:" prop="jobname">
          <el-input v-model="customer.jobname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="customer.email"></el-input>
        </el-form-item>
        <el-form-item label="地址:" prop="address">
          <el-input v-model="customer.address"></el-input>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input v-model="customer.remark"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createCustomerConfirm('createCustomer')">保存</el-button>
          <el-button @click="createCustomerCancel('createCustomer')">取消</el-button>
        </el-form-item>         
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit } from '@/utils/inputLimit'
import deepClone from '@/utils/deepClone'
import AgeCalculate from '@/components/AgeCalculate'
import { calculateFromBirth } from '@/utils/ageTransfer'
import { customerList, customerAdd } from '@/serve/api'
import service from '@/utils/request'
export default {
  components: { AgeCalculate },
  data() {
    const ageValidate = (rule, value, callback) => {
      if (!this.old.age && !this.old.month && !this.old.birth) {
        callback(new Error('请至少输入一个年龄'))
      } else if (this.old.birth > new Date()) {
        callback(new Error('请填写正确的生日'))
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
    const IdCardValidate = (rule, value, callback) => {
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
      total: 0,
      createCustomerShow: false,  // 是否新建客户档案
      searchCondition: {          // 搜索条件
        dateRange: [new Date(new Date() - (1000 * 60 * 60 * 24 * 7)), new Date()],
        name: '',               // 姓名或电话
        patienttype: -1,
        patientsource: -1
      },
      page: {
        pageindex: 0,
        pagesize: 10
      },
      customersList: [],
      customer: {
        name: '',
        gender: 1,
        phone: '',
        cardid: '',
        medicalcardid: '',  // 就诊卡
        patienttype: 1,
        sourcetype: 1,
        nationid: '01',     // 民族
        maritalstatus: 0,
        company: '',     // 单位
        jobname: '',     // 职位
        email: '',
        address: '',
        remark: ''
      },
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
          { validator: IdCardValidate, trigger: 'blur' }
        ],
        email: [
          { validator: emailValidate, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 分页
    handleCurrentChange(index) {
      this.page.pageindex = index - 1
      this.getCustomersList()
    },
    // 新建档案
    createCustomer() {
      this.createCustomerShow = true
    },
    // 取消建档
    createCustomerCancel(ruleForm) {
      this.createCustomerShow = false
      // 重置表单
      this.$refs[ruleForm].resetFields()
      this.old.age = ''
      this.old.month = ''
      this.old.birth = ''
    },
    handleClose() {
      this.createCustomerShow = false
      // 重置表单
      this.$refs.createCustomer.resetFields()
    },
    // 确认建档
    createCustomerConfirm(formName) {
      if (this.old.month > 11) {
        this.$message({
          message: '月数必须小于12',
          type: 'error',
          duration: 1000,
          showClose: true
        })
        return
      }
      // 添加客户档案成功的处理
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.newCustomerFile()
        } else {
          return false
        }
      })
    },
    // 限制手机号输入
    limitMobile(item) {
      this.customer[item] = intLimit(this.customer[item])
    },
    // 查看客户详情
    showCustomerDetail(customerId) {
      this.$store.commit('user/SET_CUSTOMER_ID', customerId)
      this.$router.push({ path: '/customers/customer-detail' })
    },
    // 获取客户档案列表
    getCustomersList() {
      const fromdate = this.searchCondition.dateRange[0].format('yyyy-MM-dd')
      const todate = this.searchCondition.dateRange[1].format('yyyy-MM-dd')
      service(customerList, {
        fromdate,
        todate,
        ...this.searchCondition,
        ...this.page
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.customersList = res && res.items ? res.items : []
          this.total = res ? res.totalcount : 0
        }
      })
    },
    // 新建档案
    newCustomerFile() {
      service(customerAdd, {
        ...this.customer,
        birthdate: this.old.birth.format('yyyy-MM-dd')
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const customer = deepClone(res)
          this.$set(customer, 'createtime', new Date().format('yyyy-MM-dd hh:mm:ss'))
          this.customersList.push(customer)
          this.$message.success({ message: '新建客户档案成功', duration: 1000, showClose: true })
        }
        this.createCustomerCancel()
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'marriageStatus', 'nationList', 'customerType', 'customerSource'])
  },
  // 监听搜索条件
  watch: {
    searchCondition: {
      handler() {
        this.page.pageindex = 0
        this.getCustomersList()
      },
      deep: true
    }
  },
  filters: {
    sourceFilter(id, sourceList) {
      const source = sourceList.find(item => item.id === id)
      return source ? source.name : '未知'
    },
    customerTypeFilter(id, typeList) {
      const type = typeList.find(item => item.id === id)
      return type ? type.name : '自费'
    },
    formatBirth(birth) {
      return calculateFromBirth(birth)
    }
  },
  created() {
    this.getCustomersList()
  }
}
</script>

<style lang="scss" scoped>
.customer-list {
  margin-top: 20px;
  margin-left: 30px;
  .search-form {
    display: flex;
  }
  .el-table {
    margin-top: 20px;
    width: 95%;
  }
  .el-pagination {
    margin-top: 10px;
    text-align: center;
  }
}
</style>

