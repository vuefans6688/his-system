<template>
  <div class="accounts-detail">
    <h3 class="title">交易明细详情</h3>
    <el-table :data="outputList" stripe>
      <el-table-column prop="bke384" label="医药机构结算业务序列号"></el-table-column>
      <el-table-column prop="bkf500" label="费用序列号"></el-table-column>
      <el-table-column prop="aae072" label="费用单据号"></el-table-column>
      <el-table-column prop="akc225" label="单价">
        <template slot-scope="scope">
          <span>{{ scope.row.akc225 | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="akc226" label="数量"></el-table-column>
      <el-table-column prop="akc264" label="医疗费总额">
        <template slot-scope="scope">
          <span>{{ scope.row.akc264 | priceFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import service from '@/utils/request'
import { dzdetailquery } from '@/serve/api'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      outputList: []
    }
  },
  async created() {
    const connectionStatus = await connectionTest()
    if (connectionStatus === '1') {
      this.getSheBaoMenuInfo()
    }
  },
  methods: {
    getSheBaoMenuInfo() {  // 获取交易明细查询
      service(dzdetailquery, {
        transBody: {
          akc190: this.$route.query.akc190,  // 门诊流水号
          bke384: this.$route.query.bke384  // 医药机构结算业务序列号
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          this.outputList = res.transBody.outputlist ? res.transBody.outputlist : []
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.accounts-detail {
  margin-top: 20px;
  margin-left: 30px;
  .el-table {
    width: 100%;
    margin-top: 20px;
  }
}
</style>

