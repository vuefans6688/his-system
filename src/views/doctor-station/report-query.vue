<template>
  <div class="report-query">
    <div class="charge" v-show="chargeDisable">
      <el-form :model="searchDate" size="small" label-width="80px">
        <el-form-item label="日期:">
          <el-date-picker v-model="searchDate.dateVal" unlink-panels :editable="false" 
            :clearable="false" type="daterange" :picker-options="pickerOptions">
          </el-date-picker>
          <el-button type="primary" @click="printSelected" style="margin-left: 10px;">合并打印</el-button>
        </el-form-item>
      </el-form>
      <div class="result">{{ `当前查询结果: 共【${this.total}】条记录` }}</div>
      <!-- 表格 -->
      <el-table :data="tableData" ref="multipleTable" @selection-change="handleSelectionChange" tooltip-effect="dark">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="订单时间" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | clinicDateFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="姓名">
          <!-- 二级目录用于搜索姓名 -->
          <el-table-column prop="patient" align="center" width="120">
            <template slot="header">
              <el-input v-model="searchDate.patientName" size="small" placeholder="请输入患者姓名"></el-input>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="gender" align="center" label="性别" width="120"></el-table-column>
        <el-table-column prop="age" align="center" label="年龄" width="60"></el-table-column>
        <el-table-column prop="phone" align="center" label="患者电话" width="120"></el-table-column>
        <el-table-column align="center" label="送检项目" show-overflow-tooltip>
          <template slot-scope="scope">
            <span style="margin-left: 10px;">{{ scope.row.ins_array | insFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="doctor" align="center" label="送检医生" width="120"></el-table-column>
        <el-table-column label="报告状态" align="center" width="80">
          <template slot-scope="scope">
            <span style="color: #f00;" v-if="scope.row.report_status === 0">未出</span>
            <span style="color: #7fbe7f;" v-if="scope.row.report_status === scope.row.barcode_array.length">全出</span>
            <span style="color: #ff9900;" v-if="scope.row.report_status !== 0 && scope.row.report_status < scope.row.barcode_array.length">部分出</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-show="scope.row.report_status !== 0" type="text" @click="checkReport(scope.row)">查看报告</el-button>
            <el-button v-show="scope.row.report_status === 0" type="text" :disabled="true" style="color: #f00;">未出报告</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-card class="bind-modal" v-show="!chargeDisable">
      <h3 class="title">绑定账号</h3>
      <el-form :model="bindAccount" :rules="bindRules" ref="bindModal" label-width="80px" size="small">
        <el-form-item label="账号:" prop="user_name">
          <el-input v-model="bindAccount.user_name" style="width: 400px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button v-if="codeStep === 1" type="primary" @click.stop="sendAccessCode">获取验证码</el-button>
        </el-form-item>
        <div v-show="codeStep === 2">
          <el-form-item label="验证码:" prop="password">
            <el-input v-model="bindAccount.password" type="password" style="width: 260px;"></el-input>
            <el-button @click.stop="sendAccessCode" :disabled="!stop" type="primary" style="margin-left: 10px;">{{ accessMessage }}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click.stop="submitForm('bindModal')" type="primary">绑定</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { InsBindCheck, DoctorSMS, InsLogin, InsGetOrder, InsGetReportList } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 7))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一月',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 30))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三月',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 91))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近半年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 183))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 364))
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      searchDate: {
        dateVal: [new Date(new Date() - (1000 * 60 * 60 * 24)), new Date()],   // 日期
        patientName: ''
      },
      tableData3: [],
      tableData: [],
      // 检查是否绑定
      chargeDisable: false,
      bindAccount: {
        user_name: '',
        password: ''
      },
      bindRules: {
        user_name: [
          { required: true, message: '请输入账号名称', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, message: '密码至少4位', trigger: 'blur' }
        ]
      },
      codeStep: 1,
      // 记录表格的勾选项
      multipleSelection: [],
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,
      timer: 60,  // 默认倒数60秒
      stop: true,  // 默认是停止的
      interval: null  // 定时器对象
    }
  },
  methods: {
    handleCurrentChange(val) {  // 切换页数
      this.currentPage = val
      this.getInsOrders()
    },
    // 表格的选择
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(tableRow => this.$refs.multipleTable.toggleRowSelection(tableRow))
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    checkReport(row) {
      service(InsGetReportList, {
        barcode_array: row.barcode_id_array
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          window.open(res)
        } else {
          console.log('获取报告地址失败')
        }
      })
    },
    // 打印相关
    printSelected() {
      if (!this.multipleSelection.length) {
        this.$message({ message: '请选择报告', type: 'warning' })
        return
      }
      let idarr = []
      this.multipleSelection.forEach(v => idarr = idarr.concat(v.barcode_id_array))
      service(InsGetReportList, {
        barcode_array: idarr
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          window.open(res)
        } else {
          console.log('获取报告地址失败')
        }
      })
    },
    InsBindCheck() {
      service(InsBindCheck).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res === 0) {
            this.chargeDisable = false
            this.tableData = []
          } else {
            this.chargeDisable = true
            // 获取报告
            this.getInsOrders()
          }
        } else {
          this.chargeDisable = false
          this.tableData = []
        }
      })
    },
    // 获取订单
    getInsOrders() {
      service(InsGetOrder, {
        begin_time: this.searchDate.dateVal[0],
        end_time: this.searchDate.dateVal[1],
        patient: this.searchDate.patientName,
        page_index: this.currentPage,
        page_size: this.pageSize
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.total = res.total
          this.tableData = res.total === 0 ? [] : res.data
        } else {
          console.log('获取订单失败')
        }
      })
    },
    sendAccessCode() {
      const isBind = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (this.bindAccount.user_name === '') {
        this.$message({ message: '请填写账号', type: 'warning' })
        return
      } else if (!isBind.test(this.bindAccount.user_name)) {
        this.$message({ message: '账号格式错误', type: 'warning' })
        return
      }
      this.runTime()
      this.codeStep = 2
      service(DoctorSMS, {
        phone: this.bindAccount.user_name
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          console.log(res)
        } else {
          console.log('验证码错误')
        }
      })
    },
    runTime() {
      this.stop = false
      this.timer = 60
      this.interval = setInterval(() => {
        this.timer--
        if (this.timer <= 0) {
          this.stop = true
          clearInterval(this.interval)
        }
      }, 1000)
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          service(InsLogin, {
            user_name: this.bindAccount.user_name,
            password: this.bindAccount.password
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              this.InsBindCheck()
            } else {
              console.log('登陆校验失败')
            }
          })
        } else {
          return false
        }
      })
    }
  },
  watch: {
    searchDate: {
      handler(newval) {
        this.getInsOrders()
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic']),
    accessMessage() {
      return this.stop ? '发送验证码' : `${this.timer}秒后可重新发送`
    }
  },
  filters: {
    insFilter(ins) {
      let label = ''
      ins.forEach(item => label += `${item}、`)
      return label ? label.substr(0, label.length - 1) : ''
    },
    reportStatusFilter(row) {
      if (row.report_status === 0) {
        return '未出'
      } else if (row.report_status === row.barcode_array.length) {
        return '已全出'
      } else {
        return '部分出'
      }
    },
    clinicDateFilter(str) {
      const dateStr = str + ''
      return '20' + dateStr.substr(0, 2) + '-' + dateStr.substr(2, 2) + '-' + dateStr.substr(4, 2)
    }
  },
  created() {
    this.bindAccount.user_name = this.user.phone
    this.InsBindCheck()
  }
}
</script>

<style lang="scss" scoped>
.charge {
  margin-top: 20px;
  margin-left: 30px;
  .el-form {
    display: flex;
  }
  .result {
    color: #42b983;
  }
  .el-table {
    margin-top: 20px;
    width: 96%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
.bind-modal {
  width: 600px;
  margin: 20px auto;
  .title {
    text-align: center;
    color: #666;
  }
} 
</style>
