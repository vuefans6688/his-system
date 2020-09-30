<template>
  <div class="day-accounts">
    <div class="head">
      <h3 class="date">{{ date | dateFilter }}交易流水</h3>
      <h3 class="title">医保系统账单(总计{{ allSheBaoList.length }}条)</h3>
    </div>
    <div class="his-table">
      <el-table :data="currentPageHisList" type="index" stripe>
        <el-table-column align="center" prop="jigousn" label="业务结算号" width="130"></el-table-column>
        <el-table-column align="center" prop="patientname" label="姓名"></el-table-column>
        <el-table-column align="center" prop="chargestatus" label="结算状态" :formatter="chargeStatus"></el-table-column>
        <el-table-column align="center" prop="total" label="医疗费总额"></el-table-column>
        <el-table-column align="center" prop="jijinpay" label="基金支付"></el-table-column>
        <el-table-column align="center" prop="personaccount" label="个人账户支付"></el-table-column>
        <el-table-column align="center" prop="personpay" label="自费"></el-table-column>
      </el-table>
      <el-pagination :page-size="hisPagination.pagesize" layout="total, prev, pager, next, jumper" 
        :total="allHisList.length" @current-change="hisPageChange">
      </el-pagination>
    </div>
    <div class="client-table">
      <el-table :data="currentPageSheBaoList" type="index" stripe>
        <el-table-column align="center" prop="bke384" label="业务结算号" width="130"></el-table-column>
        <el-table-column align="center" prop="aac003" label="姓名"></el-table-column>
        <el-table-column align="center" prop="aka018" label="结算状态" :formatter="chargeStatus"></el-table-column>
        <el-table-column align="center" prop="akc264" label="医疗费总额"></el-table-column>
        <el-table-column align="center" prop="akb068" label="基金支付"></el-table-column>
        <el-table-column align="center" prop="akb066" label="个人账户支付"></el-table-column>
        <el-table-column align="center" prop="akb067" label="自费"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="detail(scope.row.akc190, scope.row.bke384)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :page-size="clientPagination.pagesize" layout="total, prev, pager, next, jumper" 
        :total="allSheBaoList.length" @current-change="clientPageChange">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { dzquery, szsbchargequery } from '@/serve/api'
import service from '@/utils/request'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      date: new Date(),
      allSheBaoList: [],  // 社保所有数据
      allHisList: [],  // his所有数据
      hisPagination: {  // 社保分页
        pagesize: 10,
        currentpage: 0
      },
      clientPagination: {  // his分页
        pagesize: 10,
        currentpage: 0
      }
    }
  },
  methods: {
    detail(akc190, bke384) {
      this.$router.push({ path: '/setting/bind/accounts/accounts-detail', query: { akc190, bke384 } })
    },
    // 结算状态过滤
    chargeStatus(row, column, cellValue) {
      if (cellValue === 1 || cellValue === '1') {
        return '正常'
      } else if (cellValue === 2 || cellValue === '2') {
        return '撤销'
      } else if (cellValue === 3 || cellValue === '3') {
        return '退费'
      }
      return 'error'
    },
    // his分页
    hisPageChange(index) {
      this.hisPagination.currentpage = index - 1
    },
    // client分页
    clientPageChange(index) {
      this.clientPagination.currentpage = index - 1
    },
    // 社保流水获取
    getSheBaoList(pageno) {
      service(dzquery, {
        transBody: {
          bad766: Number(this.date),
          pageno
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 当前页请求成功
          this.allSheBaoList = this.allSheBaoList.concat(res.transBody.outputlist)
          // 若还有数据 继续获取
          if (res.transBody.endpage === 0) {
            this.getSheBaoList(pageno + 1)
          } else {  // 所有数据获取完毕
            this.sheBaoSortWithBke384()
          }
        }
      })
    },
    // 按照业务结算号排序
    sheBaoSortWithBke384() {
      this.allSheBaoList.sort((obj1, obj2) => obj2.bke384 - obj1.bke384)
    },
    // his流水获取
    getHisList() {
      service(szsbchargequery, {
        reqdate: Number(this.date)
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.allHisList = res.data || []
          this.allHisList.sort((obj1, obj2) => obj2.jigousn - obj1.jigousn)
        }
      })
    }
  },
  computed: {
    // 社保流水当前页
    currentPageSheBaoList() {
      const pagecount = Math.ceil(this.allSheBaoList.length / this.clientPagination.pagesize)
      if (this.clientPagination.currentpage === pagecount - 1) {
        return this.allSheBaoList.slice(this.clientPagination.currentpage * this.clientPagination.pagesize)
      }
      return this.allSheBaoList.slice(this.clientPagination.currentpage * this.clientPagination.pagesize,
        (this.clientPagination.currentpage + 1) * this.clientPagination.pagesize)
    },
    // his流水当前页
    currentPageHisList() {
      const pagecount = Math.ceil(this.allHisList.length / this.hisPagination.pagesize)
      if (this.allHisList.currentpage === pagecount - 1) {
        return this.allHisList.slice(this.hisPagination.currentpage * this.hisPagination.pagesize)
      }
      return this.allHisList.slice(this.hisPagination.currentpage * this.hisPagination.pagesize,
        (this.hisPagination.currentpage + 1) * this.hisPagination.pagesize)
    }
  },
  async created() {
    this.date = this.$route.params.date
    const connectionStatus = await connectionTest()
    if (connectionStatus === '1') {
      this.getSheBaoList(1)
    }
    this.getHisList()
  },
  filters: {
    dateFilter(date) {
      return date.substring(0, 4) + '年' + date.substring(4, 6) + '月' + date.substring(6, 8) + '日'
    }
  }
}
</script>

<style lang="scss" scoped>
.day-accounts {
  margin-top: 20px;
  margin-left: 30px;
  .head {
    color: #666;
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid #eee;
  }
  .his-table, .client-table {
    margin-top: 20px;
    .el-table {
      width: 100%;
    }
    .el-pagination {
      margin-top: 10px;
      text-align: center;
    }
  }
}
</style>

