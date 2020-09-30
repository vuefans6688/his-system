<template>
  <div class="diagnosis-statistics">
    <!-- 挂号查询 -->
    <el-form :model="searchDate" size="small" label-width="80px">
      <el-form-item label="日期:">
        <el-date-picker v-model="searchDate.dateVal" unlink-panels :editable="false" 
          :clearable="false" type="daterange" :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="项目名称:" style="margin-left: 20px;">
        <el-select v-model="searchDate.chargeType">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.name" :value="item.item_id" v-for="item in payItem" :key="item.item_id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="chargeTable" ref="multipleTable" stripe>
      <el-table-column label="序号" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.index }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.total }} {{ props.row.total_unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.price | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.total_price | priceFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handleCurrentChange" :current-page="pageindex" :page-size="15" 
      layout="total, prev, pager, next, jumper" :total="totalCount">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      chargeTable: [],  // 收费数据
      pickerOptions: {
        shortcuts: [
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
        dateVal: [new Date(new Date() - (1000 * 60 * 60 * 24 * 30)), new Date()],   // 日期
        chargeType: ''  // 收费类型
      },
      payItem: [],
      pageindex: 1,  // 当前页数
      totalCount: 0  // 总页数
    }
  },
  methods: {
    handleCurrentChange(val) {  // 切换页数
      this.pageindex = val
      this.getCheckList()
    },
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2)
    },
    getPayList() {  // 获取收费项目
      this.$http.post('/service/clinic/chargitem_list', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''                  // 留空
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          const arr = []
          res.data.data.forEach(val => {
            if (val.type === 3) {
              arr.push(val)
            }
          })
          this.payItem = arr
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    getCheckList() {
      this.$http.post('/service/stats/exames', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          exam_item_id: this.searchDate.chargeType,
          date_from: this.searchDate.dateVal[0].format('yyMMdd'),
          date_to: this.searchDate.dateVal[1].format('yyMMdd'),
          page_index: this.pageindex - 1,
          page_size: 10
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data.clinic_id === this.clinic) {
          const data = res.data.items || []
          this.chargeTable = data.map(val => {
            val.create_time = this.makeDateTimeString(val.create_time)
            return val
          })
          const obj = {
            index: '合计',
            create_time: `${this.searchDate.dateVal[0].getFullYear()}-${this.searchDate.dateVal[0].getMonth() + 1}-${this.searchDate.dateVal[0].getDate()} 至
            ${this.searchDate.dateVal[1].getFullYear()}-${this.searchDate.dateVal[1].getMonth() + 1}-${this.searchDate.dateVal[1].getDate()}`,
            name: '所有费用',
            total: res.data.sum_total,
            total_price: res.data.sum_sales
          }
          this.chargeTable.forEach((val, index) => val.index = index + 1)
          this.chargeTable.unshift(obj)
          this.totalCount = res.data.total
        } else {
          this.chargeTable = []
          if (res.errcode !== 0) {
            this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
          }
        }
      }).catch()
    }
  },
  mounted() {
    this.getPayList()   // 获取收费项目
    this.getCheckList()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  watch: {
    searchDate: {
      handler() {
        this.getCheckList()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.diagnosis-statistics {
  margin-top: 20px;
  .el-form {
    display: flex;
  }
  .el-table {
    margin-top: 20px;
    margin-left: 30px;
    width: 95%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
