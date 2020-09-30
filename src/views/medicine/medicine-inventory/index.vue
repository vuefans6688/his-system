<template>
  <div class="medicine-inventory">
    <div class="add">
      <el-button type="primary" @click="handleNewInventory" size="small">新建盘点</el-button>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
      <el-table-column prop="serialnum" label="盘点单号" width="150" align="center"></el-table-column>
      <el-table-column prop="total_count" label="总类目" align="center"></el-table-column>
      <el-table-column prop="checked_count" label="已盘点" align="center"></el-table-column>
      <el-table-column label="未盘点" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.total_count - scope.row.checked_count }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="total_cost" label="盈亏批发额合计" align="center" width="150"></el-table-column>
      <el-table-column prop="createtime" label="开始时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createtime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" width="160">
        <template slot-scope="scope">
          <span v-if="scope.row.itemstatus === 3">{{ scope.row.acceptime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="creatorname" label="盘点人" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="seen(scope.row)" v-if="scope.row.itemstatus === 3">查看</el-button>
          <el-button type="text" @click="inventory(scope.row)" v-else>盘点</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="10" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { InventoryRecords, getDocList, createstockcheck } from '@/serve/api'
export default {
  data() {
    return {
      userData: {
        serialnum: '',  // 盘点单号
        checker: '',  // 盘点人
        createTime: ''  // 制单日期
      },
      checkerList: [],  // 盘点人数组
      tableData: [],
      // 分页
      currentPage: 1,
      total: 0,
      pageindex: 0
    }
  },
  methods: {
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.getCheckList()
    },
    // 新增
    handleNewInventory() {
      this.$confirm('请确认其他部门已停止对药品进行任何操作!', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        service(createstockcheck, {
          clinic_id: this.clinic
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            this.$router.push({ name: 'NewInventory', query: { inventoryData: JSON.stringify(res) } })
          } else { // code错误需要进行的操作
            const code = res.split(':')[1]
            if (code === '-1') {
              this.$alert('盘点单已存在！', '提醒', {
                confirmButtonText: '确定',
                callback: () => {}
              })
            }
          }
        })
      }).catch(() => {
        return false
      })
    },
    // 获取盘点记录
    getCheckList() {
      service(InventoryRecords, {
        clinic_id: this.clinic,
        pageid: this.pageindex,
        pagesize: 10
      }).then(res => {
        this.tableData = res.record_arr
        this.total = res.pagecount
      })
    },
    // 查看
    seen(data) {
      this.$router.push({ name: 'SeenInventory', query: { inventoryData: JSON.stringify(data) } })
    },
    inventory(data) {
      this.$router.push({ name: 'NewInventory', query: { inventoryData: JSON.stringify(data) } })
    },
    // 获取医生
    getDoctorList() {
      service(getDocList, {
        clinic_id: this.clinic
      }).then(res => {
        if (res.items) {
          const arr = []
          res.items.forEach(val => {
            if (val.disabled === 0) {
              arr.push(val)
            }
          })
          const obj = arr.find(val => arr.userid === val.userid)
          if (!obj) {
            arr.push({
              userid: this.user.userid,
              truename: this.user.truename || this.user.phone
            })
          }
          this.checkerList = arr
        }
      })
    }
  },
  filters: {
    timeFilter(time) {
      const str = '' + time
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2)
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  created() {
    this.getCheckList()
    this.getDoctorList()
  }
}
</script>

<style lang="scss" scoped>
.medicine-inventory {
  margin-top: 20px;
  margin-left: 30px;
  .add {
    margin-top: 20px;
  }
  .el-table {
    margin-top: 20px;
    width: 95%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
