<template>
  <div class="medicine-audit-1">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="制单日期:">
        <el-date-picker v-model="userData.value7" type="daterange" :editable="false" 
          :clearable="false" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center"></el-table-column>
      <el-table-column prop="Receipt_no" label="入库单号" align="center"></el-table-column>
      <el-table-column prop="batch_number" label="入库批号" align="center"></el-table-column>
      <el-table-column prop="making_people" label="制单人" align="center"></el-table-column>
      <el-table-column prop="making_date" label="制单日期" align="center"></el-table-column>
      <el-table-column prop="suppliers" label="供应商" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="Total_amount" label="采购总金额" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleAudit" v-if="scope.row.status === '未审核'">审核</el-button>
          <div class="reviewer" v-else>审核人: {{ auditpeople }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage4" :page-size="15" layout="total, prev, pager, next, jumper" :total="total"></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userData: {
        ret: '',   // 制单号
        value7: '',  // 制单日期
        value1: '',  // 供应商
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
      options1: [
        {
          value: '',
          label: '全部'
        }, 
        {
          value: '哈药',
          label: '哈药'
        }, 
        {
          value: '云南白药',
          label: '云南白药'
        }, 
        {
          value: '广药',
          label: '广药'
        }
      ],
      tableData: [
        {
          Receipt_no: '13515465',
          batch_number: '56235',
          making_people: '张大庄',
          making_date: '2017-09-09',
          suppliers: '云南白药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已审核'
        }, 
        {
          Receipt_no: '13515466',
          batch_number: '23435',
          making_people: '张大庄',
          making_date: '2017-06-25',
          suppliers: '天神制药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '未审核'
        }, 
        {
          Receipt_no: '13515467',
          batch_number: '23456',
          making_people: '张大庄',
          making_date: '2015-12-16',
          suppliers: '哈药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已审核'
        }, 
        {
          Receipt_no: '13515468',
          batch_number: '45233',
          making_people: '张大庄',
          making_date: '2014-04-07',
          suppliers: '广药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已打回'
        }, 
        {
          Receipt_no: '13515468',
          batch_number: '53124',
          making_people: '张大庄',
          making_date: '2017-09-09',
          suppliers: '广药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已打回'
        }, 
        {
          Receipt_no: '13515469',
          batch_number: '56764',
          making_people: '张大庄',
          making_date: '2017-09-09',
          suppliers: '广药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '未审核'
        }, 
        {
          Receipt_no: '13515470',
          batch_number: '34476',
          making_people: '张大庄',
          making_date: '2016-11-09',
          suppliers: '广药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已打回'
        }, 
        {
          Receipt_no: '13515471',
          batch_number: '34432',
          making_people: '张大庄',
          making_date: '2015-08-12',
          suppliers: '广药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已审核'
        }, 
        {
          Receipt_no: '13515472',
          batch_number: '34563',
          making_people: '张大庄',
          making_date: '2017-05-23',
          suppliers: '广药',
          Total_amount: '￥256',
          Amount: '￥256',
          status: '已审核'
        }
      ],
      // 分页
      currentPage4: 4,
      total: 0,
      auditpeople: 'Fsj'  // 审核人
    }
  },
  methods: {
    handleAddStore() {
      this.$router.push({ name: 'AddStore' })
    },
    handleAudit() {
      this.$router.push({ name: 'MedicineAudit2' })
    },
    searchContent() {
      this.search.ret = this.userData.ret
      this.search.status = this.userData.status
      this.search.value1 = this.userData.value1
    }
  }
}
</script>

<style lang="scss" scoped>
.medicine-audit-1 {
  margin-top: 20px;
  margin-left: 30px;
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
