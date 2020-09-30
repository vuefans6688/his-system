<template>
  <div class="she-bao-loading">
    <div class="reading">
      社保卡号: <el-input v-model="shebaoForm.shebaoCard" size="small" style="width: 600px;"></el-input>
      <el-button type="primary" size="small" @click="getPersonBaseInfo" :disabled="isReading">确认读卡</el-button>
    </div>
    <el-input v-model="shebaoForm.shebaoPassword" size="small" placeholder="请输入社保卡密码" v-show="passwordShow"></el-input>
    <div class="my-loading" v-show="isReading"></div>
  </div>
</template>

<script>
import service from '@/utils/request'
import { baseinfo, detailinfo } from '@/serve/api'
import connectionTest from '@/common/connection'
export default {
  props: {
    keepReading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      reading: false,
      shebaoForm: {
        shebaoCard: '%GALKXMFSWLUKZHANWDFZ?;07821534685348960214?',
        shebaoPassword: '000000'
      },
      passwordShow: false
    }
  },
  methods: {
    async getPersonBaseInfo() {  // 读卡获取基本信息
      this.reading = true
      try {
        const flag = await connectionTest()
        if (flag === '1') {
          service(baseinfo, {
            transBody: { 
              bzz269: this.shebaoForm.shebaoPassword 
            }
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              this.getPersonDetailInfo()
              this.$emit('getPersonBaseInfo', res.transBody, true)
            } else {
              this.shebaoForm.shebaoPassword = ''
              this.passwordShow = true
              this.reading = false
              this.$emit('readFailed', 'failed')
            }
          }).catch(() => {
            this.reading = false
            this.$emit('readFailed', 'error')
          })
        } else {
          this.reading = false
        }
      } catch (e) {
        this.reading = false
      }
    },
    getPersonDetailInfo() {  // 读卡获取详细信息
      service(detailinfo, {
        transBody: { 
          bzz269: this.shebaoForm.shebaoPassword 
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.reading = false
          this.$emit('getPersonDetailInfo', res.transBody, true)
        } else {
          this.reading = false
          this.$emit('readFailed', 'failed')
        }
      }).catch(() => {
        this.reading = false
        this.$emit('readFailed', 'error')
      })
    }
  },
  computed: {
    isReading() {
      return this.reading || this.keepReading
    }
  }
}
</script>

<style lang="scss" scoped>
.el-button {
  margin-left: 10px;
}
.my-loading {
  width: 300px;
  height: 22px;
  border-radius: 6px;
  background-color: #56BC94;
  position: relative;
  overflow: hidden;
  margin: 10px auto;
}
.my-loading::after {
  display: block;
  content: '';
  font-size: 12px;
  color: #fff;
  line-height: 22px;
  text-align: center;
  position: absolute;
  width: 100px;
  height: 22px;
  border-radius: 5px;
  background-color: #666;
  animation: my-move 2s infinite linear;
  -webkit-animation: my-move 2s infinite linear; 
}


@keyframes my-move {
  from {
    left: -50px;
  }
  to {
    left: 320px;
  }
}

@-webkit-keyframes my-move {
  from {
    left: -50px;
  }
  to {
    left: 320px;
  }
}
</style>
