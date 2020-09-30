<template>
  <div class="medicine-audit-2">
    <div class="header">
      <el-button type="primary" @click="goBack">返回</el-button>
      <el-button type="danger" @click="backTo">打回</el-button>
      <el-button type="success" @click="allowAudit">审核</el-button>
    </div>
    <div class="content">
      <span class="order-number">入库单号: {{ single_num }}</span>
      <span class="voucher">制单人: {{ voucher }}</span>
      <span class="make-date">制单日期: {{ making_date }}</span>
      <span class="suppliers">供应商: {{ suppliers }}</span>
    </div>
    <div class="total">入库总金额: {{ money }}</div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" width="70" label="序号" align="center">
      </el-table-column>
      <el-table-column prop="med_name" label="药品名称" align="center">
      </el-table-column>
      <el-table-column prop="med_gui" label="药品规格" align="center">
      </el-table-column>
      <el-table-column prop="med_factory" label="生产厂家" align="center" width="190">
      </el-table-column>
      <el-table-column label="数量" align="center" width="100">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.$index].quantity"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center" width="100">
        <template slot-scope="scope">
          <el-select v-model="tableData[scope.$index].unit" placeholder="请选择">
            <el-option v-for="item in option2" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="批发价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.$index].wholesale_price"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="处方价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.$index].price_prescription"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="零售价" align="center">
        <template slot-scope="scope">
          <el-input v-model="tableData[scope.$index].retail_price"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="wholesale_amount" label="批发额" align="center"></el-table-column>
      <el-table-column prop="Production_date" label="生产日期" align="center"></el-table-column>
      <el-table-column prop="validity_date" label="有效期" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <i class="el-icon-delete" @click="del(scope.$index, scope.row)"></i>
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
      single_num: '926347',
      voucher: '虚竹',
      suppliers: '云南白药',
      money: '200.00',
      making_date: '2017-09-09',
      // 分页
      currentPage1: 5,
      currentPage2: 5,
      currentPage3: 5,
      currentPage4: 4,
      // 单位select
      option2: [{ value: 'g', label: 'g' }, { value: 'kg', label: 'kg' }],
      tableData: [
        {
          med_name: '草果',
          classification: '中药',
          med_gui: '1.0g',
          med_factory: '哈药六厂哈药六厂哈药六厂哈药六厂哈药六厂哈药六厂',
          unit: '',
          wholesale_amount: '￥440',
          Production_date: '2017-10-09',
          validity_date: '2019-09-29',
          quantity: '',
          wholesale_price: '',
          retail_price: ''
        }, 
        {
          med_name: '飞龙',
          classification: '中药',
          med_gui: '1.0g',
          med_factory: '中国厂',
          unit: '',
          wholesale_amount: '￥230',
          Production_date: '2037-14-09',
          validity_date: '2012-09-29',
          quantity: '',
          wholesale_price: '',
          retail_price: ''
        }, 
        {
          med_name: '龙须草',
          classification: '中药',
          med_gui: '1.0g',
          med_factory: '中盖六厂',
          unit: '',
          wholesale_amount: '￥2120',
          Production_date: '2027-13-02',
          validity_date: '2034-19-49',
          quantity: '',
          wholesale_price: '',
          retail_price: ''
        }, 
        {
          med_name: '佛手',
          classification: '中药',
          med_gui: '1.0g',
          med_factory: '天神制药',
          unit: '',
          wholesale_amount: '￥320',
          Production_date: '2067-14-09',
          validity_date: '2014-32-23',
          quantity: '',
          wholesale_price: '',
          retail_price: ''
        }, 
        {
          med_name: '含羞草',
          classification: '中药',
          med_gui: '1.0g',
          med_factory: '广药六厂',
          unit: '',
          wholesale_amount: '￥204',
          Production_date: '2012-10-09',
          validity_date: '2013-09-29',
          quantity: '',
          wholesale_price: '',
          retail_price: ''
        }, 
        {
          med_name: '鬼切草',
          classification: '中药',
          med_gui: '1.0g',
          med_factory: '云南白药',
          unit: '',
          wholesale_amount: '￥2',
          Production_date: '2011-13-05',
          validity_date: '2015-39-24',
          quantity: '',
          wholesale_price: '',
          retail_price: ''
        }
      ],
      // 输入的数据
      userData: {
        quantity: '',
        wholesale_price: '',
        price_prescription: '',
        retail_price: ''
      }
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    del(index) {
      this.tableData.splice(index, 1)
    },
    backTo() {
      this.$message({
        message: '已打回！',
        type: 'warning'
      })
    },
    allowAudit() {
      this.$message({
        message: '已通过审核！',
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.medicine-audit-2 {
  margin-top: 20px;
  margin-left: 30px;
  .header {
    border-bottom: 1px solid #ccc;
    padding-bottom: 8px;
  }
  .content {
    color: #666;
    .voucher, .make-date, .suppliers {
      margin-left: 20px;
    }
  }
  .total {
    text-align: right;
    margin-right: 50px;
    margin-top: 20px;
    color: #42b983;
    font-size: 19px;
    font-weight: bold;
  }
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
