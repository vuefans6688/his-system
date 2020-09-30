<template>
  <div class="treatment" v-aotoClose>
    <el-row>
      <el-col :span="24" class="left">NO.{{ customer.registid }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="title"><h2>{{ customer.clinicname }}</h2></el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="title"><h2>诊疗项目申请单</h2></el-col>
    </el-row>
    <div class="info">
      <el-row>
        <el-col :span="6"><span class="label">姓名: {{ customer.name }}</span></el-col>
        <el-col :span="3"><span class="label">性别: {{ customer.gender | sexFilter }}</span></el-col>
        <el-col :span="3"><span class="label">年龄: {{ customer.age }}岁</span></el-col>
        <el-col :span="6"><span class="label">科室: {{ customer.deptname }}</span></el-col>
        <el-col :span="6"><span class="label">费别: 自费</span></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><span class="label">电话/住址: {{ customer.phone }}</span></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><span class="label">临床诊断: {{ diagn_result }}</span></el-col>
        <el-col :span="12" class="right">
          <span class="label">开具日期: {{ customer.createtime }}</span>
        </el-col>
      </el-row>
    </div>
    <div class="container">
      <table style="width: 92%;">
        <tr>
          <th>项目名称</th>
          <th>数量</th>
          <th>单价</th>
        </tr>
        <tr v-for="(item, index) in treatment" :key="index">
          <td>{{ item.name }}</td>
          <td>{{ item.total }}</td>
          <td>{{ item.price }}</td>
        </tr>
      </table>
      <el-row class="total-price">
        <el-col class="right" :span="24"><span class="label">总金额: {{ totalPrice }}</span></el-col>
      </el-row>
    </div>
    <el-row class="footer">
      <el-col class="right" :span="24"><span class="label">申请医师: </span></el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      treatment: [],
      customer: {},
      diagn_result: ''  // 诊断
    }
  },
  mounted() {
    this.treatment = this.$store.getters.printMessage.checkItem.items
    this.customer = this.$store.getters.printMessage.details
    this.diagn_result = this.$store.getters.printMessage.medicalRecordsForm.diagn_result
    setTimeout(() => {
      window.print()
      window.close()
    }, 500)
  },
  directives: {
    aotoClose() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          window.opener = null
          window.open('', '_self')
          window.close()
        }
      })
    }
  },
  computed: {
    totalPrice() {
      let total = 0
      this.treatment.forEach(element => total += element.total_price)
      return total
    }
  }
}
</script>

<style lang="scss" scoped>
.treatment {
  padding: 15px;
  .el-row {
    .el-col {
      padding: 4px;
      &.right {
        text-align: right;
      }
      &.title {
        text-align: center;
      }
      .label {
        font-weight: bold;
      }
    }
  }
  .info {
    border-top: 1px solid #000;
  }
  .container {
    position: relative;
    min-height: 300px;
    border-bottom: 1px solid #000;
    border-top: 1px solid #000;
    table tr td {
      text-align: center;
      padding: 4px;
    }
    .total-price {
      position: absolute;
      bottom: 0;
      width: 100%;
      text-align: right;
    }
  }
}
@media print {
  .treatment {
    width: 90%;
    margin: 0 auto;
    float: none;
  }
  @page { 
    margin: 2cm; 
    size: A4; 
  }
  html {
    height: auto !important;
  }
  html, body {
    background-color: white;
  }
  body {
    font: 6pt "宋体", Georgia, "Times New Roman", Times, serif;
    line-height: 1;
    background: #fff !important;
    color: #000;
  }
}
</style>

