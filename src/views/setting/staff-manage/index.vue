<template>
  <div class="staff-manage">
    <div class="add-account">
      <el-button type="primary" size="small" @click="modifyEmployee(-1)">添加账号</el-button>
    </div>
    <el-table :data="employees" type="index" stripe>
      <el-table-column align="center" prop="username" label="登录账号"></el-table-column>
      <el-table-column align="center" prop="truename" label="姓名"></el-table-column>
      <el-table-column align="center" label="性别">
        <template slot-scope="scope">
          <span>{{ scope.row.gender | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="phone" label="电话">
      </el-table-column>
      <el-table-column align="center" label="科室">
        <template slot-scope="scope">
          <span>{{ scope.row.deptid | sectionFilter(sections) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="权限">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="left">
            <div style="color: #42b983;">{{ scope.row.permission | rightFilter(permissionList) }}</div>
            <div slot="reference">{{ scope.row.permission | rightFilter(permissionList) }}</div>
          </el-popover>
        </template>
      </el-table-column> 
      <el-table-column align="center" label="出生日期">
        <template slot-scope="scope">
          <span>{{ scope.row.birthday | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <span>{{ scope.row.disabled | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="modifyEmployee(scope.$index)">编辑</el-button>
          <el-button @click="forbidEmployee(scope.$index)" v-if="scope.row.disabled === 0 && scope.row.grade !== 1" 
            type="text" style="color: #f00;">
            禁用
          </el-button>
          <el-button @click="startEmployee(scope.$index)" v-if="scope.row.disabled !== 0" 
            type="text" style="color: #42b983;">
            启用
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="oparation + '账号'" :visible.sync="modifyEmployeeShow" :before-close="handleClose" align="center">
      <el-form :model="employee" ref="employee" :rules="employeeRules" label-width="130px" size="small">
        <el-form-item label="登录账号:" prop="username">
          <el-input v-model="employee.username" :disabled="action === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="姓名:" prop="truename">
          <el-input v-model="employee.truename"></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="employee.password" type="password" :placeholder="passHolder"></el-input>
        </el-form-item>
        <el-form-item label="确认密码:" prop="password_confirm">
          <el-input v-model="employee.password_confirm" type="password" :placeholder="passHolder"></el-input>
        </el-form-item>
        <el-form-item label="出生日期:" prop="birthday">
          <el-date-picker v-model="employee.birthday" style="width: 100%;"
            type="date" :default-value="null" placeholder="选择出生日期" :picker-options='pickerOptions'>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="性别:" prop="gender" align="left">
          <el-radio-group v-model="employee.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="科室:" prop="deptid">
          <el-select v-model="employee.deptid" style="width: 100%;">
            <el-option v-for="item in sections" :key="item.dept_id" :label="item.name" 
              :value="item.dept_id" :disabled="item.disabled !== 0">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="手机:" prop="phone">
          <el-input v-model="employee.phone" :maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="身份证:" prop="idcode">
          <el-input v-model="employee.idcode"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="employee.email"></el-input>
        </el-form-item>
        <el-form-item label="权限:" prop="permission" required align="left">
          <el-checkbox-group v-model="employee.permission">
            <el-checkbox v-for="item in permissionList" :label="item.weight" :key="item.index">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="绑定社保医务人员:" prop="sb">
          <el-select v-model="employee.szsbdoctorkey" clearable style="width: 100%;">
            <el-option v-for="(item, index) in sheBaoDoctorList" :key="index" :label="item.aac003" 
              :value="item.doctorkey">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyEmployeeConfirm('employee')">确定</el-button>
          <el-button @click="modifyEmployeeCancel('employee')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isRegistNameOrId } from '@/utils/uniqueLimit'
import deepClone from '@/utils/deepClone'
import { md5 } from '@/utils/md5'
import { szdoctorListHis } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    const validatePass = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (value) {
        if (!valid.test(value)) {
          callback(new Error('密码仅接收8位以上数字、字母、下划线'))
        } else {
          this.$refs.employee.validateField('password_confirm')
          callback()
        }
      } else {
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (value) {
        if (!valid.test(value)) {
          callback(new Error('密码仅接收8位以上数字、字母、下划线'))
        } else if (value !== this.employee.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateMobile = (rule, value, callback) => {
      const valid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (value && !valid.test(value)) {
        callback(new Error('手机号错误!'))
      } else {
        callback()
      }
    }
    const validateRights = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error('请设置权限'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      const valid = /^[A-Za-z1-9][A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]{2,}[-.])+[A-Za-z\d]{2,5}([-.][A-Za-z\d]{2,})*$/
      if (value && !valid.test(value)) {
        callback(new Error('邮箱格式错误!'))
      } else {
        callback()
      }
    }
    const validateUsername = (rule, value, callback) => {
      const valid = /^[a-zA-Z0-9_]{6,}$/
      if (!valid.test(value)) {
        callback(new Error('用户名仅接受数字、字母或下划线'))
      } else if (isRegistNameOrId(this.employees, this.index, 'username', this.employee.username)) {
        callback(new Error('此账号已被注册'))
      } else {
        callback()
      }
    }
    const validateIdCard = (rule, value, callback) => {
      const valid = /^\d{17}[\d|X]$/
      if (value && !valid.test(value)) {
        callback(new Error('请输入合法的身份证号'))
      } else {
        callback()
      }
    }
    return {
      modifyEmployeeShow: false,
      action: '',  // 记录是新增还是编辑
      index: -1,  // 记录编辑的行号
      employee: {
        username: '',
        password: '',
        password_confirm: '',
        truename: '',
        idcode: '',
        gender: 1,  // 1表示男 2表示女
        birthday: '',
        phone: '',
        email: '',
        deptid: '',
        permission: [],
        prescription: 0,  // 是否有权限查看处方
        disabled: 0,  // 是否禁用(0表示不禁用)
        szsbdoctorkey: ''  // 社保医生key
      },
      employees: [],
      sections: [],
      employeeRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 6, message: '账号长度不小于6', trigger: 'blur' },
          { validator: validateUsername, trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        password_confirm: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        truename: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        phone: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        deptid: [
          { required: true, message: '请分配科室', trigger: 'change' }
        ],
        permission: [
          { validator: validateRights, trigger: 'blur' }
        ],
        idcode: [
          { validator: validateIdCard, trigger: 'blur' }
        ]
      },
      pickerOptions: {  // 现在日期
        disabledDate(date) {
          const today = new Date()
          return date.getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
        }
      },
      sheBaoDoctorList: []
    }
  },
  methods: {
    modifyEmployee(index) {
      if (!this.usefulSections.length) {
        this.$message.error({
          message: '没有可用科室，请先维护科室信息',
          duration: 1000,
          showClose: true
        })
        return
      }
      if (index === -1) {  // 新增条目，密码必输
        const passCompusory = { required: true, message: '请输入密码', trigger: 'blur' }
        this.employeeRules.password.unshift(passCompusory)
        this.employeeRules.password_confirm.unshift(passCompusory)
      }
      this.index = index
      this.action = index > -1 ? 'edit' : 'new'
      if (index > -1) {
        this.getUserInfo(index)
      }
      this.modifyEmployeeShow = true
    },
    modifyEmployeeCancel(ruleForm) {
      this.modifyEmployeeShow = false
      this.$refs[ruleForm].resetFields()  // 重置表单
      if (this.index === -1) {
        this.employeeRules.password.shift()
        this.employeeRules.password_confirm.shift()
      }
    },
    handleClose() {
      this.modifyEmployeeShow = false
      this.$refs.employee.resetFields()  
    },
    modifyEmployeeConfirm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          // 验证成功的处理
          if (this.action === 'new') {
            this.addNewUser()
          } else if (this.employee.password) {
            this.modifyUser()
          } else {
            this.modifyUserNoPassword()
          }
        } else {
          return false
        }
      })
    },
    startEmployee(index) {
      this.changeStatus(index, 0)
    },
    forbidEmployee(index) {
      this.$confirm('禁用后将无法使用, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.changeStatus(index, 1)
      }).catch()
    },
    // 获取科室
    getSections() {
      this.$http.post('/service/clinic/dept_list', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic,
          disabled: 2,    // 2表示获取所有
          can_appoint: 2  // 同上
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0) {
          this.sections = res.data || []
        } else {
          this.$message({
            type: 'error',
            message: res.errmsg,
            duration: 1000,
            showClose: true
          })
        }
      }).catch()
    },
    getEmployees() {
      this.$http.post('/service/clinic/user_list', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0) {
          this.employees = res.data.items || []
        } else {
          this.$message.error({
            message: res.errmsg,
            duration: 1000,
            showClose: true
          })
          this.employees = []
        }
      }).catch()
    },
    addNewUser() {
      const permission = this.calculatePermission(this.employee.permission)
      const birth = this.employee.birthday ? this.employee.birthday.getTime().toString() : ''
      this.employee.permission = permission
      this.employee.birthday = birth
      this.employee.password = md5(this.employee.password)
      delete this.employee.password_confirm
      this.$http.post('/service/clinic/create_user', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic,
          ...this.employee,
          ...this.sbDoctorMsg
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0) {
          const newEmployee = deepClone(this.employee)
          this.$set(newEmployee, 'userid', res.data.userid)
          this.employees.push(newEmployee)
          this.reset()
        } else {
          this.$message.error({
            message: res.errmsg,
            duration: 1000,
            showClose: true
          })
          this.employee.permission = permission
          this.employee.birthday = birth ? new Date(parseInt(birth, 10)) : ''
          this.employee.password = ''  // 此时密码已加密，需重置
        }
      }).catch(() => {
        this.$message.error({
          message: '添加人员失败',
          duration: 1000,
          showClose: true
        })
        this.employee.permission = permission
        this.employee.birthday = birth ? new Date(parseInt(birth, 10)) : ''
        this.employee.password = ''  // 此时密码已加密，需重置
      })
    },
    getUserInfo(index) {
      this.$http.post('/service/clinic/user_info', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic,
          item_id: this.employees[index].userid
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0) {
          const employee = res.data
          employee.idcode = employee.idcode.replace(/^\s+|\s+$/g, '')  // idcode去掉空格
          this.employee = employee
          const permission = this.resolvePermission(res.data.permission)
          this.employee.permission = permission
          this.employee.birthday = new Date(parseInt(res.data.birthday, 10))
        } else {
          this.$message({
            message: res.errmsg,
            duration: 1000,
            showClose: true
          })
        }
      }).catch()
    },
    // 修改数据
    modifyUser() {
      const permission = this.calculatePermission(this.employee.permission)
      const birth = this.employee.birthday ? this.employee.birthday.getTime().toString() : ''
      this.employee.birthday = birth
      this.$http.post('/service/clinic/modify_user', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic,
          item_id: this.employees[this.index].userid,
          items: [
            {
              name: 'passwd',
              newVal: md5(this.employee.password)
            },
            {
              name: 'truename',
              newVal: this.employee.truename
            },
            {
              name: 'idcode',
              newVal: this.employee.idcode
            },
            {
              name: 'gender',
              newVal: this.employee.gender + ''
            },
            {
              name: 'birthday',
              newVal: this.employee.birthday
            },
            {
              name: 'phone',
              newVal: this.employee.phone
            },
            {
              name: 'email',
              newVal: this.employee.email
            },
            {
              name: 'dept',
              newVal: this.employee.deptid
            },
            {
              name: 'permission1',
              newVal: permission + ''
            },
            {
              name: 'szsbdoctorkey',
              newVal: this.employee.szsbdoctorkey
            }
          ]
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.updateView()
        } else {
          this.$message({
            message: res.data.errmsg,
            duration: 1000,
            showClose: true
          })
          this.employee.birthday = birth ? new Date(parseInt(birth, 10)) : ''
        }
      }).catch()
    },
    // 不修改密码
    modifyUserNoPassword() {
      const permission = this.calculatePermission(this.employee.permission)
      const birth = this.employee.birthday ? this.employee.birthday.getTime().toString() : ''
      this.employee.birthday = birth
      this.$http.post('/service/clinic/modify_user', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic,
          item_id: this.employees[this.index].userid,
          items: [
            {
              name: 'truename',
              newVal: this.employee.truename
            },
            {
              name: 'idcode',
              newVal: this.employee.idcode
            },
            {
              name: 'gender',
              newVal: this.employee.gender + ''
            },
            {
              name: 'birthday',
              newVal: this.employee.birthday
            },
            {
              name: 'phone',
              newVal: this.employee.phone
            },
            {
              name: 'email',
              newVal: this.employee.email
            },
            {
              name: 'dept',
              newVal: this.employee.deptid
            },
            {
              name: 'permission1',
              newVal: permission + ''
            },
            {
              name: 'szsbdoctorkey',
              newVal: this.employee.szsbdoctorkey
            }
          ]
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.updateView()
        } else {
          this.$message({
            message: res.data.errmsg,
            duration: 1000,
            showClose: true
          })
          this.employee.birthday = birth ? new Date(parseInt(birth, 10)) : ''
        }
      }).catch()
    },
    updateView() {
      this.employees[this.index].truename = this.employee.truename
      this.employees[this.index].gender = this.employee.gender
      this.employees[this.index].phone = this.employee.phone
      this.employees[this.index].deptid = this.employee.deptid
      this.employees[this.index].permission = this.calculatePermission(this.employee.permission)
      this.employees[this.index].birthday = this.employee.birthday
      // 如果子用户在诊所管理修改自己权限，需要更新权限
      if (this.employees[this.index].userid === this.user.userid) {
        const userInfo = deepClone(this.user)
        userInfo.permission = this.calculatePermission(this.employee.permission)
        userInfo.birthday = this.employee.birthday
        userInfo.gender = this.employee.gender
        userInfo.dept_id = this.employee.deptid
        userInfo.phone = this.employee.phone
        userInfo.email = this.employee.email
        this.$store.commit('user/SET_USER', userInfo)
      }
      // 重置表单
      this.reset()
    },
    reset() {
      // 重置表单
      this.$refs.employee.resetFields()
      this.modifyEmployeeShow = false
      if (this.index === -1) {
        this.employeeRules.password.shift()
        this.employeeRules.password_confirm.shift()
      }
    },
    changeStatus(index, status) {
      this.$http.post('/service/clinic/modify_user', {
        head: {
          msgid: '',
          lastnotice: 0,
          accessToken: this.token
        },
        body: {
          clinic_id: this.clinic,
          item_id: this.employees[index].userid,    // 子用户id
          items: [
            {
              name: 'disabled',
              newVal: status + ''
            }
          ]
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.employees[index].disabled = status
        } else {
          this.$message({
            message: res.data.errmsg,
            duration: 1000,
            showClose: true
          })
        }
      }).catch()
    },
    calculatePermission(list) {
      let permission = 0
      list.forEach(item => {
        permission |= item
      }, this)
      return permission
    },
    resolvePermission(permission) {
      const rights = this.permissionList.filter(item => (item.weight & permission) !== 0)
      const authList = []
      rights.forEach(item => authList.push(item.weight))
      return authList
    },
    getDoctorList() {  // 获取社保医生
      service(szdoctorListHis).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.sheBaoDoctorList = res.record_arr ? res.record_arr : []
        }
      })
    },
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'permissionList']),
    oparation() {
      return this.action === 'edit' ? '编辑' : '新增'
    },
    usefulSections() {
      if (!this.sections) {
        return ''
      }
      return this.sections.filter(section => section.disabled === 0)
    },
    passHolder() {
      return this.index > -1 ? '若无需修改密码，此处请留空' : ''
    }
  },
  filters: {
    rightFilter(permission, list) {
      const rights = list.filter(item => (item.weight & permission) !== 0)
      let label = ''
      rights.forEach(item => {
        label += item.name
        label += '、'
      })
      return label ? label.substr(0, label.length - 1) : ''
    },
    statusFilter(status) {
      return status === 0 ? '已启用' : '已禁用'
    },
    sectionFilter(id, sections) {
      if (!sections) {
        return ''
      }
      const section = sections.find(item => item.dept_id === id)
      return section ? section.name : ''
    }
  },
  created() {
    this.getEmployees()
    this.getSections()
    this.getDoctorList()
  }
}
</script>

<style lang="scss" scoped>
.staff-manage {
  margin-top: 20px;
  margin-left: 30px;
  .add-account {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }
  .el-table {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
