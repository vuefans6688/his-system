<template>
  <div class="user-forget">
    <el-card class="box-card">
      <el-form :model="findPassword" ref="passwordRef" :rules="rules" size="small" label-width="100px">
        <h3 style="text-align: center;color: #666;">找回密码</h3>
        <el-form-item label="账号:" prop="username">
          <el-input v-model="findPassword.username" @keyup.13.native="changePassword('passwordRef')" placeholder="机构用户请输入手机号" style="width: 320px;"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="findPassword.mobile" @keyup.13.native="changePassword('passwordRef')" :maxlength="11" style="width: 320px;" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="验证码:" prop="accessCode">
          <el-input v-model="findPassword.accessCode" @keyup.13.native="changePassword('passwordRef')" style="width: 170px;" placeholder="请输入验证码"></el-input>
          <el-button type="primary" @click="sendAccessCode('passwordRef')" :disabled="!stop" style="width: 140px;margin-left: 10px;">
            {{ buttonText }}
          </el-button>
        </el-form-item>
        <el-form-item label="新密码:" prop="password">
          <el-input v-model="findPassword.password" type="password" @keyup.13.native="changePassword('passwordRef')" style="width: 320px;" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码:" prop="passConfirm">
          <el-input v-model="findPassword.passConfirm" type="password" @keyup.13.native="changePassword('passwordRef')" style="width: 320px;" placeholder="请输入确认新密码"></el-input>
        </el-form-item>
        <div class="back-login">
          <el-button type="primary" @click="$router.push('/login')">返回登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { login, forgotSmscode, forgotPwd, clinicInfo } from '@/serve/api'
import service from '@/utils/request'
import { md5 } from '@/utils/md5'
export default {
  data() {
    const validatePass = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (!valid.test(value)) {
        callback(new Error('密码仅接收数字、字母、下划线'))
      } else {
        if (this.findPassword.passConfirm !== '') {
          this.$refs.passwordRef.validateField('passConfirm')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      const valid = /^(\w){8,}$/
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (!valid.test(value)) {
        callback(new Error('密码仅接收数字、字母、下划线'))
      } else if (value !== this.findPassword.password) {
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
    const validateUsernameFommat = (rule, value, callback) => {
      const valid = /^[a-zA-Z0-9_]{6,}$/
      if (!valid.test(value)) {
        callback(new Error('用户名仅接受数字、字母或下划线'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        username: [
          { min: 6, message: '用户名至少6位', trigger: 'blur' },
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: validateUsernameFommat, trigger: 'blur' }
        ],
        mobile: [
          { validator: validateMobile, trigger: 'blur' },
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ],
        accessCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        passConfirm: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      },
      findPassword: {
        username: '',
        mobile: '',
        accessCode: '',
        password: '',
        passConfirm: ''
      },
      timer: 60,  // 默认倒数60秒
      stop: true,  // 默认是停止的
      interval: null  // 定时器对象
    }
  },
  methods: {
    switchRegister() {
      this.$router.push({ path: '/register' })
    },
    sendAccessCode(ruleForm) {
      this.$refs.passwordRef.validateField('username', error => {
        if (error) {
          return
        }
        this.$refs.passwordRef.validateField('mobile', error => {
          if (error) {
            return
          }
          // 用户名和手机号校验成功
          this.runTime()
          service(forgotSmscode, {
            username: this.findPassword.username,
            phone: this.findPassword.mobile
          }).then(res => {
            if (typeof res === 'string' && res.includes('ERRORCODE')) {
              this.$refs[ruleForm].resetFields()
            }
          })
        })
      })
    },
    changePassword(formName) {
      this.$refs[formName].validate(valid => {
        // 验证成功
        if (valid) {
          service(forgotPwd, {
            username: this.findPassword.username,
            phone: this.findPassword.mobile,
            smscode: this.findPassword.accessCode,
            passwd: md5(this.findPassword.password)
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              const loading = this.$loading({
                lock: true,
                text: '密码修改成功, 正在返回登录',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
              })
              setTimeout(() => {
                loading.close()
                this.switchLogin()
              }, 500)
            } else {
              this.$refs[formName].resetFields()
            }
          })
        } else {
          return false
        }
      })
    },
    runTime() {
      this.stop = false
      this.timer = 60
      this.interval = setInterval(() => {
        this.timer--
        if (this.timer <= 0) {
          this.stop = true
          clearInterval(this.interval)
        }
      }, 1000)
    }
  },
  computed: {
    buttonText() {
      return this.stop ? '发送验证码' : `${this.timer}秒后可重新发送`
    }
  }
}
</script>

<style lang="scss" scoped>
.user-forget {
  background-color: #2d3a4b;
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  .box-card {
    width: 500px;
    margin: 50px auto;
    .back-login {
      width: 100%;
      text-align: center;
      margin-left: 30px;
      .el-button {
        width: 320px;
      }
    }
  }
}

</style>