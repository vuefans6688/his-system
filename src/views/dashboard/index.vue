<template>
  <div class="dashboard-container">
    <div class="dashboard-name">用户姓名: {{ showName }}</div>
    <div class="dashboard-name">用户权限: {{ name }}</div>
    <div class="dashboard-date">当前时间: {{ date | dateFilter }}</div>
  </div>
</template>

<script>
import { paddingZero } from '@/utils/format'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      date: new Date(),
      timer: null
    }
  },
  methods: {
    getTime() {
      this.timer = setInterval(() => {
        this.date = new Date()
      }, 1000)
    }
  },
  computed: {
    ...mapGetters(['name', 'user']),
    showName() {
      return this.user.truename || this.user.username
    }
  },
  filters: {
    dateFilter() {
      const date = new Date()
      const year = date.getFullYear()
      const month = paddingZero(date.getMonth() + 1)
      const day = paddingZero(date.getDate())
      const weekDay = date.getDay()
      const hour = paddingZero(date.getHours())
      const minute = paddingZero(date.getMinutes())
      const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return `${year}年${month}月${day}日 ${hour}时${minute}分 ${weekList[weekDay]}`
    }
  },
  mounted() {
    this.getTime()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin-top: 30px;
    margin-left: 30px;
  }
  &-name, &-date {
    font-size: 25px;
    height: 46px;
    line-height: 46px;
    color: #666;
  }
}
</style>
