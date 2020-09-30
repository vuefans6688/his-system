<template>
  <div class="user-regist">
    <el-card class="box-card">
      <el-form :model="registForm" ref="registRef" :rules="rules" size="small" label-width="90px">
        <h3 class="title">用户注册</h3>
        <el-form-item label="手机号:" prop="mobile">
          <el-input v-model="registForm.mobile" @keyup.enter.native="regist('registRef')" :maxlength="11" placeholder="请输入手机号" style="width: 320px;"></el-input>
        </el-form-item>
        <el-form-item label="验证码:" prop="accessCode">
          <el-input v-model="registForm.accessCode" @keyup.enter.native="regist('registRef')" style="width: 170px;" placeholder="请输入验证码"></el-input>
          <el-button type="primary" @click="sendVerifyCode" :disabled="!stop" style="width: 140px;margin-left: 10px;">
            {{ buttonText }}
          </el-button>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="registForm.password" @keyup.enter.native="regist('registRef')" type="password" style="width: 320px;" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码:" prop="passwordConfirm">
          <el-input v-model="registForm.passwordConfirm" @keyup.enter.native="regist('registRef')" type="password" style="width: 320px;" placeholder="请输入确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="registForm.isAgreeUserprotocol">
            <span>我已阅读并同意</span> 
            <el-button type="text" @click="isShowUserprotocol = true" style="font-size: 16px;">"用户注册协议"</el-button>
          </el-checkbox>
        </el-form-item>
        <div class="control">
          <el-button class="regist" @click="regist('registRef')" :disabled="!registForm.isAgreeUserprotocol" size="small" type="primary">
            注册
          </el-button>
          <el-button class="login" type="text" @click="switchLogin">已有账户?去登录</el-button>
        </div>
      </el-form>
    </el-card>
    <el-dialog class="register-success" :visible.sync="registSuccess" :before-close="handleClose" title="恭喜您注册成功" align="center">
      <p class="username" v-show="registForm.username">您的用户名: {{ registForm.username }}</p>
      <p class="mobile">您的注册手机号: {{ registForm.mobile }}</p>
    </el-dialog>
    <el-dialog class="user-protocol" :visible.sync="isShowUserprotocol" title="用户注册协议" align="center">
      <p>本协议是由深圳市澳考科技有限公司 （以下简称“澳考科技”）与所有使用澳考云诊所服务的主体（包括个人、团队等）（以下简称“用户”）
        对澳考云诊所服务的任何服务及相关服务所订立的有效合约。使用澳考云诊所的任何服务即表示接受本协议的全部条款，包括澳考科技对服务
        协议随时所做的任何修改。本服务协议一旦发生变动，将在本网站上公布修改内容。修改后的使用协议一经在网页上公布即有效替代原来的服
        务协议。澳考科技在平台上公布的政策、平台规则均为本协议的补充协议，与本协议具有同等效力。 本协议适用于任何澳考云诊所服务，包
        括本协议期限内的用户所使用的各项服务和软件的升级和更新。 请您仔细阅读本注册协议，您点击“注册”按钮后，本协议即构成对双方有约束
        力的法律
      </p>
      <h3>一、隐私保护</h3>
      <p>澳考科技将根据行业标准严格对患者信息保密，未经同意我们不会将患者信息及与澳考云诊所系统进行数据交互的非公开内容提供给第三方
        （公司或个人），但以下情况除外：
      </p>
      <p>1、相关法律法规或监管机构、司法机构要求提供用户的个人资料；</p>
      <p>2、国家司法机关符合法律规定并经法定程序的检查及其他操作；</p>
      <p>3、任何第三方盗用、冒用或未经许可擅自披露、使用或对外公开的情况；</p>
      <h3>二、免责申明</h3>
      <p>1、用户同意使用澳考云诊所系统及其相关服务，是出于用户个人的意愿，并愿意承担因自身意愿而产生的任何风险；</p>
      <p>
        2、澳考云诊所系统基于医生提供的真实准确信息为依据，为医生诊断提供建议；特此声明，澳考云诊所系统所提供的一切建议仅供医生在诊疗
        过程中参考使用，诊疗过程中最终决定权属于医生，因此澳考科技对澳考云诊所系统提出的任何建议导致的包括但不限于误诊、错诊、医疗事故
        等不承担任何法律责任。
      </p>
      <h3>三、知识产权保护</h3>
      <p>
        澳考云诊所系统提供的服务中包含的任何文本、图片、图形、音频、视频资料和其他知识产权以及商业秘密，均受版权、商标及中国法律法规之
        保护。未经澳考科技相关权利人同意，用户不得将上述资料在任何媒介（包括但不限于媒体、网络、报纸、杂志等）直接或间接发布、播放或被
        用于其它任何商业目的。
      </p>
      <p>
        违反者必须销毁任何已经取得的上述信息、资料、软件或产品，同时，澳考科技保留采用技术、行政及法律手段挽回损
        失的权利，并可依照有关法律规定和澳考相关规定，追究其行政或民事责任，情节严重的，还将提请司法机关追究刑事责任。无论甲方采取何种
        方式追究乙方责任，澳考均有权要求违反者赔偿澳考所受到的实际损失。
      </p>
      <h3>特别提示：</h3>
      <p style="color: #f00;font-size: 16px;">
        用户在使用澳考云诊所系统之前，请确保本人已经完全理解并接受本须知所有条款（尤其免责条款）。一旦用户正式使用，则表明用户已经完全
        理解并接受本须知所有条款。
      </p>
    </el-dialog>
  </div>
</template>

<script>
import { login, registSmscode, regist } from '@/serve/api'
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
        if (this.registForm.passwordConfirm !== '') {
          this.$refs.regist.validateField('passwordConfirm')
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
      } else if (value !== this.registForm.password) {
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
    return {
      registSuccess: false,
      registForm: {
        username: '',
        mobile: '',
        accessCode: '',
        password: '',
        passwordConfirm: '',
        isAgreeUserprotocol: true
      },
      timer: 60,  // 默认倒数60秒
      stop: true,  // 默认是停止的
      interval: null,  // 定时器对象
      rules: {
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
        passwordConfirm: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      },
      isShowUserprotocol: false  // 是否显示用户协议
    }
  },
  methods: {
    switchLogin() {
      this.$router.push({ path: '/login' })
    },
    handleClose() {
      setTimeout(() => {
        this.registSuccess = false
        this.login()
      }, 500)
    },
    regist(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 验证成功的回调
          service(regist, {
            username: this.registForm.mobile,
            password: md5(this.registForm.password),
            smscode: this.registForm.accessCode
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              this.registSuccess = true
            } else {
              this.$refs[formName].resetFields()
            }
          })
        } else {
          return false
        }
      })
    },
    // 登录
    login() {
      service(login, {
        username: this.registForm.mobile,
        password: md5(this.registForm.password)
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 登录成功的回调  
          this.$store.commit('user/SET_TOKEN', res.accessToken)  // 设置token
          this.$store.commit('user/SET_USER', res)
          this.$router.push({ path: '/admin' })
        }
      })
    },
    sendVerifyCode() {
      this.$refs.registRef.validateField('mobile', error => {
        if (error) {
          return
        }
        // 手机号正确的处理
        this.runTime()
        // 发送验证码
        service(registSmscode, {
          phone: this.registForm.mobile
        })
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
.user-regist {
  background-color: #2d3a4b;
  min-height: 100vh;
  min-width: 100vw;
  overflow: hidden;
  .box-card {
    width: 500px;
    margin: 50px auto;
    .title {
      text-align: center;
      color: #666;
    }
    .control {
      width: 100%;
      text-align: center;
      .regist {
        width: 40%;
        margin-left: 32px;
      }
      .login {
        font-size: 16px;
      }
    }
  }
  .register-success {
    width: 40%;
    .username, .mobile {
      color: #42b983;
      font-size: 16px;
    }
  }
  .user-protocol {
    margin: 10px auto;
    p, h3 {
      text-align: left;
    }
    p {
      margin-left: 6px;
    }
  }
}
</style>
