<template>
  <div class="test-filters">
    <div class="filter">{{ bkc346 | bkc346Filter }}</div>
    <el-button @click="request">请求his</el-button>
    <el-button @click="test">请求社保客户端</el-button>
  </div>
</template>

<script>
import service from '@/utils/request'  // his
import { getClinicName, connect } from '@/serve/api'
import { userCode } from '@/common/code'  // 按需导出
import { AKF001 } from '@/common/dictionary'
import connectionTest from '@/common/connection'  // 测试连接
export default {
  data() {
    return {
      bkc346: '00',
      sections: AKF001,
      cardReading: true
    }
  },
  methods: {
    closeRegistWin(flag) {
      this.cardReading = false
    },
    async test() {
      const flag = await connectionTest()
    },
    // 请求his
    request() {
      service(getClinicName).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
        } else {  // code错误需要进行的操作
          const code = res.split(':')[1]
        }
      })
    },
    // 请求社保客户端
    requestClient() {  // 测试连接
      service(connecton).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
        } else {  // code错误需要进行的操作
          const code = res.split(':')[1]
        }
      })
    }
  },
  filters: {
    bkc346Filter(val) {
      return userCode.bkc346[val]  // 按需导出使用
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
