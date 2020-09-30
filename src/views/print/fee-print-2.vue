<template>
  <div v-aotoClose>
    <div class="fee-print one-page" v-for="(feeDetail, index) in feeList" :key="index">
      <h1 class="clinic-name">{{ clinicName }}{{ feeDetail.type | payOrback }}</h1>
      <el-row>
        <el-col :span="6">姓名(单位): {{ feeDetail.name }}</el-col>
        <el-col :span="8">收据号: {{ feeDetail.danju }}</el-col>
        <el-col :span="10">门诊流水号: {{ feeDetail.liushui }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="6">医疗证号: {{ feeDetail.yiliaoCard }}</el-col>
        <el-col :span="8">电脑号: {{ feeDetail.computerCard }}</el-col>
        <el-col :span="10">打印日期: {{ new Date().format('yyyy-MM-dd') }}</el-col>
      </el-row>
      <div class="table-wrap">
        <table class="table">
          <tr>
            <td>项目</td>
            <td>金额</td>
            <td>项目</td>
            <td>金额</td>
            <td>项目</td>
            <td>金额</td>
            <td>项目</td>
            <td>金额</td>
            <td>项目</td>
            <td>金额</td>
          </tr>
          <tr>
            <td>检查治疗</td>
            <td>{{ feeDetail.checkTotalPrice }}</td>
            <td>西药</td>
            <td>{{ feeDetail.westTotalPrice }}</td>
            <td>中成药</td>
            <td>{{ feeDetail.zhongchengTotalPrice }}</td>
            <td>中草药</td>
            <td>{{ feeDetail.zhongcaoTotalPrice }}</td>
            <td>其他</td>
            <td>{{ feeDetail.otherTotalPrice }}</td>
          </tr>
          <tr>
            <td>总金额</td>
            <td>￥{{ feeDetail.printSbTotal }}</td>
            <td colspan="8" class="align-left">人民币(大写): {{ feeDetail.printSbTotal | moneyUpperCase }}</td>
          </tr>
          <tr>
            <td>优惠金额</td>
            <td>￥ {{ feeDetail.reduce || 0 }}</td>
            <td>现金支付</td>
            <td>{{ feeDetail.printsbCash }}</td>
            <td>账户支付</td>
            <td>{{ feeDetail.printSbAccount }}</td>
            <td>基金支付</td>
            <td>{{ feeDetail.printSbJijin }}</td>
            <td>收银员</td>
            <td>{{ user.truename }}</td>
          </tr>
          <tr v-show="feeDetail.list && feeDetail.list.length">
            <td colspan="10" class="align-left">
              <el-row style="font-weight: 600;padding-left: 20px;">
                <el-col :span="6">名称</el-col>
                <el-col :span="4">批号</el-col>
                <el-col :span="6">规格</el-col>
                <el-col :span="4">单价</el-col>
                <el-col :span="2">数量</el-col>
                <el-col :span="2">金额</el-col>
              </el-row>
              <div v-for="(testItem, testIndex) in feeDetail.list" :key="testIndex" style="margin-bottom: 0;">
                <div v-if="testItem.chargetype === 2">
                  <el-row style="text-align: left;">
                    <el-col :span="18">
                      <span v-if="testItem.data.prescript_type === 1">西/中成药处方</span>
                      <span v-if="testItem.data.prescript_type === 2">中药处方</span>
                      <span v-if="testItem.data.prescript_type === 3">输液处方</span>
                    </el-col>
                    <el-col :span="6">总计: {{ testItem.szsbrecord.total }}</el-col>
                  </el-row>
                  <div style="padding-left: 20px;">
                    <el-row v-for="(testDrug, TestIndex2) in testItem.data.drug_list" :key="TestIndex2">
                      <el-col :span="6">{{ testDrug.name }}</el-col>
                      <el-col :span="4">{{ new Date().format('yyyyMMdd') + '0' + testDrug.drugxuhao }}</el-col>
                      <el-col :span="6">{{ testDrug.spec_text }}</el-col>
                      <el-col :span="4">{{ testDrug.druginfo.shebao_price }}/{{ testDrug.total_unit }}</el-col>
                      <el-col :span="2">{{ testDrug.total }} {{ testDrug.total_unit }}</el-col>
                      <el-col :span="2">{{ testDrug.total * testDrug.druginfo.shebao_price }}</el-col>
                    </el-row>
                  </div>
                </div>
                <el-row v-else>
                  <el-col :span="6">{{ testItem.data.name }}</el-col>
                  <el-col :span="6">{{ testItem.data.item.szsbprice }}</el-col>
                  <el-col :span="6">{{ testItem.data.total }}</el-col>
                  <el-col :span="6">{{ testItem.szsbrecord.total }}</el-col>
                </el-row>
              </div>
            </td>
          </tr>
        </table>
        <el-row>
          <el-col :span="12">支付前余额: {{ feeDetail.personleftbp }}</el-col>
          <el-col :span="12">支付后余额: {{ feeDetail.personleft }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="12">如需开发票,请凭当日收据到收费处办理,过期不候!</el-col>  
          <el-col :span="12">单位: {{ clinicName }}</el-col>  
        </el-row>    
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getClinicName } from '@/serve/api'
import service from '@/utils/request'
import { changeMoneyToChinese } from '@/utils/money'
export default {
  data() {
    return {
      clinicName: ''
    }
  },
  methods: {
    handleClinicName() {  // 获取诊所名
      service(getClinicName).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.clinicName = res.clinic_name
        }
      })
    }
  },
  created() {
    this.handleClinicName()
  },
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
    payOrback(type) {
      return type === 1 ? '收费收据' : '退费单'
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
.fee-print {
  padding: 0 6px;
  font-size: 8px;
  &.one-page {
    page-break-after: always;
  }
  .clinic-name {
    text-align: center;
  }
  .table-wrap {
    .table {
      width: 100%;
      border-top: 1px solid #000;
      border-left: 1px solid #000;
      text-align: center;     
      td {
        border-right: 1px solid #000;
        border-bottom: 1px solid #000;
        line-height: 16px;
        &.align-left {
          text-align: left;
        }
      }
    }
  }
}
@media print {
  .fee-print {
    width: 90%;
    margin: 0 auto;
    float: none;
  }
  @page { 
    margin: 0; 
    size: A4; 
  }
  html {
    height: auto !important;
  }
  html, body {
    background-color: white;
  }
  body {
    font: 2pt "宋体", Georgia, "Times New Roman", Times, serif;
    line-height: 1;
    background: #fff !important;
    color: #000;
  }
}
</style>

