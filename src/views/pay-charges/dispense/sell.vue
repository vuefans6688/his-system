<template>
  <div class="sell">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="姓名:" prop="name">
        <el-input style="width: 320px;" v-model="userData.name" placeholder="客户姓名或手机号"></el-input>
      </el-form-item>
      <el-form-item label="发药日期:" prop="dateVal" style="margin-left: 10px;">
        <el-date-picker v-model="userData.dateVal" unlink-panels type="daterange" 
          range-separator="-" start-placeholder="开始日期"
          :editable="false" :clearable="false" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <div class="refresh">
        <el-button type="primary" @click="refresh" size="mini">
          <i class="el-icon-refresh"></i>刷新
        </el-button>
      </div>
    </el-form>
    <!-- 表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="patient_name" label="姓名" align="center"></el-table-column>
      <el-table-column prop="patient_phone" label="手机号" align="center"></el-table-column>
      <el-table-column label="就诊日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="total_price" label="药品金额" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" @click="sandPills(scope.row.items)">发药</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="10"
      @current-change="handleCurrentChange" layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      userData: {
        name: '',  // 客户姓名或手机号
        dateVal: [new Date(), new Date()]  // 日期
      },
      tableData: [],
      pillClass: [
        {
          value: '',
          label: '全部'
        }, 
        {
          value: '零售发药',
          label: '零售发药'
        }, 
        {
          value: '处方发药',
          label: '处方发药'
        }
      ],
      // 分页
      total: 0,
      currentPage: 1,  // 页数
      pageindex: 0,
      today: new Date().format('yyMMdd')
    }
  },
  methods: {
    // 搜索
    searchContent() {
      this.$http.post('/service/drugdeliver/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          pageindex: this.pageindex, // 必填
          pagesize: 10, // 必填
          clinic_id: this.clinic, // 必填
          status: 0, // 必填
          date_from: this.userData.dateVal[0].format('yyMMdd'),  // 日期2017-11-10 前面没有20，日期必填
          date_to: this.userData.dateVal[1].format('yyMMdd'),  // 必填
          name: this.userData.name  // 客户名字
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.tableData = res.data.data.items || []
          this.total = res.data.data.total || 0
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            message: res.data.errmsg,
            type: 'error'
          })
        }
      }).catch()
    },
    handleCurrentChange(index) { // 分页
      this.pageindex = index - 1
      this.searchContent()
    },
    sandPills(value) {
      this.$router.push({ name: 'Pills' })
      this.$store.commit('user/SET_PURCH_RECODE', { value })
    },
    // 显示发药列表
    deliverList() {
      this.$http.post('/service/drugdeliver/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          pageindex: 0,  // 必填
          pagesize: 10,  // 必填
          clinic_id: this.clinic,   // 必填
          status: 0,  // 必填
          date_from: this.today,  // 日期2017-11-10 前面没有20，日期必填
          date_to: this.today  // 必填
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.tableData = res.data.data.items || []
          this.total = res.data.data.total || 0
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            message: res.data.errmsg,
            type: 'error'
          })
        }
      }).catch()
    },
    // 刷新
    refresh() {
      this.deliverList()
    }
  },
  created() {
    this.deliverList()
  },
  watch: {
    userData: {
      handler() {
        this.searchContent()
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'purchRecode'])
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  margin-top: 20px;
  display: flex;
  .refresh {
    .el-button {
      margin-left: 10px;
    }
  }
}
.el-table {
  margin-top: 20px;
  margin-left: 30px;
  width: 90%;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
