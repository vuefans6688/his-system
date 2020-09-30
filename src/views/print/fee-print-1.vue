<template>
  <div class="fee-print" v-aotoClose>
    <h2 class="title">门诊费用清单</h2>
    <div class="line"></div>
    <div class="header">
      <el-row>
        <el-col :span="24">姓名: {{ feeDetail.name }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="24">收费时间: {{ new Date().format('yyyy-MM-dd hh: mm') }}</el-col>
      </el-row>
    </div>
    <div class="content">
      <el-row>
        <el-col :span="12">收费项目</el-col>
        <el-col :span="6">单价</el-col>
        <el-col :span="6">数量</el-col>
      </el-row>
      <div class="fee-list" v-for="(item, index) in feeDetail.items" :key="index">
        <div v-if="item.type === 1">
          <el-row>
            <el-col :span="12">{{ item.data.feename }}</el-col>
            <el-col :span="6">{{ item.data.feeprice }}</el-col>
            <el-col :span="6">1</el-col>
          </el-row>
        </div>
        <div v-else-if="item.type === 2">
          <el-row v-for="(drug_item, index2) in item.data.drug_list" :key="index2">
            <el-col :span='12'>{{ drug_item.name }}</el-col>
            <el-col :span="6">{{ drug_item.price }}</el-col>
            <el-col :span="6">
              <span class="west-dosage" v-show="item.data.prescript_type === 2">
                {{ drug_item.dosage }} * {{ drug_item.total }}
              </span>
            </el-col>
          </el-row>
        </div> 
        <div v-else>
          <el-row>
            <el-col :span="12">{{ item.data.name }}</el-col>
            <el-col :span="6">{{ item.data.price }}</el-col>
            <el-col :span="6">{{ item.data.total }}</el-col>
          </el-row>
        </div> 
      </div>
    </div>
    <div class="line"></div>
    <div class="fee-calculate">
      <el-row>
        <el-col :span="12">应收金额: {{ feeDetail.needPay }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">实收金额: {{ feeDetail.realPay }}</el-col>
      </el-row>
      <el-row>  
        <el-col :span="12">减免金额: {{ feeDetail.discount }}</el-col>
      </el-row>
    </div>
    <div class="line"></div>
    <div class="footer">
      <el-row>
        <el-col :span="24">收费单位（盖章）</el-col>
      </el-row>
      <el-row>
        <el-col :span="24">收银员: {{ user.truename }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="24">客户签名: <span class="sign"></span></el-col>
      </el-row>
      <el-row>
        <el-col :span="24">电话/地址: {{ feeDetail.phone }}</el-col>
      </el-row>
    </div>
    <div class="line"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  mounted() {
    setTimeout(() => {
      window.print()
      window.close()
    }, 500)
  },
  computed: {
    ...mapGetters(['user', 'feeDetail'])
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
  font-size: 6px;
  .line {
    padding: 3px 0;
    border-bottom: 1px dashed #000;
  }
  .el-row {
    line-height: 20px;
  }
  .title {
    text-align: center;
    line-height: 20px;
  }
  .content .el-row {
    .el-col {
      text-align: center;
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
    size: 5.5in 8.5in;
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

