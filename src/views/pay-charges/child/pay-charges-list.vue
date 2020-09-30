<template>
  <div class="pay-charges-list">
    <el-form :model="searchCondition" size="small" label-width="80px">
      <el-form-item label="姓名:" prop="keyword">
        <el-input size="small" v-model="searchCondition.keyword" placeholder="客户姓名或手机号"
          style="width: 320px;">
        </el-input>
      </el-form-item>
      <el-form-item label="日期:" prop="dateVal">
        <el-date-picker v-model="searchCondition.dateVal" size="small" type="daterange" 
          range-separator="-" :editable="false" :clearable="false"
          unlink-panels start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-table :data="chargeList" stripe>
      <el-table-column type="index" label="序号" align="center" width="70">
      </el-table-column>
      <el-table-column prop="patient_name" label="姓名" align="center">
      </el-table-column>
      <el-table-column prop="patient_phone" label="手机号" align="center"></el-table-column>
      <el-table-column label="就诊日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="待缴金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.total_price | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="payDetail(scope.row.items)">收费</el-button> 
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination layout="total, prev, pager, next, jumper" :total="total" :page-size="pagesize" 
      @current-change="pageChange">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { chargeList } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      // 搜索关键词
      searchCondition: {
        keyword: '',
        dateVal: [new Date(), new Date()]   // 日期
      },
      pageindex: 0,  // 当前页数
      pagesize: 15,
      total: 0,
      chargeList: []
    }
  },
  methods: {
    // 翻页
    pageChange(index) {
      this.pageindex = index - 1
      this.getPayList()
    },
    payDetail(id) {
      const registId = this.findRegistId(id)
      this.$router.push({ path: `/pay-charges/child/pay-detail/${registId}` })
    },
    // 查找挂号id（每条收费项均有挂号id，默认取第一条）
    findRegistId(list) {
      return list[0].regist_id
    },
    // 获取待收费列表
    getPayList() {
      service(chargeList, {
        name: this.searchCondition.keyword,
        date_from: this.searchCondition.dateVal[0].format('yyMMdd'),
        date_to: this.searchCondition.dateVal[1].format('yyMMdd'),
        status: 0,  // 0待付费
        pageindex: this.pageindex,
        pagesize: this.pagesize
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.chargeList = res.items || []
          this.total = res.total
        }
      })
    }
  },
  watch: {
    searchCondition: {
      handler() {
        this.getPayList()
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  filters: {
    dateFilter(date) {
      const str = date + ''
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    }
  },
  mounted() {
    this.getPayList()
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  margin-top: 20px;
  display: flex;
}
.el-table {
  width: 92%;
  margin-top: 20px;
  margin-left: 35px;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
