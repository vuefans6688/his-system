<template>
  <div v-aotoClose>
    <div class="bill-print one-page" v-for="(feeDetail, index) in feeList" :key="index">
      <el-row class="header">
        <el-col :span="8">{{ feeDetail.liushui }}</el-col>
        <el-col :span="8">{{ feeDetail.yiliaoCard }}</el-col>
        <el-col :span="8">{{ feeDetail.liushui.slice(-8) }}</el-col>
      </el-row>
      <el-row class="header">
        <el-col :span="12">{{ feeDetail.deptname }}</el-col>
        <el-col :span="12">{{ new Date().format('yyyy MM dd') }}</el-col>
      </el-row>
      <div class="print-body">
        <el-row class="line">
          <el-col :span="24">{{ feeDetail.name }}</el-col>
        </el-row>
        <el-row class="line">
          <el-col :span="8" v-if="feeDetail.isSb">{{ feeDetail.printSbJijin + feeDetail.printSbAccount }}</el-col>
          <el-col :span="8">{{ feeDetail.printsbCash }}</el-col>
          <el-col :span="8">{{ feeDetail.isSb | chargeTypeFilter }}</el-col>
        </el-row>
        <!-- 药品 -->
        <el-row v-if="feeDetail.westTotalPrice">
          <el-col :span="10">西药: </el-col>
          <el-col :span="14">{{ feeDetail.westTotalPrice }}</el-col>
        </el-row>
        <el-row v-if="feeDetail.zhongchengTotalPrice">
          <el-col :span="10">中成药: </el-col>
          <el-col :span="14">{{ feeDetail.zhongchengTotalPrice }}</el-col>
        </el-row>
        <el-row v-if="feeDetail.zhongcaoTotalPrice">
          <el-col :span="10">中草药: </el-col>
          <el-col :span="14">{{ feeDetail.zhongcaoTotalPrice }}</el-col>
        </el-row>
        <!-- 检查项 -->
        <el-row v-if="feeDetail.checkTotalPrice">
          <el-col :span="10">检查费: </el-col>
          <el-col :span="14">{{ feeDetail.checkTotalPrice }}</el-col>
        </el-row>
        <!-- 其他项 -->
        <el-row v-if="feeDetail.otherTotalPrice">
          <el-col :span="10">其他: </el-col>
          <el-col :span="14">{{ feeDetail.otherTotalPrice }}</el-col>
        </el-row>
        <el-row class="line">
          <el-col :span="12">{{ feeDetail.printSbTotal | moneyUpperCase }}</el-col>
          <el-col :span="12">{{ feeDetail.printSbTotal }}</el-col>
        </el-row>
      </div>
      <div class="footer">
        <el-row>
          <el-col :span="24">{{ user.truename }}</el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { changeMoneyToChinese } from '@/utils/money'
export default {
  mounted() {
    setTimeout(() => {
      window.print()
      window.close()
    }, 500)
  },
  computed: {
    ...mapGetters(['user', 'feeList'])
  },
  filters: {
    chargeTypeFilter(type) {
      return type ? '医保' : '自费'
    },
    moneyUpperCase(total) {
      return changeMoneyToChinese(Math.abs(total))
    }
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
  }
}
</script>

<style lang="scss" scoped>
.bill-print {
  padding: 6px;
  font-size: 10px;
  &.one-page {
    page-break-after: always;
  }
  .title {
    height: 45px;
  }
  .header {
    height: 18px;
    line-height: 18px;
  }
  .empty-line {
    height: 24px;
  }
  .print-body {
    .line {
      height: 24px;
    }
    .el-row {
      height: 24px;
    }
    .remark {
      height: 45px;
    }
  }
  .footer {
    height: 24px;
  }
}
@media print {
  .bill-print {
    width: 90%;
    margin: 0 auto;
    float: none;
  }
  @page { 
    margin: 2cm; 
  }
  html {
    height: auto !important;
  }
  html, body {
    background-color: white;
  }
  body {
    font: 6pt "宋体", Georgia, "Times New Roman", Times, serif;
    line-height: 1.3;
    background: #fff !important;
    color: #000;
  }
}
</style>
