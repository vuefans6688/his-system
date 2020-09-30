<template>
  <div class="follow-up-record">
    <el-table :data="followList" stripe>
      <el-table-column label="随访状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="随访类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.plantype | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="planexecutor" label="随访申请人" align="center"></el-table-column>
      <el-table-column label="计划随访时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.plantime | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="随访计划" align="center" width="160">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div class="detail-hover">{{ scope.row.plancontent }}</div>
            <div slot="reference" class="name-wrapper">{{ scope.row.plancontent }}</div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="actualexecutor" label="执行人" align="center"></el-table-column>
      <el-table-column prop="visittime" label="执行时间" align="center" width="160"></el-table-column>
      <el-table-column label="随访结果" align="center" width="160">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div class="detail-hover">{{ scope.row.actualcontent }}</div>
            <div class="name-wrapper" slot="reference">{{ scope.row.actualcontent }}</div>
          </el-popover>
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
import { followUpList } from '@/serve/api'
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
      // 搜索条件
      condition: {
        fromdate: new Date(2000, 1, 1).format('yyyy-MM-dd hh:mm:ss'),
        todate: new Date().format('yyyy-MM-dd hh:mm:ss'),
        pageindex: 0,
        pagesize: 12
      },
      total: 0,
      followList: []
    }
  },
  methods: {
    // 获取随访列表
    getFollowUpList() {
      service(followUpList, {
        patientid: this.customerId,
        status: 2,
        type: -1,
        ...this.condition
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.followList = res.entity || []
          this.total = res.totalcount || 0
        }
      })
    },
    // 分页
    handleCurrentChange(index) {
      this.condition.pageindex = index - 1
      this.getFollowUpList()
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic'])
  },
  filters: {
    // 状态过滤
    statusFilter(status) {
      switch (status) {
        case 1:
          return '待随访'
        case 2:
          return '已随访'
        case 3:
          return '取消随访'
      }
    },
    // 随访类型过滤
    typeFilter(type) {
      return type === 1 ? '满意度' : type === 2 ? '诊疗效果' : ''
    },
    dateFilter(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    }
  },
  created() {
    this.getFollowUpList()
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
