<template>
  <div class="medicine-effective">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="药品名称:">
        <el-input v-model="userData.name" placeholder="请输入药品名称" style="width: 280px;"></el-input>
      </el-form-item>
      <el-form-item label="有效期:">
        <el-date-picker v-model="userData.time" type="daterange" range-separator="-" 
          start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="药品类型:" style="margin-left: 10px;">
        <el-select v-model="userData.class">
          <el-option label="全部" value="全部"></el-option>
          <el-option label="中药" value="中药"></el-option>
          <el-option label="西药" value="西药"></el-option>
        </el-select>
      </el-form-item>
    </el-form> 
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="med_name" label="药品名称" align="center"></el-table-column>
      <el-table-column prop="med_class" label="药品分类" align="center"></el-table-column>
      <el-table-column prop="med_gui" label="药品规格" align="center"></el-table-column>
      <el-table-column prop="med_factory" label="生产厂家" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="prescription_price" label="处方价" align="center"></el-table-column>
      <el-table-column prop="retail_price" label="零售价" align="center"></el-table-column>
      <el-table-column prop="med_store" label="库存" align="center"></el-table-column>
      <el-table-column prop="validity_period" label="到期日" align="center"></el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage4" :page-sizes="[10, 20, 30, 40]" :page-size="10"
      layout="total, sizes, prev, pager, next, jumper" :total="40">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userData: {
        name: '',
        class: '',
        time: ''
      },
      // 搜索控制数据
      search: {
        name: '',
        class: '',
        time: ''
      },
      tableData: [
        {
          med_name: '草果',
          validity_period: '2017-09-11',
          med_class: '中药',
          med_gui: '1.0',
          med_factory: '云南白药',
          med_store: '4',
          prescription_price: '￥33',
          retail_price: '￥66'
        }, 
        {
          med_name: '白菜',
          validity_period: '2017-05-19',
          med_class: '西药',
          med_gui: '1.0',
          med_factory: '云南白药云南白药云南白药云南白药云南白药云南白药',
          med_store: '12',
          prescription_price: '￥33',
          retail_price: '￥57'
        }, 
        {
          med_name: '佛手',
          validity_period: '2017-06-08',
          med_class: '中药',
          med_gui: '1.0',
          med_factory: '云南白药',
          med_store: '53',
          prescription_price: '￥12',
          retail_price: '￥33'
        }, 
        {
          med_name: '紫罗丹',
          validity_period: '2017-12-23',
          med_class: '中药',
          med_gui: '1.0',
          med_factory: '云南白药',
          med_store: '67',
          prescription_price: '￥11',
          retail_price: '￥56'
        }, 
        {
          med_name: '牛黄',
          validity_period: '2017-04-01',
          med_class: '西药',
          med_gui: '1.0',
          med_factory: '云南白药',
          med_store: '45',
          prescription_price: '￥12',
          retail_price: '￥55'
        }, 
        {
          med_name: '救心剂',
          validity_period: '2017-03-21',
          med_class: '西药',
          med_gui: '1.0',
          med_factory: '云南白药',
          med_store: '23',
          prescription_price: '￥2',
          retail_price: '￥66'
        }
      ],
      // 分页
      currentPage4: 4
    }
  },
  methods: {
    searchContent() {
      this.search.name = this.userData.name
      this.search.class = this.userData.class
    }
  }
}
</script>

<style lang="scss" scoped>
.medicine-effective {
  margin-top: 20px;
  margin-left: 30px;
  .el-form {
    margin-top: 20px;
    display: flex;
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
