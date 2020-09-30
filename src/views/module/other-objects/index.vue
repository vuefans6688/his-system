<template>
  <div class="other-objects">
    <div class="header">
      <span class="name">模板名称: </span>
      <el-input v-model="selectedTplName" size="small"></el-input>
      <span class="type">模板类型: </span>
      <el-select v-model="selectedOwnerType" @change="ownerTypeChanged" size="small">
        <el-option v-for="item in moduleClassOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <div class="add">
        <el-button type="primary" @click="addModule" size="small">新增</el-button>
      </div>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="name" label="模板名称" align="center"></el-table-column>
      <el-table-column prop="owner_type" label="模板类型" align="center"></el-table-column>
      <el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="modification(scope.$index)">修改</el-button>
          <el-button type="text" @click="del(scope.$index)" style="color: #f00;">删除</el-button>
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
import { mapGetters } from 'vuex'
import { sortListByName } from '@/utils/sortListByName'
export default {
  data() {
    return {
      tableData: [],
      moduleClassOption: [
        {
          value: 2,
          label: '全部'
        }, 
        {
          value: 1,
          label: '通用模板'
        }, 
        {
          value: 0,
          label: '个人模板'
        }
      ],
      selectedTplId: '',
      // 搜索
      selectedTplName: '',
      selectedOwnerType: '全部',
      tplType: 7,
      // 分页
      currentTplType: 0,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      ownerType: 2
    }
  },
  methods: {
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2) + ':' + str.substr(10, 2)
    },
    getTemplateList(tplName, callback) {
      tplName = this.selectedTplName
      this.tableData = []
      this.$http.post('/service/template/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          type: this.tplType,
          owner_type: this.ownerType,
          page_index: this.currentPage - 1,
          page_size: this.pageSize,
          name: (!tplName ? '' : tplName)
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data && res.data.clinic_id === this.clinic &&
          res.data.items && res.data.items.length) {
          const data = res.data.items || []
          this.tableData = data.map(val => {
            val.owner_type = val.owner_type ? '通用模板' : '个人模板'
            val.create_time = this.makeDateTimeString(val.create_time)
            return val
          })
          this.total = res.data.total
          this.tableData.sort(sortListByName)
          if (callback) {
            callback(this.tableData)
          }
        } else {
          this.tableData = []
          if (res.errcode !== 0) {
            this.$message({ message: res.errmsg, type: 'error', showClose: true, duration: 1000 })
          }
        }
      }).catch()
    },
    handleCurrentChange(val) {  // 切换页数
      this.currentPage = val
      this.getTemplateList()
    },
    // 联想
    querySearchAsync(queryString, callback) {
      this.getTemplateList(queryString, callback)
    },
    // 选择联想项目
    tplSuggestionSelect(item) {
      this.curTplName = item.name
      this.curTplId = item.template_id
    },
    ownerTypeChanged(newVal) {
      this.ownerType = newVal
      this.getTemplateList(this.selectedTplName)
    },
    // 新增
    addModule() {
      const id = 'new'
      this.$router.push({ name: 'NewOtherObjects', params: { tplId: id, data: null, tplType: 7 } })
    },
    // 修改
    modification(n) {
      const id = this.tableData[n].template_id
      this.$router.push({ name: 'NewOtherObjects', params: { tplId: id, data: this.tableData[n], tplType: 7 } })
    },
    // 删除
    del(n) {
      this.$confirm('是否删除该模板?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const id = this.tableData[n].template_id
        this.$http.post('/service/template/delete', {
          head: {
            accessToken: this.token,
            lastnotice: 0,
            msgid: ''
          },
          body: { 
            clinic_id: this.clinic,
            template_id: id
          }
        }).then(response => {
          const res = response.data
          if (res.errcode === 0 && res.data && res.data.clinic_id === this.clinic) {
            this.tableData.splice(n, 1)
            this.$message({ message: '删除成功!', type: 'success', showClose: true, duration: 1000 })
            this.total -= 1
          } else if (res.errcode !== 0) {
            this.$message({ message: res.errmsg, type: 'error', showClose: true, duration: 1000 })
          }
        }).catch()
      }).catch(() => {
        this.$message({ message: '已取消删除!', type: 'info', showClose: true, duration: 1000 })
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  mounted() {
    this.getTemplateList()
  },
  watch: {
    selectedTplName: {
      handler() {
        this.getTemplateList(this.selectedTplName)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.other-objects {
  margin-top: 20px;
  margin-left: 30px;
  .header {
    display: flex;
    align-items: center;
    margin-top: 20px;
    color: #666;
    .el-input {
      width: 280px;
    }
    .el-input, .type, .el-select, .add {
      margin-left: 10px;
    }
  }
  .el-table {
    margin-top: 20px;
    width: 90%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
