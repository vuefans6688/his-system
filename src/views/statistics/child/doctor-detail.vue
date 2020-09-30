<template>
  <div class="doctor-detail">
    <!-- 挂号查询 -->
    <div class="header">
      <el-button class="el-icon-arrow-left" @click="$router.back()" size="small" type="primary">返回</el-button>
      <span style="margin-left: 20px;">
        <strong style="color: #f00;">张医生</strong>的接诊记录
      </span>
      <p>
        时间: <span style="color: #f00;">{{ creatTime }}</span> 
        至 <span style="color: #f00;">{{ endTime }}</span>
      </p>
    </div>
    <!-- 表格 -->
    <el-table :data="wordTable" ref="multipleTable" stripe>
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">
          <span> {{ scope.$index }} </span>
        </template>
      </el-table-column>
      <el-table-column label="客户姓名" align="center" prop="name"></el-table-column>
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <span> {{ scope.row.gender | sexFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center">
          <template slot-scope="scope">
          <span> {{ scope.row.phone | undefineFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="登记时间" align="center" prop="time"></el-table-column>
      <el-table-column label="挂号费" align="center">
          <template slot-scope="scope">
          <span> {{ scope.row.fee_price | priceFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="处方金额" align="center">
          <template slot-scope="props">
          <span> {{ props.row.pre_price | priceFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="诊疗项目金额" align="center">
          <template slot-scope="scope">
          <span> {{ scope.row.check_price | priceFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="耗材金额" align="center">
          <template slot-scope="scope">
          <span> {{ scope.row.consumables_price | priceFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="其他" align="center">
          <template slot-scope="scope">
          <span> {{ scope.row.other_price | priceFilter }} </span>
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
      wordTable: [
        {
          index: 1,
          name: '小冯',
          gender: 1,
          phone: '13500135785',
          time: '2018-1-23',
          fee_price: 33,
          pre_price: 322,
          check_price: 13,
          consumables_price: 22,
          other_price: 0
        },
        {
          index: 2,
          name: '阿杰',
          gender: 1,
          phone: '13532135785',
          time: '2018-1-21',
          fee_price: 2,
          pre_price: 32,
          check_price: 1,
          consumables_price: 4,
          other_price: 5
        }
      ],  // 接诊日志数据
      creatTime: '2017-11-10',
      endTime: '2018-1-30',
      pageindex: 1,  // 当前页数
      totalCount: 0  // 总页数
    }
  },
  methods: {
    handleCurrentChange(val) {  // 切换页数
      this.pageindex = val
    },
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2) + ':' + str.substr(10, 2)
    }
  },
  created() {
    const obj = {
      index: '合计',
      name: '所有客户',
      gender: '',
      phone: '',
      time: '',
      fee_price: 0,
      pre_price: 0,
      check_price: 0,
      consumables_price: 0,
      other_price: 0
    }
    this.wordTable.forEach(val => {
      obj.fee_price += val.fee_price
      obj.pre_price += val.pre_price
      obj.check_price += val.check_price
      obj.consumables_price += val.consumables_price
      obj.other_price += val.other_price
    })
    this.wordTable.unshift(obj)
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  }
}
</script>

<style lang="scss" scoped>
.doctor-detail {
  margin-top: 20px;
  margin-left: 30px;
  .el-table {
    margin-top: 20px;
    width: 100%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
