<template>
  <div class="navbar">
    <hamburger class="hamburger-container" :is-active="sidebar.opened" @toggleClick="toggleSideBar"></hamburger>
    <breadcrumb class="breadcrumb-container"></breadcrumb>
    <div class="clinc-name">
      <img src="@/assets/404_images/add.png">
      <span>{{ clinicName }}</span>
    </div>
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="avatar + '?imageView2/1/w/80/h/80'">
          <span class="el-icon-caret-bottom">{{ showName }}</span>
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <router-link to="/dashboard">
            <el-dropdown-item>仪表盘</el-dropdown-item>
          </router-link>
          <router-link to="/admin/clinic-list">
            <el-dropdown-item v-if="user.grade === 1">诊所列表</el-dropdown-item>
          </router-link>
          <router-link to="/admin/account-info">
            <el-dropdown-item>用户信息</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { clinicInfo } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      clinicName: ''
    }
  },
  components: { Breadcrumb, Hamburger },
  methods: {
    // 侧边栏
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 退出
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    // 获取诊所信息
    getClinicInfo() {
      service(clinicInfo).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const obj = {
            cardArea: res.clinic.areacode,
            hospitalCode: res.clinic.hospitalcode,
            operatorCode: res.clinic.operatorcode,
            operatorName: res.clinic.operatorname,
            zhihuiybtoken: res.clinic.zhihuiybtoken
          }
          this.$store.commit('user/SET_SHE_BAO', obj)
        }
      })
    },
    // 获取诊所名称
    getClinicName() {
      service(clinicInfo).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.clinicName = res.clinic.name
        }
      })
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'token', 'user']),
    showName() {
      return this.user.truename || this.user.username
    }
  },
  created() {
    if (!this.token) {
      this.$router.replace({ path: '/login' })
    } else {
      this.getClinicInfo()
      this.getClinicName()
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    &:hover {
      background: rgba(0, 0, 0, 0.025)
    }
  }
  .breadcrumb-container {
    float: left;
  }
  .clinc-name {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #42b983;
    font-size: 20px;
    img {
      width: 23px;
      height: 23px;
      border-radius: 50%;
    }
  }
  .right-menu {
    height: 100%;
    line-height: 50px;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;
      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
    .avatar-container {
      margin-right: 30px;
      .avatar-wrapper {
        display: flex;
        .user-avatar {
          cursor: pointer;
          width: 35px;
          height: 35px;
          border-radius: 10px;
          margin-top: 8px;
        }
        .el-icon-caret-bottom {
          cursor: pointer;
          font-size: 16px;
          margin-top: 22px;
        }
      }
    }
  }
}
</style>
