<template>
  <div class="pay-charges-history">
    <el-form :model="searchCondition" size="small" label-width="80px">
      <el-form-item label="姓名:" prop="keyword">
        <el-input v-model="searchCondition.keyword" placeholder="客户姓名或手机号" style="width: 320px;"></el-input> 
      </el-form-item>
      <el-form-item label="日期:" prop="dateVal">
        <el-date-picker v-model="searchCondition.dateVal" type="daterange" 
          range-separator="-" start-placeholder="开始日期"
          unlink-panels end-placeholder="结束日期" :editable="false" :clearable="false">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-table :data="chargeList" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column> 
      <el-table-column prop="chargeid" label="收费单号" align="center" width="140"></el-table-column>
      <el-table-column prop="name" label="姓名" align="center"></el-table-column>
      <el-table-column prop="phone" label="手机号" align="center" width="110"></el-table-column>
      <el-table-column prop="department" label="科室" align="center" width="100"></el-table-column>
      <el-table-column prop="doctor" label="医生" align="center"></el-table-column>
      <el-table-column label="收费时间" align="center" min-width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.paytime | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="cashier" label="操作人" align="center"></el-table-column>
      <el-table-column label="总金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.totalprice | chargeFeeStatus(scope.row.chargestatus) }}</span>  
        </template>
      </el-table-column>
      <el-table-column label="实收金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realprice | chargeFeeStatus(scope.row.chargestatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="减免金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.reduceprice | chargeFeeStatus(scope.row.chargestatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退费金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realprice | backFeeStatus(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付(退费)方式" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.paymethod | payMethod }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.chargestatus === 2" @click="returnsFee(scope.row.chargeid)">查看</el-button>
          <el-button type="text" v-else @click="returnsFee(scope.row.chargeid)">退费</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination layout="total, prev, pager, next, jumper" :page-size="pagesize" :total="total" 
      @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { payedList } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      isSelected: false,  // 是否精确查找
      searchCondition: {
        keyword: '',  // 客户姓名或手机号
        dateVal: [new Date(), new Date()]  // 日期
      },
      chargeList: [],
      pageindex: 0,  // 当前页码
      pagesize: 15,
      total: 0
    }
  },
  methods: {
    // 分页搜索
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.getChargeList()
    },
    getChargeList() {
      service(payedList, {
        name: this.searchCondition.keyword,
        fromdate: this.searchCondition.dateVal[0].format('yyyy-MM-dd'),
        todate: this.searchCondition.dateVal[1].format('yyyy-MM-dd'),
        chargestatus: -1,
        pageindex: this.pageindex,
        pagesize: this.pagesize
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.chargeList = res.entity || []
          this.total = res.totalcount
        }
      })
    },
    // 退费
    returnsFee(chargeid) {
      this.$router.push({ path: `/pay-charges/child/returns-fee/${chargeid}` })
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic'])
  },
  created() {
    this.getChargeList()
  },
  filters: {
    payMethod(payMethod) {
      const methods = [
        { index: 0, label: '其他' },
        { index: 1, label: '现金' },
        { index: 2, label: '银行卡' },
        { index: 3, label: '微信' },
        { index: 4, label: '支付宝' }
      ]
      const method = methods.find(obj => obj.index === payMethod)
      return method ? method.label : ''
    },
    // 退费金额过滤(收费记录返回0)
    backFeeStatus(price, row) {
      if (row.chargestatus === 1) {
        return ''
      } else if (row.chargestatus === 2) {
        return row.paymethod === 5 ? row.totalprice.toFixed(2) : price.toFixed(2)
      }
    },
    // 收费金额过滤器(如果是退费费记录，返回0)
    chargeFeeStatus(price, status) {
      if (status === 2) {
        return ''
      } else if (status === 1) {
        return price.toFixed(2)
      }
    }
  },
  watch: {
    searchCondition: {
      handler() {
        this.getChargeList()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  margin-top: 20px;
  display: flex;
}
.el-table {
  width: 95%;
  margin-top: 20px;
  margin-left: 35px;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
