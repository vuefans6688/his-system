<template>
  <div class="drug-statistics">
    <!-- 挂号查询 -->
    <el-form :model="searchDate" size="small" label-width="80px">
      <el-form-item label="日期:">
        <el-date-picker v-model="searchDate.statisticalDate" type="daterange" :clearable="false"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-table :data="drugTable" ref="multipleTable" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column label="药品名称" align="center" prop="productname">
      </el-table-column>
      <el-table-column label="药品规格" align="center" prop="spectxt">
      </el-table-column>
      <el-table-column label="数量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.xiaoshou_num }}{{ scope.row.xiaoshou_dw }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批发单价" align="center" prop="costprice"></el-table-column>
      <el-table-column label="销售单价" align="center" prop="saleprice"></el-table-column>
      <el-table-column label="批发总价" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.xiaoshou_num * scope.row.costprice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售总价" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.xiaoshou_num * scope.row.saleprice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="利润" align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.saleprice * scope.row.xiaoshou_num - scope.row.costprice * scope.row.xiaoshou_num) | limitFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.date | makeDateTimeString }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="15" 
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { szsbdruglogs } from '@/serve/api'
export default {
  data() {
    return {
      drugTable: [],  // 数据
      searchDate: {
        drug_name: '',   // 药品名
        drug_type: '',   // 收费类型
        statisticalDate: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()]  // 日期
      },
      pageindex: 0,  // 当前页数
      total: 0,    // 总页数
      currentPage: 1
    }
  },
  methods: {
    handleCurrentChange(val) {  // 切换页数
      this.pageindex = val - 1
      this.getData()
    },
    // 调药品销售统计接口
    getData() {
      let beginTime = ''
      let endTime = ''
      if (this.searchDate.statisticalDate.length !== 0) {
        beginTime = this.searchDate.statisticalDate[0].format('yyyyMMdd')
        endTime = this.searchDate.statisticalDate[1].format('yyyyMMdd')
      }
      service(szsbdruglogs, {
        begin_time: beginTime,
        end_time: endTime,
        page_index: this.pageindex,
        page_size: 15
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.drugTable = res.result || []
          this.total = res.totalnum || 0
        }
      })
    }
  },
  created() {
    this.getData()  // 调药品销售统计接口
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  filters: {
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2)
    },
    limitFilter(num) {
      return num.toFixed(2)
    }
  },
  watch: {
    searchDate: {
      handler() {
        this.getData()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.drug-statistics {
  margin-top: 20px;
  .el-form {
    display: flex;
  }
  .el-table {
    margin-top: 20px;
    margin-left: 30px;
    width: 95%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
