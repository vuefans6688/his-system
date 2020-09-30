<template>
  <div class="medicine-warning">
    <div class="header">
      <span class="drug-type">药品类型: </span>
      <el-select v-model="header.classification" size="small">
        <el-option label="全部" value="1"></el-option>
        <el-option label="饮片" value="2"></el-option>
        <el-option label="中成药" value="3"></el-option>
        <el-option label="化学制剂" value="4"></el-option>
        <el-option label="耗材" value="5"></el-option>
        <el-option label="生物制剂" value="6"></el-option>
        <el-option label="其他" value="7"></el-option>            
      </el-select>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column prop="med_n" label="药品名称"></el-table-column>
      <el-table-column prop="med_f" label="药品分类"></el-table-column>
      <el-table-column prop="med_g" label="规格"></el-table-column>
      <el-table-column prop="med_c" label="生产厂家" show-overflow-tooltip></el-table-column>
      <el-table-column prop="med_k" label="库存"></el-table-column>
      <el-table-column prop="med_y" label="库存阈值"></el-table-column>
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
      header: {
        classification: ''
      },
      tableData: [
        {
          med_n: '草果',
          med_f: '饮片',
          med_g: '1.0g',
          med_c: '',
          med_k: '0',
          med_y: '0'
        }, 
        {
          med_n: '草果',
          med_f: '饮片',
          med_g: '1.0g',
          med_c: '',
          med_k: '0',
          med_y: '0'
        }, 
        {
          med_n: '草果',
          med_f: '饮片',
          med_g: '1.0g',
          med_c: '',
          med_k: '0',
          med_y: '0'
        }, 
        {
          med_n: '草果',
          med_f: '饮片',
          med_g: '1.0g',
          med_c: '',
          med_k: '0',
          med_y: '0'
        }, 
        {
          med_n: '草果',
          med_f: '饮片',
          med_g: '1.0g',
          med_c: '',
          med_k: '0',
          med_y: '0'
        }, 
        {
          med_n: '草果',
          med_f: '饮片',
          med_g: '1.0g',
          med_c: '',
          med_k: '0',
          med_y: '0'
        }
      ],
      currentPage4: 4
    }
  }
}
</script>

<style lang="scss" scoped>
.medicine-warning {
  margin-top: 20px;
  margin-left: 30px;
  .header {
    margin-top: 20px;
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
