<template>
  <div class="medicine-diary">
    <el-form :model="header" size="small" label-width="80px">
      <el-form-item label="药物检索:">
        <el-input v-model="header.ret" placeholder="名称/厂家/条码" style="width: 280px;"></el-input>
      </el-form-item>
      <el-form-item label="入库日期:" style="margin-left: 10px;">
        <el-date-picker v-model="header.value7" type="daterange" unlink-panels range-separator="-" 
          start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" stripe>
      <el-table-column prop="med_time" label="入库时间"></el-table-column>
      <el-table-column prop="med_name" label="药品名称"></el-table-column>
      <el-table-column prop="med_class" label="药品分类"></el-table-column>
      <el-table-column prop="med_specification" label="规格"></el-table-column>
      <el-table-column prop="med_factory" label="生产厂家"></el-table-column>
      <el-table-column prop="med_supplier" label="供货商"></el-table-column>
      <el-table-column prop="med_batch" label="批号"></el-table-column>
      <el-table-column prop="med_pleased" label="进货价"></el-table-column>
      <el-table-column prop="med_quantity" label="入库数量"></el-table-column>
      <el-table-column prop="med_amount" label="金额"></el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage4" :page-sizes="[10, 20, 30, 40]"
      :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="40">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          med_time: '2017-08-8',
          med_name: '草果',
          med_class: '饮片',
          med_specification: '1.0g',
          med_factory: '',
          med_supplier: '',
          med_batch: '245345345',
          med_pleased: '$550',
          med_quantity: '33',
          med_amount: '$33'
        }, 
        {
          med_time: '2017-08-8',
          med_name: '草果',
          med_class: '饮片',
          med_specification: '1.0g',
          med_factory: '',
          med_supplier: '',
          med_batch: '245345345',
          med_pleased: '$550',
          med_quantity: '33',
          med_amount: '$33'
        }, 
        {
          med_time: '2017-08-8',
          med_name: '草果',
          med_class: '饮片',
          med_specification: '1.0g',
          med_factory: '',
          med_supplier: '',
          med_batch: '245345345',
          med_pleased: '$550',
          med_quantity: '33',
          med_amount: '$33'
        }, 
        {
          med_time: '2017-08-8',
          med_name: '草果',
          med_class: '饮片',
          med_specification: '1.0g',
          med_factory: '',
          med_supplier: '',
          med_batch: '245345345',
          med_pleased: '$550',
          med_quantity: '33',
          med_amount: '$33'
        }, 
        {
          med_time: '2017-08-8',
          med_name: '草果',
          med_class: '饮片',
          med_specification: '1.0g',
          med_factory: '',
          med_supplier: '',
          med_batch: '245345345',
          med_pleased: '$550',
          med_quantity: '33',
          med_amount: '$33'
        }
      ],
      // 分页
      currentPage4: 4,
      // 时间选择器
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 7))
            picker.$emit('pick', [start, end])
          }
        }, 
        {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 30))
            picker.$emit('pick', [start, end])
          }
        }, 
        {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 90))
            picker.$emit('pick', [start, end])
          }
        }]
      },
      header: {
        ret: '',
        value7: ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.medicine-diary {
  margin-top: 20px;
  margin-left: 30px;
  .el-form {
    display: flex;
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
