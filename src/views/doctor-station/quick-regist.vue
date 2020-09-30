<template>
  <div class="quick-regist">
    <!-- 快速接诊 -->
    <div class="container" v-show="!cardReading">
      <div class="header">
        <!-- shebao.hospitalCode存在则绑定社保 -->
        <el-button @click="openReadingCard" v-if="shebao.hospitalCode" size="mini" type="success">读卡</el-button>
      </div>
      <el-form :model="quickForm" :rules="quickRules" ref="quickForm" label-width="90px" size="small">
        <el-form-item label="客户姓名:" prop="name">
          <el-autocomplete v-model="quickForm.name"  :disabled="oldCustomer" :trigger-on-focus="false" 
            :fetch-suggestions="querySearchAsync" @select="handleSelect" placeholder="请输入客户姓名" 
            style="width: 100%;" value-key="name">  
            <template slot-scope="props">
              <div class="think">
                {{ props.item.name }}-{{ props.item.gender | sexFilter }}-{{ props.item.phone }}
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="个人电脑号:">
          <el-input v-model="quickForm.szsbcardid" :maxlength="18"></el-input>
        </el-form-item>
        <el-form-item label="客户手机:" prop="phone">
          <el-input v-model="quickForm.phone" :maxlength="11">
          </el-input>
        </el-form-item>
        <el-form-item label="性别:" prop="gender" align="left">
          <el-radio v-model="quickForm.gender" :label="1">男</el-radio>
          <el-radio v-model="quickForm.gender" :label="2">女</el-radio>
        </el-form-item>
        <el-form-item label="客户年龄:">
          <age-calculate :old="date" ref="ageRef"></age-calculate>
        </el-form-item>
        <el-form-item label="就诊科室:" prop="deptid">
          <el-select v-model="quickForm.deptid" @change="quickForm.doctorid = ''" style="width: 100%;">
            <el-option :label="item.name" :value="item.dept_id" v-for="(item, index) in sections" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="就诊医生:" prop="doctorid">
          <el-select v-model="quickForm.doctorid" style="width: 100%;">
            <el-option :label="item.truename" :value="item.userid" v-for="item in usefulDoctor" :key="item.userid">
              <span style="display: flex;">{{ item.truename }}</span>
              <span style="display: flex;color: #8492a6;margin-left: 10px;" v-if="item.szsbdoctorcode">社保医生</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="挂号类别:" prop="bkc368">
          <el-select v-model="quickForm.bkc368" style="width: 100%;">
            <el-option v-for="(item, index) in regType" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="诊金:" prop="zhenjinid">
          <el-select v-model="quickForm.zhenjinid" style="width: 100%;">
            <el-option :label="item.name" :value="item.item_id" v-for="(item, index) in feeList" :key="index" @click.native="getChargeItemMessage(item)">
              <span style="display: flex;">{{ item.name }}({{ item.price }}元 社保价{{ item.szsbprice }}元)</span>
              <span style="display: flex;color: #8492a6;margin-left: 10px;" v-if="item.szsbcode">社保</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="quickFormSubmit('quickForm')">确定</el-button>
          <el-button @click="cancelQuick">取消</el-button>
          <el-button type="danger" class="el-icon-delete" @click="resetForm('quickForm')">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 社保读卡 -->
    <el-dialog :visible.sync="cardReading" title="社保读卡" align="center">
      <she-bao-loading v-show="cardReading" @getPersonDetailInfo="closeReadingCard"></she-bao-loading>
    </el-dialog>
  </div>
</template>

<script>
import AgeCalculate from '@/components/AgeCalculate'
import SheBaoLoading from '@/components/SheBaoLoading'
import service from '@/utils/request'
import { getDeptList, getDocList, getChargitemList, patientSearch, registFast, saveChargitem } from '@/serve/api'
import { dateChange } from '@/utils/dateChange'
import { dateFilter } from '@/utils/filters'
import { BCC334 } from '@/common/dictionary'
import { mapGetters } from 'vuex'
export default {
  components: { AgeCalculate, SheBaoLoading },
  data() {
    const mobileValidate = (rule, valu2, callback) => {
      const isValid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (this.quickForm.phone && !isValid.test(this.quickForm.phone)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    const ageValidate = (rule, value, callback) => {
      if (!this.date.age && !this.date.month && !this.date.birth) {
        callback(new Error('请至少输入一个年龄'))
      } else {
        callback()
      }
    }
    return {
      sections: [],   // 科室列表
      doctors: [],    // 医生列表
      payList: [],    // 挂号列表
      feeList: [],    // 诊金列表
      regType: [      // 挂号分类
        {
          name: '普通',
          value: '1'
        },
        {
          name: '主治',
          value: '2'
        },
        {
          name: '主任',
          value: '3'
        },
        {
          name: '免收诊金',
          value: '4'
        },
        {
          name: '专家号',
          value: '5'
        }
      ],
      quickForm: {  // 快速接诊
        name: '',
        patientid: '',
        phone: '',
        gender: 1,
        deptid: '',  // 科室
        doctorid: '',   // 医生
        clinicType: '0',   // 就诊类型
        bkc368: '1',
        zhenjinid: '',
        szsbcardid: ''   // 个人电脑号
      },
      oldCustomer: false,  // 是否老用户
      Interval: null,    // 计时器
      date: {
        age: '',
        month: '',
        birth: ''
      },
      quickRules: { // 快速接诊规则
        name: [
          { required: true, message: '请输入客户姓名', trigger: 'change' }
        ],
        phone: [
          { validator: mobileValidate, trigger: 'blur' }
        ],
        age: [
          { validator: ageValidate, trigger: 'blur' }
        ],
        month: [
          { validator: ageValidate, trigger: 'blur' }
        ],
        birth: [
          { validator: ageValidate, trigger: 'blur' }
        ],
        deptid: [
          { required: true, message: '请选择就诊科室', trigger: 'change' }
        ],
        doctorid: [
          { required: true, message: '请选择就诊医生', trigger: 'change' }
        ],
        zhenjinid: [
          { required: true, message: '请选择诊金', trigger: 'change' }
        ]
      },
      timeout: null,  // 联想时钟
      cardReading: false,  // 读卡
      feeObj: {
        regist_id: '',  // 挂号id
        chargitem_id: 'aa',  // 诊所设置中的收费项的id
        item_type: 7,      // 0未知 1挂号 2处方 3检查项 4耗材 5门诊购药 6其他
        name: '',         // 收费项目名称
        total: 1,         // 开具的数量
        price: 0,  // 单价
        total_price: 0,    // 总价
        status: 0      // 状态。0已保存未收费 1已收费 2已使用
      },
      save_doctorId: '',
      save_deptId: ''
    }
  },
  methods: {
    getDepartmentId() {  // 获取科室
      service(getDeptList, {
        disabled: 0,
        can_appoint: 1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res = res && res.length ? res : []
          this.sections = res.filter(val => val.disabled === 0)
          // 默认选科室
          const deptObj = this.sections.find(val => val.deptid === this.user.deptid)
          this.quickForm.deptid = deptObj ? this.user.dept_id : ''
          this.save_deptId = deptObj ? this.user.dept_id : ''
          // 默认选科室
        }
      })
    },
    getDoctor() {  // 获取医生
      service(getDocList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (!res.items) {
            this.$message({ type: 'warning', message: '诊所医生为空', showClose: true, duration: 1000 })
            return
          }
          this.doctors = res.items.filter(val => val.disabled === 0)
          // 默认选医生
          const userObj = this.doctors.find(val => val.userid === this.user.userid)
          this.quickForm.doctorid = userObj ? this.user.userid : ''
          this.save_doctorId = userObj ? this.user.userid : ''
          // 默认选医生
        }
      })
    },
    getPayList() {  // 获取收费项目
      service(getChargitemList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res = res && res.length ? res : []
          res.forEach(val => {
            if (val.disabled === 0 && val.type === 1) {  // 挂号项
              this.payList.push(val)
            } else if (val.disabled === 0 && val.type === 7) {  // 诊金项
              this.feeList.push(val)
            }
          })
        }
      })
    },
    querySearchAsync(queryString, callback) {  // 模糊搜索
      clearTimeout(this.timeout)
      service(patientSearch, {
        keyword: queryString,
        pageindex: 0,
        pagesize: 15
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          if (!res) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.entity)
          }
        } else {  // code错误需要进行的操作
          callback([])
        }
      })
    },
    quickAdd() {  // 快速接诊挂号
      service(registFast, {
        ...this.quickForm,
        birthdate: dateFilter(this.date.birth)
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          this.$message({ message: '挂号成功', type: 'success', showClose: true, duration: 1000 })
          this.feeObj.clinic_id = this.clinic
          this.feeObj.doctor = this.user.truename || this.user.phone
          this.feeObj.doctorid = this.user.userid
          this.feeObj.regist_id = res.registid
          this.saveChargItem()
          this.cancelQuick(1)
        }
      })
    },
    getChargeItemMessage(val) {
      this.feeObj.name = val.name
      this.feeObj.chargitem_id = val.item_id
      this.feeObj.price = val.price
      this.feeObj.total_price = val.price
    },
    saveChargItem() {  // 保存诊金项目
      service(saveChargitem, {
        items: [this.feeObj]
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          this.$message({ message: '诊金提交失败', type: 'error', showClose: true, duration: 1000 })
        }
      })
    },
    resetForm(formName) {  // 重置快速接诊表单
      this.$refs[formName].resetFields()
      this.date.age = ''
      this.date.month = ''
      this.date.birth = ''
      this.quickForm.patientid = ''
      this.quickForm.szsbcardid = ''
      this.oldCustomer = false
      // 带出默认医生和科室
      this.quickForm.deptid = this.save_deptId
      this.quickForm.doctorid = this.save_doctorId
    },
    handleSelect(item) {  // 联想选择事件
      this.oldCustomer = true
      this.quickForm.patientid = item.patientid
      this.quickForm.gender = item.gender
      this.quickForm.phone = item.phone + ''
      this.date.birth = new Date(item.birthdate.replace(/-/g, '/'))
      this.$refs.ageRef.handleBirth()  // 调用子组件事件计算年龄
    },
    cancelQuick(flag) {  // 取消挂号
      this.resetForm('quickForm')
      this.$emit('closeRegistWin', flag)
    },
    openReadingCard() {  // 打开读卡窗口
      this.cardReading = true
    },
    closeReadingCard(val, flag) {  // 关闭读卡窗口
      this.cardReading = false
      if (!flag) {
        return
      }
      this.resetForm('quickForm')
      this.quickForm.name = val.aac003  // 姓名
      this.quickForm.gender = +val.aac004  // 性别
      this.quickForm.szsbcardid = val.aac999   // 个人电脑号
      this.date.birth = new Date(dateChange(val.aac006))  // 生日
      this.$refs.ageRef.handleBirth()  // 调用子组件事件计算年龄
      let canbao = ''
      switch (val.aac008) {
        case '1':
          canbao = '正常参保'
        case '2':
          canbao = '暂停参保'
        case '3':
          canbao = '终止参保'
        default:
          canbao = '未知'
      }
      let str = ''
      val.outputlist2 = val.outputlist2.length ? val.outputlist2 : []
      val.outputlist2.forEach(val => {
        const obj = BCC334.find(val2 => val2.key === val.bcc334)
        if (obj) {
          str += obj.value + ' '
        }
      })
      this.$alert(`客户：${val.aac003}，年龄：${this.date.age}岁，参保状态：${canbao} <br/> 医保卡余额：${val.aae240}元，<br/> 缴费人员类别：${str}`, '读卡成功！', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
        callback: () => {}
      })
    },
    quickFormSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.quickAdd()    // 请求
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    }
  },
  created() {
    this.getDepartmentId()  // 获取科室
    this.getDoctor()        // 获取医生
    this.getPayList()       // 获取收费列表
  },
  computed: {
    ...mapGetters(['user', 'clinic', 'shebao']),
    usefulDoctor() {
      return this.doctors.filter(item => item.deptid === this.quickForm.deptid)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  .header {
    text-align: center;
  }
}
</style>


