<template>
  <div class="medicine-price">
    <el-form :model="userData1" size="small" label-width="80px">
      <div class="apply-number">申请单号: {{ Apply_num }}</div>
      <el-form-item label="制单日期:" style="margin-left: 10px;">
        <el-date-picker v-model="userData1.making_date" type="date" placeholder="请选择日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="制单人:">
        <el-input v-model="userData1.making_man" style="width: 280px;" placeholder="请输入制单人"></el-input>
      </el-form-item>
      <el-form-item label="药品名称:" style="margin-left: 10px;">
        <el-input v-model="userDatas.ipt" style="width: 280px;" placeholder="请输入药品名称"></el-input>
      </el-form-item>
    </el-form>
    <el-table :data="tableData | messageFilter(sou.ipt)" stripe>
      <el-table-column type="index" width="70" label="序号" align="center"></el-table-column>
      <el-table-column prop="med_name" label="药品名称" align="center"></el-table-column>
      <el-table-column prop="med_gui" label="药品规格" align="center"></el-table-column>
      <el-table-column prop="med_factory" label="生产厂家" width="200" show-overflow-tooltip align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.row.id].factory" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="原处方价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.row.id].Original_price" size="small" style="width: 100px;"></el-input>
          <span>/{{ tableData[scope.row.id].unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原零售价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.row.id].Original_Retail_price" size="small" style="width: 100px;"></el-input>
          <span>/{{ tableData[scope.row.id].unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新处方价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.row.id].New_price" size="small" style="width: 100px;"></el-input>
          <span>/{{ tableData[scope.row.id].unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新零售价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.row.id].New_Retail_price" size="small" style="width: 100px;"></el-input>
          <span>/{{ tableData[scope.row.id].unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
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
      tableData: [
        {
          id: 1,
          med_name: '草果',
          med_gui: '1.0g',
          med_factory: '哈药六厂',
          unit: '盒',
          factory: '',
          Original_price: '',
          Original_Retail_price: '',
          New_price: '',
          New_Retail_price: ''
        }, 
        {
          id: 0,
          med_name: '草果',
          med_gui: '1.0g',
          med_factory: '哈药六厂',
          unit: '包',
          Original_price: '',
          Original_Retail_price: '',
          New_price: '',
          New_Retail_price: '',
          factory: ''
        }, 
        {
          id: 2,
          med_name: '龙国',
          med_gui: '1.0g',
          med_factory: '中英制药',
          unit: '盒',
          Original_price: '',
          Original_Retail_price: '',
          New_price: '',
          New_Retail_price: '',
          factory: ''
        }, 
        {
          id: 3,
          med_name: '草果',
          med_gui: '1.0g',
          med_factory: '云南白药',
          unit: '包',
          Original_price: '',
          Original_Retail_price: '',
          New_price: '',
          New_Retail_price: '',
          factory: ''
        }, 
        {
          id: 4,
          med_name: '葡萄',
          med_gui: '1.0g',
          med_factory: '天神制药',
          unit: '盒',
          Original_price: '',
          Original_Retail_price: '',
          New_price: '',
          New_Retail_price: '',
          factory: ''
        }, 
        {
          id: 5,
          med_name: '红素',
          med_gui: '1.0g',
          med_factory: '飞鹰药品',
          unit: '盒',
          Original_price: '',
          Original_Retail_price: '',
          New_price: '',
          New_Retail_price: '',
          factory: ''
        }
      ],
      arr: [],
      Apply_num: 'M25554',  // 申请单号
      // 分页
      currentPage4: 4,
      // 输入的数据
      userData1: {
        making_date: '',
        making_man: ''
      },
      userData2: {
        factory: '',
        Original_price: '',
        Original_Retail_price: '',
        New_price: '',
        New_Retail_price: ''
      },
      sou: {
        ipt: ''
      },
      userDatas: {
        ipt: ''
      }
    }
  },
  methods: {
    del(index) {
      this.tableData.splice(index, 1)
    }
  },
  filters: {
    messageFilter(message, name) {
      return message.filter(obj =>  obj.med_name.includes(name))
    }
  }
}
</script>

<style lang="scss" scoped>
.medicine-price {
  margin-top: 20px;
  margin-left: 30px;
  .el-form {
    display: flex;
    .apply-number {
      margin-top: 6px;
      color: #42b983;
    }
  }
  .el-table {
    margin-top: 20px;
    width: 96%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
