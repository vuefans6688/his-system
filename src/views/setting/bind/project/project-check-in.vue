<template>
  <div class="project-check-in">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="诊疗项目准入申请" name="1">
        <projectApply v-if="activeName === '1'"></projectApply>
      </el-tab-pane>
      <el-tab-pane label="诊所申请目录" name="2">
        <query-menu menu-type="2" v-if="activeName === '2'"></query-menu>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ProjectApply from './project-apply'
import QueryMenu from '../../query-menu'
export default {
  data() {
    return {
      activeName: '1'
    }
  },
  components: { ProjectApply, QueryMenu }
}
</script>

<style lang="scss" scoped>
.project-check-in {
  margin-top: 20px;
  margin-left: 30px;
}
</style>
