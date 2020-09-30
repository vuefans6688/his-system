<template>
  <div class="bind-medical">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="机构绑定" name="1">
        <bind-company></bind-company>
      </el-tab-pane>
      <el-tab-pane label="机构医务人员管理" name="4">
        <bind-staff v-if="activeName === '4'"></bind-staff>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import BindCompany from './bind-company'
import BindStaff from './bind-staff'
export default {
  data() {
    return {
      activeName: '1'
    }
  },
  components: { BindCompany, BindStaff }
}
</script>

<style lang="scss" scoped>
.bind-medical {
  margin-top: 20px;
  margin-left: 30px;
  .el-tabs {
    width: 90%;
  }
}
</style>
