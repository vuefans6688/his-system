<template>
  <div class="medicine-purch">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="制单日期:">
        <el-date-picker v-model="userData.date" type="daterange" align="center" :editable="false" 
          :clearable="false" unlink-panels range-separator="-" start-placeholder="开始日期" 
          end-placeholder="结束日期" @change="searchContent">
        </el-date-picker>
      </el-form-item>
      <div class="add">
        <el-button type="primary" @click="addStore" size="small">新增入库</el-button>
      </div>
    </el-form>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="purchase_sn" label="入库单号" align="center" width="210"></el-table-column>
      <el-table-column prop="creatorname" label="制单人" align="center"></el-table-column>
      <el-table-column prop="making_date" label="制单日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createtime | createTimeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入库金额" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.allcost }}元</span>
        </template>
      </el-table-column>
      <el-table-column prop="itemstatus" label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.itemstatus | itemStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="control(scope.row.itemstatus, scope.row)" type="text">
            {{ message | statusFilter1(scope.row.itemstatus) }}
          </el-button>
          <el-button @click="edit(scope.row.purchase_sn, scope.row.creatorname, scope.row.createtime)" type="text" style="color: #42b983;">
            {{ message | statusFilter2(scope.row.itemstatus) }}
          </el-button>
          <el-button type="text" @click="del(scope.row)" v-if="scope.row.total === 0"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage4" @current-change="handleCurrentChange" :page-size="15"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      message: '',
      userData: {
        num: '',  // 入库单号
        date: [new Date('2018', '00', '01'), new Date()],  // 制单日期
        status: ''  // 审核状态
      },
      options: [
        {
          value: '',
          label: '全部'
        }, 
        {
          value: '已审核',
          label: '已审核'
        }, 
        {
          value: '未审核',
          label: '未审核'
        }, 
        {
          value: '已打回',
          label: '已打回'
        }, 
        {
          value: '保存',
          label: '保存'
        }, 
        {
          value: '已提交',
          label: '已提交'
        }
      ],
      tableData: [],
      // 分页
      currentPage4: 1,
      total: 1,
      pageindex: 0,
      // 搜索控制量
      search: {
        status: '',
        num: ''
      }
    }
  },
  methods: {
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.searchContent()
    },
    // 新增
    addStore() {
      this.$http.post('/service/drug/purchrecodecreate', {
        head: {
          accessToken: this.token,
          lastnoticeL: 0
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$store.commit('user/SET_PURCH_RECODE', { itemcreator: res.data.data.creatorname, purchaseSn: res.data.data.purchase_sn })
          this.$router.push({ name: 'AddStore' })
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
        }
      }).catch()
    },
    // 按钮点击的函数
    control(status, row) {
      // 查看明细
      if (status === 3) {
        this.$store.commit('user/SET_PURCH_RECODE', { row })
        this.$router.push({ name: 'StoreReviewed' })
      }
      // 撤回
      if (status === 2) {
        this.$confirm('该入库单尚未审核，是否撤回?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'success',
            message: '撤回成功!'
          })
        }).catch(() => {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'info',
            message: '已取消撤回'
          })
        })
      }
    },
    // 编辑
    edit(purchaseSn, itemcreator, createtime) {
      this.$store.commit('user/SET_PURCH_RECODE', { purchaseSn, itemcreator, eidt: 111, createtime })
      this.$router.push({ name: 'AddStore' })
    },
    // 搜索
    searchContent() {
      const time1 = this.userData.date[0].format('yyMMdd')
      const time2 = this.userData.date[1].format('yyMMdd')
      this.$http.post('/service/drug/purchrecodequery', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          pageid: this.pageindex,
          pagesize: 15,
          clinic_id: this.clinic,
          begin_time: time1,
          end_time: time2
        }
      }).then(res => {
        this.tableData = []
        if (res.data.errcode === 0) {
          if (!res.data.data) {
            this.tableData = []
          } else {
            this.tableData = res.data.data.context
            this.total = res.data.data.pagecount
          }
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
          this.tableData = []
        }
      }).catch()
    }
  },
  filters: {
    statusFilter1(message, status) {
      switch (status) {
        case 2:
          message = '撤回'
          break
        case 3:
          message = '查看明细'
          break
        default:
          break
      }
      return message
    },
    statusFilter2(message, status) {
      switch (status) {
        case 1:
          message = '编辑'
          break
        case 2:
          message = ''
          break
        case 3:
          message = ''
          break
        case 4:
          message = '编辑'
          break
        default:
          break
      }
      return message
    },
    // 时间过滤
    createTimeFilter(time) {
      const str = '20' + time + ''
      return str.substring(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2)
    },
    // 状态过滤
    itemStatusFilter(value) {
      switch (value) {
        case 1:
          return '已保存'
        case 2:
          return '已提交'
        case 3:
          return '已审核'
        case 4:
          return '已打回'
        default:
          return ''
      }
    }
  },
  created() {
    // 采购单的列表
    this.$http.post('/service/drug/purchrecodequery', {
      head: {
        accessToken: this.token,
        lastnotice: 0
      },
      body: {
        pageid: 0,
        pagesize: 15,
        clinic_id: this.clinic
      }
    }).then(res => {
      if (res.data.errcode === 0) {
        this.total = res.data.data.pagecount || 0
        this.tableData = res.data.data.context || []
      } else {
        this.$message({
          showClose: true,
          duration: 1000,
          type: 'error',
          message: res.data.errmsg
        })
      }
    }).catch()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'purchRecode'])
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  display: flex;
  margin-left: 30px;
  margin-top: 20px;
  .add {
    .el-button {
      margin-left: 10px;
    }
  }
}
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
