<template>
<ul class="water" v-aotoClose>
	<li class="item one-page" v-for="(item, index) in presList" :key="index">
	  <el-row>
      <el-col :span="12" class="left">NO.{{ customer.registid }}</el-col>
      <el-col :span="12" class="right">普 {{ index + 1 }}/{{ presList.length }}</el-col>
	  </el-row>
	  <el-row>
	    <el-col :span="24" class="title"><h2>{{ customer.clinicname }}</h2></el-col>
	  </el-row>
	  <el-row>
	    <el-col :span="24" class="title"><h2>输液申请单</h2></el-col>
	  </el-row>
    <el-row>
      <el-col :span="8">
        <span class="label">费别: </span>
        <i class="el-icon-coin"></i>自费 
        <i class="el-icon-discount"></i>医保
      </el-col>
      <el-col :span="8"><span class="label">医疗证/社保卡</span></el-col>
      <el-col :span="8"><span class="label">门诊/住院病历号: {{ customer.registid.slice(-8) }}</span></el-col>
    </el-row>
	  <div class="info">
      <el-row>
        <el-col :span="6"><span class="label">姓名: {{ customer.name }}</span></el-col>
        <el-col :span="3"><span class="label">性别: {{ customer.gender | sexFilter }}</span></el-col>
        <el-col :span="3"><span class="label">年龄: {{ customer.age }}岁</span></el-col>
        <el-col :span="6"><span class="label">科室: {{ customer.deptname }}</span></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"><span class="label">电话/地址: {{ customer.phone }}</span></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"><span class="label">临床诊断: {{ diagn_result }}</span></el-col>
        <el-col :span="12" class="right">
          <span class="label">开具日期: {{ customer.createtime }}</span>
        </el-col>
      </el-row>
	  </div>
	  <div class="container">
      <h2 class="rp">Rp</h2>
      <el-row>
        <el-col :span="9">药品名称</el-col>
        <el-col :span="6">规格</el-col>
        <el-col :span="4">单次剂量</el-col>
        <el-col :span="2">皮试</el-col>
        <el-col :span="3">数量</el-col>
      </el-row>
      <div class="group" v-for="(group, index2) in item" :key="index2">
        <el-row class="highlight">
          <el-col :span="24">组 {{group.drug_list[0].group_index_str}}</el-col>
        </el-row>
        <el-row v-for="(group_item, index3) in group.drug_list" :key="index3">
          <el-col :span="9">{{ group_item.medName }}</el-col>
          <el-col :span="6">{{ group_item.spec_text }}</el-col>
          <el-col :span="4">{{ group_item.dosage }}{{ group_item.dose_unit }}</el-col>
          <el-col :span="2">{{ group_item.skin_test | skinFilter }}</el-col>
          <el-col :span="3">{{ group_item.total }}{{ group_item.total_unit }}</el-col>
        </el-row>
        <el-row class="highlight undeline">
          <el-col :span="6">用法: {{ group.use_method }}</el-col>
          <el-col :span="6">频次: {{ group.frequency }}</el-col>
          <el-col :span="6">滴速: {{ group.infusion_speed }} {{ group.infu_speed_unit }}</el-col>
          <el-col :span="6">连续天数: {{ group.days }}</el-col>
        </el-row>
      </div>
	  </div>
	  <el-row>
      <el-col :span="8"><span class="label">审核: </span></el-col>
      <el-col :span="8"><span class="label">调配: </span></el-col>
      <el-col :span="8"><span class="label">医师: </span></el-col>
	  </el-row>
	  <el-row>
      <el-col :span="8"><span class="label">核对: </span></el-col>
      <el-col :span="8"><span class="label">发药: </span></el-col>
      <el-col :span="8"><span class="label">处方总金额: </span></el-col>
	  </el-row>
	  <div class="suggestion">
      <el-row>
        <el-col :span="3">温馨提示: </el-col>
        <el-col :span="21">1.本处方当日有效</el-col>
      </el-row>
      <el-row>
        <el-col :span="24">2.取药时请当面核对药品名称、规格、数量</el-col>
      </el-row>
	  </div>
	</li>
</ul>
</template>

<script>
export default {
  data() {
    return {
      presList: [],
      customer: {},
      diagn_result: ''
    }
  },
  mounted() {
    this.customer = this.$store.getters.printMessage.details
    this.presList = this.$store.getters.printMessage.infusionMedPre
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
  filters: {
    skinFilter(flag) {
      return flag ? '是' : '否'
    }
  }
}
</script>

<style lang="scss" scoped>
.water {
  padding: 10px;
  font-size: 10px;
  .item {
    &.one-page {
      page-break-after: always;
    }
    .boring-icon {
      font-size: 28px;
    }
    .el-row {
      &.highlight {
        font-weight: 700;
      }
      &.underline {
        border-bottom: 1px dashed #ccc;
      }
      .el-col {
        padding: 2px;
        font-size: 10px;
      }
      .right {
        text-align: right;
      }
      .title {
        line-height: 30px;
        text-align: center;
      }
      .el-col .label {
        font-weight: bold;
      }
    }
    .info {
      border-bottom: 1px solid #000;
      border-top: 1px solid #000;
    }
    .container {
      position: relative;
      min-height: 360px;
      border-bottom: 1px solid #000;
      .group:last-of-type .underline {
        border: none;
      }
    }
    .suggestion {
      border-top: 1px solid #000;
    }
  }
}
@media print {
  .water {
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
