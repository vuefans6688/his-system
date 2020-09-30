<template>
  <div class="short-message">
    <el-menu default-active="send" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="send">发短信</el-menu-item>
      <el-menu-item index="sent">已发送</el-menu-item>
    </el-menu>
    <div class="calculate">
      <span class="used">已使用短信: {{ used }}条</span>
      <span class="remain">剩余短信数: {{ remain }}条</span>
    </div>
    <patients-list :way="way"></patients-list>
  </div>
</template>

<script>
import PatientsList from '../patients-list'
export default {
  components: { PatientsList },
  data() {
    return {
      used: 0,
      remain: 300,
      way: 'send'
    }
  },
  methods: {
    handleSelect(index) {
      this.way = index
    }
  }
}
</script>

<style lang="scss" scoped>
.short-message {
  margin-top: 20px;
  margin-left: 30px;
  .calculate {
    margin-top: 20px;
    color: #666;
    .remain {
      margin-left: 20px;
    }
  }
}
</style>
