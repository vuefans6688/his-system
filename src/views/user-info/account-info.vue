<template>
  <div class="account-info">
    <el-card class="box-card">
      <div class="message">
        <h4 class="title">帐号信息</h4>
        <p>姓名: {{ user.truename }}</p>
        <p>性别: {{ user.gender | sexFilter }}</p>
        <p>出生年月: {{ user.birthday | dateFilter }}</p>
        <p>邮箱: {{ user.email }}</p>
        <p v-if="user.grade !== 1">诊所名称: {{ clinicName }}</p>
        <p>
          <el-button type="primary" size="small" @click="editMessage">修改资料</el-button>
        </p>
      </div>
      <div class="safe">
        <h4 class="title">帐号安全</h4>
        <p>帐号: {{ user.username }}</p>
        <p>密码: ********</p>
        <p>手机号: {{ user.phone }}</p>
        <p>
          <el-button type="primary" size="small" @click="editPassword">修改密码</el-button>
        </p>
      </div>
    </el-card>
    <el-dialog title="修改信息" :visible.sync="modifyMessageShow" :before-close="handleCloseMessage" align="center">
      <el-form :model="modifyUser" :rules="modifyRule" ref="modifyRef" label-width="80px" size="small">
        <el-form-item label="姓名:" prop="truename">
          <el-input v-model="modifyUser.truename"></el-input>
        </el-form-item>
        <el-form-item label="手机号:" prop="phone">
          <el-input v-model="modifyUser.phone"></el-input>
        </el-form-item>
        <el-form-item label="性别:" prop="gender" align="left">
          <el-radio-group v-model="modifyUser.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期:" prop="birth">
          <el-date-picker v-model="modifyUser.birthday" type="date" placeholder="选择日期" style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="modifyUser.email"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyMessageConfirm('modifyRef')">确定</el-button>
          <el-button @click="modifyMessageCancel('modifyRef')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="修改密码" :visible.sync="modifyPasswordShow" :before-close="handleClosePassword" align="center">
      <el-form :model="modifyPass" :rules="passwordRule" ref="passwordRef" label-width="90px" size="small">
        <el-form-item label="原密码:" prop="password">
          <el-input v-model="modifyPass.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码:" prop="newPassword">
          <el-input v-model="modifyPass.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码:" prop="newPassword2">
          <el-input v-model="modifyPass.newPassword2" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyPasswordConfirm('passwordRef')">确定</el-button>
          <el-button @click="modifyPasswordCancel('passwordRef')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
import { getClinicName, userModify, userModifyPwd } from '@/serve/api'
import service from '@/utils/request'
import { md5 } from '@/utils/md5'
export default {
  data() {
    const validateOldPass = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (!valid.test(value)) {
        callback(new Error('密码仅接收数字、字母、下划线'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (!valid.test(value)) {
        callback(new Error('密码仅接收数字、字母、下划线'))
      } else {
        if (this.modifyPass.newPassword2 !== '') {
          this.$refs.passwordRef.validateField('newPassword2')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (!valid.test(value)) {
        callback(new Error('密码仅接收数字、字母、下划线'))
      } else if (value !== this.modifyPass.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    const validateMobile = (rule, value, callback) => {
      const valid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!valid.test(value)) {
        callback(new Error('手机号错误!'))
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
    return {
      modifyUser: {
        truename: '',
        gender: 1,
        phone: '',
        email: '',
        birthday: ''
      },
      modifyRule: {
        truename: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ],
      },
      modifyPass: {
        password: '',
        newPassword: '',
        newPassword2: ''
      },
      passwordRule: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          { validator: validateOldPass, trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        newPassword2: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      },
      modifyMessageShow: false,  // 修改资料
      modifyPasswordShow: false,  // 修改密码
      clinicName: ''  // 诊所名
    }
  },
  methods: {
    editMessage() {
      this.modifyMessageShow = true
      this.modifyUser.truename = this.user.truename
      this.modifyUser.phone = this.user.phone
      this.modifyUser.email = this.user.email
      this.modifyUser.birthday = this.user.birthday ? new Date(parseInt(this.user.birthday, 10)) : ''
      this.modifyUser.gender = this.user.gender
    },
    modifyMessageCancel(formName) {
      this.modifyMessageShow = false
      this.$refs[formName].resetFields()
    },
    handleCloseMessage() {
      this.modifyMessageShow = false
      this.$refs.modifyRef.resetFields()
    },
    modifyMessageConfirm(formName) {
      this.modifyMessageShow = false
      this.$refs[formName].resetFields()
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 验证成功的处理
          const birth = this.modifyUser.birthday ? this.modifyUser.birthday.getTime().toString() : ''
          service(userModify, {
            userid: this.user.userid,
            items: [
              {
                name: 'truename',
                newVal: this.modifyUser.truename
              },
              {
                name: 'phone',
                newVal: this.modifyUser.phone
              },
              {
                name: 'gender',
                newVal: this.modifyUser.gender.toString()
              },
              {
                name: 'email',
                newVal: this.modifyUser.email
              },
              {
                name: 'birthday',
                newVal: birth
              }
            ]
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              const userInfo = deepClone(this.user)
              userInfo.truename = this.modifyUser.truename
              userInfo.phone = this.modifyUser.phone
              userInfo.email = this.modifyUser.email
              userInfo.birthday = birth
              userInfo.gender = this.modifyUser.gender
              this.$store.commit('user/SET_USER', userInfo)
              this.$message.success('资料修改成功')
            }
          })
        } else {
          return false
        }
      })
    },
    editPassword() {
      this.modifyPasswordShow = true
    },
    modifyPasswordCancel(formName) {
      this.modifyPasswordShow = false
      this.$refs.passwordRef.resetFields()  // 重置表单
    },
    handleClosePassword() {
      this.modifyPasswordShow = false
      this.$refs[formName].resetFields()  // 重置表单
    },
    modifyPasswordConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 校验密码成功的处理
          service(userModifyPwd, {
            oldpswd: md5(this.modifyPass.password),
            newpswd: md5(this.modifyPass.newPassword)
          }).then(res => {
            this.$refs[formName].resetFields()
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              // 修改密码成功的回调
              this.modifyPasswordShow = false
            }
          })
        } else {
          return false
        }
      })
    },
    // 获取诊所名
    handleClinicName() {  
      service(getClinicName).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.clinicName = res.clinic_name
        }
      })
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  created() {
    if (this.user.grade !== 1) {
      this.handleClinicName()
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  width: 700px;
  margin: 30px auto;
  .message, .safe {
    color: #666;
    p {
      border-bottom: 1px dashed #ccc;
      padding: 6px;
    }
  }
}
</style>
