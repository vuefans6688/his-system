<template>
  <div class="drug-check-in">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="药品准入申请" name="1">
        <drug-apply v-if="activeName === '1'"></drug-apply>
      </el-tab-pane>
      <el-tab-pane label="诊所申请目录" name="2">
        <query-menu menu-type="1" v-if="activeName === '2'"></query-menu>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DrugApply from './drug-apply'
import QueryMenu from '../../query-menu'
export default {
  data() {
    return {
      activeName: '1'
    }
  },
  components: { DrugApply, QueryMenu }
}
</script>

<style lang="scss" scoped>
.drug-check-in {
  margin-top: 20px;
  margin-left: 30px;
}
</style>
