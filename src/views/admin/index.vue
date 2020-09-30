<template>
  <div class="admin">
    <el-menu 
      :default-active="$route.path" 
      router
      background-color="#304156"
      text-color="#fff"
      active-text-color="#1890ff">
      <div class="title">
        <img src="@/assets/404_images/add.png">
        <h4>HIS-云诊所</h4>
      </div>
      <el-menu-item index="/admin/clinic-list">
        <i class="el-icon-office-building"></i>
        <span>诊所列表</span>
      </el-menu-item>
      <el-menu-item index="/admin/account-info">
        <i class="el-icon-user-solid"></i>
        <span>用户信息</span>
      </el-menu-item>
    </el-menu>
    <div class="container">
      <el-dropdown @command="dropdownCommand">
        <span class="el-icon-arrow-down el-icon--right">{{ showName }}</span>   
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="showInfo">用户信息</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  methods: {
    dropdownCommand(command) {
      switch (command) {
        case 'logout':
          this.logout()
          break
        case 'showInfo':
          this.showInfo()
          break
      }
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    showInfo() {
      this.$router.push({ path: '/admin/account-info' })
    }
  },
  computed: {
    ...mapGetters(['token', 'user']),
    showName() {
      return this.user.truename || this.user.username
    }
  },
  created() {
    if (!this.token) {
      this.$router.replace({ path: '/login' })
    } else if (this.user.grade !== 1) {
      this.$router.push({ path: '/registration' })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-menu {
  width: 200px;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
  overflow: hidden;
  border-right: 0;
  .title {
    display: flex;
    align-items: center;
    margin-left: 20px;
    color: #1890ff;
    font-size: 18px;
    img {
      width: 23px;
      height: 23px;
      border-radius: 50%;
    }
    h4 {
      color: #fff;
    }
  }
}
.container {
  height: 50px;
  overflow: hidden;
  background: #fff;
  display: flex;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  .el-dropdown {
    margin-top: 20px;
    text-align: right;
    margin-right: 20px;
    flex: 1;
    .el-icon-arrow-down {
      font-size: 16px;
      margin-right: 40px;
    }
  }
}
</style>
