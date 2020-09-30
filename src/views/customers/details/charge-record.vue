<template>
  <div class="charge-record">
    <el-table :data="chargeRecordList" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="paytime" label="收/退费时间" align="center" width="160"></el-table-column>
      <el-table-column prop="department" label="就诊科室" align="center"></el-table-column>
      <el-table-column prop="doctor" label="就诊医生" align="center"></el-table-column>
      <el-table-column label="应收总金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.totalprice | isCharge(1, scope.row.chargestatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实收金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realprice | isCharge(1, scope.row.chargestatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退费金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realprice | isCharge(2, scope.row.chargestatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="现金" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.payprice || scope.row.realprice | payMethodFilter(1, scope.row.paymethod) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="银行卡" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.payprice || scope.row.realprice | payMethodFilter(2, scope.row.paymethod) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="微信支付" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.payprice || scope.row.realprice | payMethodFilter(3, scope.row.paymethod) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付宝支付" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.payprice || scope.row.realprice | payMethodFilter(4, scope.row.paymethod) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="total, prev, pager, next, jumper" :page-size="condition.pagesize" 
      :total="total" @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { dateFilter } from '@/utils/filters'
import { customerPayedList } from '@/serve/api'
import service from '@/utils/request'
export default {
  props: {
    customerId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chargeRecordList: [],
      condition: {
        fromdate: new Date(2000, 1, 1).format('yyyy-MM-dd'),
        todate: new Date().format('yyyy-MM-dd'),
        chargestatus: -1,  // 查询所有
        pagesize: 12,
        pageindex: 0
      },
      total: 0
    }
  },
  methods: {
    getDate(row, cell, cellValue) {
      return dateFilter(cellValue, 'yyyy-MM-dd hh:mm') || '-'
    },
    // 获取费用列表
    getChargedList() {
      service(customerPayedList, {
        patientid: this.customerId,
        ...this.condition
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.chargeRecordList = res.entity || []
          this.total = res.totalcount || 0
        }
      })
    },
    // 翻页
    handleCurrentChange(index) {
      this.condition.pageindex = index - 1
      this.getChargedList()
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic'])
  },
  filters: {
    // 判断为收费记录或者退费记录
    isCharge(date, rowStatus, dataStatus) {
      return rowStatus === dataStatus ? date : ''
    },
    // 判断何种支付方式
    payMethodFilter(price, rowStatus, dataStatus) {
      return rowStatus === dataStatus ? price : 0
    }
  },
  created() {
    this.getChargedList()
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  width: 90%;
  margin-top: 20px;
  margin-left: 30px;
}
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
