<template>
  <div class="add-registration">
    <el-card class="box-card">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="90px" size="small">
        <el-form-item label="姓名:" prop="name">
          <el-autocomplete :disabled="oldCustomer" v-model="addForm.name" :trigger-on-focus="false"
            :fetch-suggestions="querySearchAsync" placeholder="请输入客户姓名" @select="handleSelect" 
             style="width: 100%;" value-key="name">
            <template slot-scope="props">
              <div class="think">
                {{ props.item.name }}-{{ props.item.gender | sexFilter }}-{{ props.item.phone }}
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="性别:" prop="gender">
          <el-radio v-model="addForm.gender" :label="1">男</el-radio>
          <el-radio v-model="addForm.gender" :label="2">女</el-radio>
        </el-form-item>
        <el-form-item label="手机:" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入客户号码" :maxlength="11" @keyup.native="numberInput"></el-input>
        </el-form-item>
        <el-form-item label="年龄:" prop="date">
          <age-calculate :old="date" ref="ageRef"></age-calculate>
        </el-form-item>
        <el-form-item label="客户类型:" prop="patienttype">
          <el-select v-model="addForm.patienttype" style="width: 100%;">
            <el-option :label="item.name" :value="item.id" v-for="(item, index) in customerType" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="个人电脑号:">
          <el-input v-model="addForm.szsbcardid" :maxlength="18"></el-input>
        </el-form-item>
        <div class="details" @click="details=!details">
          <span class="el-icon-arrow-up" v-show="details"></span>
          <span class="el-icon-arrow-down" v-show="!details"></span>
          <span>详细信息</span>
        </div>
        <!-- 详细信息 -->
        <el-collapse-transition>
          <div v-show="details">
            <el-form-item label="身份证:" prop="cardid">
              <el-input v-model="addForm.cardid" :maxlength="18"></el-input>
            </el-form-item>
            <el-form-item label="就诊卡号:" prop="otherMes.medicalcardid">
              <el-input v-model="addForm.otherMes.medicalcardid"></el-input>
            </el-form-item>
            <el-form-item label="客户来源:" prop="otherMes.sourcetype">
              <el-select v-model="addForm.otherMes.sourcetype" style="width: 100%;">
                <el-option :label="item.name" :value="item.id" v-for="item in customerSource" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱:" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="民族:" prop="otherMes.nationid">
              <el-select v-model="addForm.otherMes.nationid" style="width: 100%;">
                <el-option :label="item.name" :value="item.id" v-for="item in nationList" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="婚姻状况:" prop="otherMes.maritalstatus">
              <el-select v-model="addForm.otherMes.maritalstatus" style="width: 100%;">
                <el-option label="未知" :value="0"></el-option>
                <el-option label="未婚" :value="1"></el-option>
                <el-option label="已婚" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="工作单位:" prop="otherMes.company">
              <el-input v-model="addForm.otherMes.company"></el-input>
            </el-form-item>
            <el-form-item label="职位:" prop="otherMes.jobname">
              <el-input v-model="addForm.otherMes.jobname"></el-input>
            </el-form-item>
            <el-form-item label="地址:" prop="otherMes.address">
              <el-input v-model="addForm.otherMes.address"></el-input>
            </el-form-item>
            <el-form-item label="备注:" prop="otherMes.remark">
              <el-input v-model="addForm.otherMes.remark" type="textarea"></el-input>
            </el-form-item>
          </div>
        </el-collapse-transition>
        <el-form-item label="就诊科室:" prop="deptid">
          <el-select v-model="addForm.deptid" @change="removeDoctorName" style="width: 100%;">
            <el-option :label="item.name" :value="item.dept_id" v-for="item in sections" :key="item.ind" @click.native="getDepartmentName(item.name)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="就诊医生:" prop="doctorid">
          <el-select v-model="addForm.doctorid" style="width: 100%;">
            <el-option :label="item.truename" :value="item.userid" v-for="item in usefulDoctor" :key="item.userid" @click.native="getDoctorName(item.truename)">
              <span style="display: flex;">{{ item.truename }}</span>
              <span style="display: flex;color: #56bc94;margin-left: 10px;" v-if="item.szsbdoctorcode">社保医生</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="挂号类别:" prop="type">
          <el-select v-model="addForm.bkc368" style="width: 100%;">
            <el-option v-for="(item, index) in registType" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="诊金:" prop="zhenjinid">
          <el-select v-model="addForm.zhenjinid" style="width: 100%;">
            <el-option :label="item.name + `${item.price}元`" :value="item.item_id" 
              v-for="(item, index) in feeList" :key="index" @click.native="getChargeItemMessage(item)">
              <span style="display: flex;" v-if="!item.szsbcode">{{ item.name }} ({{ item.price }}元)</span>
              <span style="display: flex;" v-else>{{ item.name }} (社保价{{ item.szsbprice }}元)</span>
              <span style="display: flex;color: #56bc94;margin-left: 10px;" v-if="item.szsbcode">社保</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item align="center">
          <el-button type="primary" @click="submitForm('addForm')" :disabled="isDisabled">{{ buttonText }}</el-button>
          <el-button type="danger" @click="resetForm('addForm')">清空</el-button>
          <!-- shebao.hospitalCode存在则绑定社保 -->
          <el-button type="success" @click="openReadingCard" v-if="shebao.hospitalCode">读卡</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 读卡 -->
    <el-dialog :visible.sync="cardReading" align="center">
      <she-bao-loading v-if="cardReading" @getPersonDetailInfo="closeReadingCard"></she-bao-loading>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getDeptList, getDocList, getChargitemList, getClinicName, addRegist, patientSearch, patientDetail, patientDetail2, saveChargitem } from '@/serve/api'
import service from '@/utils/request'
import { intLimit } from '@/utils/inputLimit'
import { dateFilter } from '@/utils/filters'
import { dateChange } from '@/utils/dateChange'
import AgeCalculate from '@/components/AgeCalculate'
import SheBaoLoading from '@/components/SheBaoLoading'
import { BCC334 } from '@/common/dictionary'
export default {
  data() {
    const validateMobile = (rule, value, callback) => {
      const isValid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    const validateAge = (rule, value, callback) => {
      if (!this.date.age && !this.date.month && !this.date.birth) {
        callback(new Error('请至少输入一个年龄'))
      } else {
        callback()
      }
    }
    const validateIdCard = (rule, value, callback) => {
      const isValid = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合法的身份证号'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      const isValid = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (value && !isValid.test(value)) {
        callback(new Error('邮箱格式错误!'))
      } else {
        callback()
      }
    }
    return {
      addForm: {
        name: '',
        gender: 1,
        phone: '',
        birthdate: '',
        patienttype: 1,   // 客户类型
        cardid: '',
        email: '',
        szsbcardid: '',   // 个人电脑号
        otherMes: {
          cardid: '',    // 身份证
          medicalcardid: '',    // 就诊卡号
          label: '',      // 标签
          sourcetype: 1,    // 客户来源
          nationid: '01',   // 民族
          maritalstatus: 0,    // 婚姻状况
          address: '',         // 地址
          company: '',        // 工作单位
          jobname: '',           // 职业
          email: '',        // 邮箱
          remark: ''        // 备注
        },
        deptid: '',       // 就诊科室
        deptname: '未指定',
        doctorid: '',         // 就诊医生
        doctorname: '未指定',
        feename: '',
        feeunit: '',
        feeprice: '',
        bkc368: '1',  // 挂号类别
        zhenjinid: ''   // 诊金
      },
      date: {        // 年龄
        age: '',
        month: '',
        birth: ''
      },
      addFormRules: {
        name: [
          { required: true, message: '请输入客户姓名', trigger: 'blur' }
        ],
        phone: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        age: [
          { validator: validateAge, trigger: 'blur, change' }
        ],
        month: [
          { validator: validateAge, trigger: 'blur, change' }
        ],
        birth: [
          { validator: validateAge, trigger: 'blur, change' }
        ],
        cardid: [
          { validator: validateIdCard, trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
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
      buttonText: '立即挂号',
      tagShow: false,    // 标签模态框显示
      checkInPay: false,   // 登记并收费
      isDisabled: false,   // 按钮禁用
      details: false,  // 详细信息显示
      sections: [],   // 科室列表
      doctors: [],     // 医生列表
      payList: [],    // 挂号列表
      feeList: [],   // 诊金列表
      oldCustomer: false,    // 是否为老客户
      tags: [  // 获取标签
        { id: '1', name: '心脏病患者' },
        { id: '2', name: '高血压患者' },
        { id: '3', name: '哮喘' },
        { id: '4', name: '外地' },
        { id: '5', name: '脂肪肝' },
        { id: '6', name: '烟酒史' },
        { id: '7', name: '团购用户' }
      ],
      tag: [],  // 渲染
      saveTag: [],  // 保存
      timeout: null,  // 联想时钟
      isShowCharge: false,    // 收费窗口
      clinicName: '',    // 诊所名
      registType: [
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
      cardReading: false,
      feeObj: {
        regist_id: '',  // 挂号id
        chargitem_id: 'aa',  // 诊所设置中的收费项的id
        item_type: 7,      // 0未知 1挂号 2处方 3检查项 4耗材 5门诊购药 6其他 7诊金
        name: '',         // 收费项目名称
        total: 1,         // 开具的数量
        price: 0,  // 单价
        total_price: 0,    // 总价
        status: 0      // 0已保存但未收费 1已收费 2已使用
      }
    }
  },
  components: { AgeCalculate, SheBaoLoading },
  methods: {
    getDoctorName(name) {  // 获取医生名字
      this.addForm.doctorname = name
    },
    getDepartmentName(name) {  // 获取科室名字
      this.addForm.deptname = name
    },
    removeDoctorName() {  // 删除医生名字
      this.addForm.doctorname = name
      this.addForm.doctorid = name
    },
    getChargeItemMessage(val) {  // 获取收费信息
      this.feeObj.name = val.name
      this.feeObj.chargitem_id = val.item_id
      this.feeObj.price = val.price
      this.feeObj.total_price = val.price
      this.feeObj.total_unit = val.unit
    },
    resetForm(formName) {  // 重置表单
      this.$refs[formName].resetFields()
      this.date.age = ''
      this.date.month = ''
      this.date.birth = ''
      this.oldCustomer = false
      delete (this.addForm.patientid)
    },
    submitForm(formName) {  // 提交表单
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.isDisabled = true
          this.addForm.birthdate = dateFilter(this.date.birth)
          if (this.oldCustomer) {  // 老客户
            this.handleAddRegist(2)  // 状态2更新信息
          } else {  // 存在则直接挂号
            this.handleAddRegist(1)  // 状态1新建
          }
        } else {  // 验证不通过
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    getDepartment() {  // 获取科室
      service(getDeptList, {
        disabled: 0,
        can_appoint: 1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res = res && res.length ? res : []
          this.sections = res.filter(val => val.disabled === 0)
        }
      })
    },
    getDoctor() {  // 获取医生
      service(getDocList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (!res.items) {
            res.items = []
          }
          const arr = res.items.filter(val => val.disabled === 0)
          this.doctors = arr
        }
      })
    },
    getPayList() {  // 获取收费项目
      service(getChargitemList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 直接返回data
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
    handleAddRegist(options) {  // 挂号
      this.addForm.otherMes.cardid = this.addForm.cardid
      this.addForm.otherMes.email = this.addForm.email
      setTimeout(() => {
        this.isDisabled = false
      }, 60000)
      service(addRegist, {
        deptid: this.addForm.deptid,
        doctorid: this.addForm.doctorid,
        registtype: 0,
        patientopt: options,
        bkc368: this.addForm.bkc368,
        patient: {
          ...this.addForm.otherMes,
          name: this.addForm.name,
          gender: this.addForm.gender,
          phone: this.addForm.phone,
          birthdate: this.addForm.birthdate,
          patienttype: this.addForm.patienttype,
          szsbcardid: this.addForm.szsbcardid
        }
      }).then(res => {
        this.isDisabled = false
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.resetForm('addForm')  // 重置表单
          this.details = false  // 收起详细信息
          this.$message({ type: 'success', message: '挂号成功', showClose: true, duration: 1000 })
          // 保存诊金收费项
          this.feeObj.clinic_id = this.clinic
          this.feeObj.doctor = this.user.truename || this.user.phone
          this.feeObj.doctorid = this.user.userid
          this.feeObj.regist_id = res.registid
          this.saveChargeItem()
        }
      })
    },
    saveChargeItem() {  // 保存收费项
      service(saveChargitem, {
        items: [this.feeObj]
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          this.$message({ message: '保存诊金项失败', type: 'warning', showClose: true, duration: 1000 })
        }
      })
    },
    handleClinicName() {  // 获取诊所名
      service(getClinicName).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 直接返回data
          this.clinicName = res.clinic_name
        }
      })
    },
    handleClose(value) { 
      this.tag.splice(this.tag.indexOf(value), 1)
    },
    querySearchAsync(queryString, callback) {  // 联想查询
      clearTimeout(this.timeout)
      service(patientSearch, {
        keyword: queryString,
        pageindex: 0,
        pagesize: 12
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 直接返回data
          if (!res) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.entity)
          }
        } else {  // 代码错误需要进行的操作
          callback([])
        }
      })
    },
    handleSelect(item) {  // 选择联想事件
      service(patientDetail, {
        patientid: item.patientid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 直接返回data
          this.addForm.patientid = res.patientid
          this.addForm.szsbcardid = res.szsbcardid
          this.addForm.otherMes = res
          this.addForm.cardid = res.cardid
          this.addForm.email = res.email
          this.details = true  // 展现详细信息
          this.oldCustomer = true  // 保存为老用户
          this.addForm.phone = item.phone
          this.date.birth = new Date(item.birthdate)
          this.addForm.gender = item.gender
          this.$refs.ageRef.handleBirth()  // 调用子组件事件计算年龄
        }
      })
    },
    numberInput() {  // 整数限制
      this.addForm.phone = intLimit(this.addForm.phone)
    },
    openTagWin() {
      this.tagShow = true
      this.saveTag = this.tag
    },
    closeTagWin(id) {
      this.tagShow = false
      if (id === 0) {
        this.tag = this.saveTag
      }
    },
    openReadingCard() {   // 打开读卡窗口
      this.cardReading = true
    },
    async closeReadingCard(val, flag) {  // 关闭读卡窗口，第二个参数存在则读卡成功
      this.cardReading = false
      if (!flag) {
        return
      }
      const result = await service(patientDetail2, {
        name: val.aac003,
        gender: parseInt(val.aac004, 10),
        birthdate: new Date(dateChange(val.aac006)).format('yyyy-MM-dd'),
        patienttype: 2,
        szsbcardid: val.aac999
      })
      if (!(typeof result === 'string' && result.includes('ERRORCODE'))) {
        this.addForm.name = result.name
        this.addForm.patientid = result.patientid
        this.addForm.szsbcardid = result.szsbcardid
        this.addForm.otherMes = result
        this.addForm.cardid = result.cardid
        this.addForm.email = result.email
        this.details = true  // 展现详细信息
        this.oldCustomer = true  // 保存为老用户
        this.addForm.phone = result.phone
        this.date.birth = new Date(result.birthdate)
        this.addForm.gender = result.gender
        this.$refs.ageRef.handleBirth()  // 调用子组件事件计算年龄
        return
      }
      // 未找到对应客户，当做新客户处理
      this.resetForm('addForm')
      if (val.aac058 === '01') {
        this.addForm.cardid = val.aac147  // 身份证
      }
      this.addForm.patienttype = 2  // 客户来源改成2医保
      this.addForm.name = val.aac003  // 姓名
      this.addForm.gender = +val.aac004  // 性别
      this.addForm.szsbcardid = val.aac999   // 个人电脑号
      this.date.birth = new Date(dateChange(val.aac006))  // 生日
      this.$refs.ageRef.handleBirth()  // 调用子组件事件计算年龄
      let canbao = ''
      switch (val.aac008) {
        case '1':
          canbao = '正常参保'
          break
        case '2':
          canbao = '暂停参保'
          break
        case '3':
          canbao = '终止参保'
          break
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
      this.details = true  // 展现详细信息
    }
  },
  created() {
    this.getDepartment()   // 获取科室列表
    this.getDoctor()       // 获取医生列表
    this.getPayList()      // 获取收费列表
  },
  computed: {
    ...mapGetters(['token', 'user', 'shebao', 'nationList', 'customerType', 'customerSource']),
    usefulDoctor() {
      return this.doctors.filter(item => item.deptid === this.addForm.deptid)
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  width: 900px;
  margin: 20px auto;
  .el-form {
    margin-top: 30px;
  }
  .details {
    color: #09f;
    font-size: 14px;
    cursor: pointer;
    margin-left: 6px;
  }
  .footer {
    text-align: center;
  }
}
.el-dialog {
  width: 50%;
}
// 联想样式
.think {
  border-bottom: 1px solid #ddd;
  color: #42b983;
}
</style>
