<template>
  <div class="material-check-in">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="耗材准入申请" name="1">
        <materialApply v-if="activeName === '1'"></materialApply>
      </el-tab-pane>
      <el-tab-pane label="诊所申请目录" name="2">
        <query-menu menu-type="3" v-if="activeName === '2'"></query-menu>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MaterialApply from './material-apply'
import QueryMenu from '../../query-menu'
export default {
  data() {
    return {
      activeName: '1'
    }
  },
  components: { MaterialApply, QueryMenu }
}
</script>

<style lang="scss" scoped>
.material-check-in {
  margin-top: 20px;
  margin-left: 30px;
}
</style>
