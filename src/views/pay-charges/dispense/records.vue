<template>
  <div class="records">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="姓名:" prop="name">
        <el-input v-model="userData.name" placeholder="客户姓名或手机号" style="width: 320px;"></el-input>
      </el-form-item>
      <el-form-item label="发药日期:" prop="dateVal" style="margin-left: 10px;">
        <el-date-picker v-model="userData.dateVal" unlink-panels type="daterange"  
          :editable="false" :clearable="false" range-separator="-" start-placeholder="开始日期" 
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="deliver_sn" label="发药单号" align="center" width="180"></el-table-column>
      <el-table-column prop="name" label="姓名" align="center"></el-table-column>
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.gender | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" align="center"></el-table-column>
      <el-table-column label="发药类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.deliver_source | deliverSource }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="department" label="就诊科室" align="center"></el-table-column>
      <el-table-column prop="doctor_name" label="就诊医生" align="center"></el-table-column>
      <el-table-column prop="operator_name" label="操作人" align="center"></el-table-column>
      <el-table-column prop="getmed_time" label="发(退)药时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span class="drug-send" v-if="scope.row.drug_opstype === 1">已发药</span>
          <span class="drug-return" v-if="scope.row.drug_opstype === 2">已退药</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="viewDetails(scope.row)">查看明细</el-button>
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
      // 分页
      total: 0,
      currentPage: 1,
      pageindex: 0,
      today: new Date().format('yyMMdd')
    }
  },
  methods: {
    // 搜索发药记录
    searchContent() {
      this.$http.post('/service/drugdeliver/recordlist', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          pageid: this.pageindex, // 必填
          pagesize: 10, // 必填
          clinic_id: this.clinic, // 必填
          status: 0, // 必填
          date_from: this.userData.dateVal[0].format('yyMMdd'),  // 日期2017-11-10 前面没有20，日期必填
          date_to: this.userData.dateVal[1].format('yyMMdd'),  // 必填
          name: this.userData.name  // 客户的名字
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.tableData = res.data.data.entity || []
          this.total = res.data.data.pagecount || 0
        } else {
          this.$message.error(res.data.errmsg)
        }
      }).catch()
    },
      // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.searchContent()
    },
    // 退药按钮
    viewDetails(value) {
      this.$router.push({ name: 'ReturnMedical' })
      this.$store.commit('user/SET_PURCH_RECODE', { value })
    },
  },
  filters: {
    deliverSource(source) {
      if (source === 2) {
        return '处方发药'
      }
      if (source === 5) {
        return '门诊购药'
      }
    }
  },
  created() {
    this.searchContent()
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'purchRecode'])
  },
  watch: {
    userData: {
      handler() {
        this.searchContent()
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
  margin-top: 20px;
  margin-left: 30px;
  width: 90%;
  .drug-send {
    color: #666;
  }
  .drug-return {
    color: #f00;
  }
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
