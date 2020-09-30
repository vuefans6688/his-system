<template>
  <div class="medicine-info">
    <el-form :model="header" size="small" label-width="80px">
      <el-form-item label="药品名称:" prop="ret">
        <el-input v-model="header.ret" style="width: 320px;"></el-input>
      </el-form-item>
      <el-form-item label="处方分类:" prop="drugtype" style="margin-left: 10px;">
        <el-select v-model="header.drugtype">
          <el-option label="全部" value="请选择"></el-option>
          <el-option label="西/中成药" value="0"></el-option>
          <el-option label="中药" value="1"></el-option>
        </el-select>
      </el-form-item>
      <div class="add-drug">
        <el-button type="primary" @click="handleAddMedicine" size="small">新增药品</el-button>
      </div>
    </el-form>
    <!-- 药物列表 -->
    <el-table :data="drugList" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="product_name" label="药品名称" align="center"></el-table-column>
      <el-table-column label="处方分类" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.drugtype | drugTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="specs_txt" label="规格" align="center" width="140"></el-table-column>
      <el-table-column prop="producer" label="生产厂家" align="center" show-overflow-tooltip width="300"></el-table-column>
      <el-table-column label="创建日期" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | createTimeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.use_enable | useEnableFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="社保备案状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.szsbstatus | sheBaoStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEditMedicine(scope.row.drug_key)">编辑</el-button>
          <el-button type="text" v-if="scope.row.use_enable === 1" @click="handleDisable(scope.row, scope.$index)" style="color: #f00;">禁用</el-button>
          <el-button type="text" v-if="scope.row.use_enable === 2" @click="handleEnable(scope.row, scope.$index)" style="color: #56bc94;">启用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pagesize" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      // 分页
      currentPage: 0,
      total: 0,
      pageindex: 0,
      pagesize: 10,
      // 禁用
      disable: false,
      header: {
        ret: '',
        drugtype: '',
        state: ''
      },
      drugList: []
    }
  },
  methods: {
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.querySearchAsync()
    },
    // 新增药品
    handleAddMedicine() {
      this.$router.push({ name: 'EditMedicine' })
      if (typeof (Storage) !== 'undefined') {
        sessionStorage.setItem('med_key', 'add')
      } else {
        this.$alert('你的浏览器版本过低，无法请求数据，请升级浏览器！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'info',
              message: `操作: ${action}`
            })
          }
        })
      }
    },
    // 编辑药品
    handleEditMedicine(drugKey) {
      this.$router.push({ name: 'EditMedicine', query: { currentPage: this.currentPage } })
      if (typeof (Storage) !== 'undefined') {
        sessionStorage.setItem('drug_key', drugKey)
        sessionStorage.setItem('med_key', 'edit')
      } else {
        this.$alert('你的浏览器版本过低，无法请求数据，请升级浏览器！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'info',
              message: `操作: ${action}`
            })
          }
        })
      }
    },
    // 禁用
    handleDisable(row, index) {
      const drugkey = row.drug_key
      this.$confirm('禁用后该药品将不会再显示，是否禁用？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.$http.post('/service/drug/infoenable', {
          head: {
            accessToken: this.token,
            lastnotice: 0
          },
          body: {
            drug_key: drugkey,
            clinic_id: this.clinic,
            use_enable: 2
          }
        }).then(res => {
          if (res.data.errcode === 0) {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'success',
              message: '禁用成功!'
            })
            this.drugList[index].use_enable = 2
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'error',
              message: res.data.errmsg
            })
          }
        }).catch()
      }).catch()
    },
    // 启用
    handleEnable(row, index) {
      const drugkey = row.drug_key
      this.$http.post('/service/drug/infoenable', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          drug_key: drugkey,
          clinic_id: this.clinic,
          use_enable: 1
        }
      }).then(() => {
        this.$message({
          showClose: true,
          duration: 1000,
          type: 'success',
          message: '启用成功!'
        })
        this.drugList[index].use_enable = 1
      }).catch(() => {
        this.$message({
          showClose: true,
          duration: 1000,
          type: 'warning',
          message: '启用失败!'
        })
      })
    },
    // 药品搜索
    querySearchAsync() {
      this.$http.post('/service/drug/infolistquery', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          pageid: this.pageindex,
          pagesize: this.pagesize,
          clinic_id: this.clinic,
          drugname: this.header.ret,
          drugtype: this.header.drugtype
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          if (!res.data.data) {  // 如果没有则返回空
            this.drugList = []
            this.total = 0
          } else {
            this.drugList = res.data.data.diarr
            this.total = res.data.data.pagecount || 0
          }
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
          this.drugList = []
        }
      }).catch()
    }
  },
  filters: {
    useEnableFilter(val) {
      if (val === 1) {
        return '已启用'
      } else if (val === 2) {
        return '已禁用'
      }
    },
    createTimeFilter(time) {
      const str = '20' + time + ''
      return str.substring(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2)
    },
    sheBaoStatusFilter(status) {
      if (status <= 0) {
        return '未备案'
      } else if (status === 1) {
        return '已备案'
      }
    },
    drugTypeFilter(type) {
      if (type === '0') {
        return '西/中成药'
      }
      if (type === '1') {
        return '中药'
      }
    }
  },
  created() {
    this.querySearchAsync()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  watch: {
    header: {
      handler() {
        this.querySearchAsync()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  margin-top: 20px;
  margin-left: 30px;
  display: flex;
  .add-drug {
    .el-button {
      margin-left: 10px;
    }
  }
}
.el-table {
  width: 92%;
  margin-top: 20px;
  margin-left: 30px;
}
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
