<template>
  <div class="treatment-history">
    <el-form :model="searchData" size="small" label-width="80px">
      <el-form-item label="姓名:" prop="name">
        <el-input v-model="searchData.name" placeholder="请输入客户姓名或手机" style="width: 280px;"></el-input>
      </el-form-item>
      <el-form-item label="日期:" prop="dateVal">
        <el-date-picker v-model="searchData.dateVal" unlink-panels :editable="false" :clearable="false" 
          type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="patient_name" label="姓名" align="center" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="手机号" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.patient_phone | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="就诊日期" align="center" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column prop="diagn_result" label="诊断" align="center" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="check(scope.row.regist_id)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import service from '@/utils/request'
import { diagnosisList } from '@/serve/api'
export default {
  data() {
    return {
      searchData: {
        name: '',  // 客户姓名或手机号
        dateVal: [new Date(), new Date()]  // 日期
      },
      tableData: [],
      currentPage: 1,  // 分页
      pageSize: 10,
      total: 0
    }
  },
  methods: {
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2) + ':' + str.substr(10, 2)
    },
    handleCurrentChange(val) {  // 切换页数
      this.currentPage = val
      this.getDiagnosisList()
    },
    check(id) {
      this.$router.push({ name: 'CheckClientMessage', query: { patientId: id } })
    },
    getDiagnosisList() {
      service(diagnosisList, {
        name: this.searchData.name,
        date_from: this.searchData.dateVal[0].format('yyMMdd'),
        date_to: this.searchData.dateVal[1].format('yyMMdd'),
        page_index: this.currentPage - 1,
        page_size: this.pageSize
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const data = res.items || []
          this.tableData = data.map(val => {
            val.create_time = this.makeDateTimeString(val.create_time)
            return val
          })
          this.total = res.total
        }
      })
    }
  },
  created() {
    this.getDiagnosisList()
  },
  watch: {
    'searchData.name': {
      handler() {
        this.getDiagnosisList()
      }
    },
    'searchData.dateVal': {
      handler() {
        this.getDiagnosisList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  display: flex;
  margin-top: 20px;
}
.el-table {
  width: 90%;
  margin-top: 20px;
  margin-left: 30px;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>

