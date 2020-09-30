<template>
  <div class="new-follow">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="客户姓名:">
        <el-input v-model="userData.name" placeholder="请输入客户姓名" style="width: 280px;"></el-input>
      </el-form-item>
      <el-form-item label="就诊日期:" style="margin-left: 10px;">
        <el-date-picker v-model="userData.clincTime" unlink-panels type="daterange" :editable="false" 
          :clearable="false" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70">
      </el-table-column>
      <el-table-column prop="patient_name" label="姓名" align="center">
      </el-table-column>
      <el-table-column prop="patient_gender" label="性别" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.patient_gender | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="patient_birthday" label="年龄" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.patient_birthday | ageFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="patient_phone" label="手机号" align="center">
      </el-table-column>
      <el-table-column label="最近就诊科室" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.diagn_dept | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="diagn_doctor" label="最近就诊医生" align="center"></el-table-column>
      <el-table-column prop="create_time" label="最近就诊日期" align="center" width="160"></el-table-column>
      <el-table-column prop="diagn_result" label="诊断结果" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="addNewProject(scope.row.regist_id)">新建随访计划</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :page-size="15" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      userData: {
        name: '',  // 客户姓名
        clincTime: [new Date(), new Date()]  // 就诊日期
      },
      tableData: [],
      // 分页
      pageindex: 0,
      total: 0,
      pageSize: 15
    }
  },
  methods: {
    // 把日期转成列表需要的格式
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2) + ':' + str.substr(10, 2)
    },
    // 新建随访计划
    addNewProject(id) {
      this.$router.push({ path: '/customers/follow-up/new-follow-project', query: { registid: id } })
    },
    // 获取随访列表
    getDiagnosisList() {
      this.$http.post('/service/diagnosis/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          name: this.userData.name,
          date_from: this.userData.clincTime[0].format('yyMMdd'),
          date_to: this.userData.clincTime[1].format('yyMMdd'),
          page_index: this.pageindex,
          page_size: this.pageSize
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data.clinic_id === this.clinic && res.data.items && res.data.items.length) {
          const data = res.data.items || []
          this.tableData = data.map(val => {
            val.create_time = this.makeDateTimeString(val.create_time)
            return val
          })
          this.total = res.data.total
        } else {
          this.tableData = []
          if (res.errcode !== 0) {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'error',
              message: res.data.errmsg
            })
          }
        }
      }).catch()
    },
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.getDiagnosisList()
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  filters: {
    ageFilter(age) {
      if (!age) {
        return ''
      }
      return new Date().format('yyyy') - age.substr(0, 4)
    }
  },
  watch: {
    userData: {
      handler() {
        this.getDiagnosisList()
      },
      deep: true
    }
  },
  created() {
    this.getDiagnosisList()
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  display: flex;
  margin-top: 20px;
  margin-left: 20px;
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
