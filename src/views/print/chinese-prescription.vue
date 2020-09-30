<template>
  <ul class="chinese" v-aotoClose>
    <li class="item one-page" v-for="(item, index) in presList" :key="index">
      <el-row>
        <el-col :span="12" class="left">NO.{{ customer.registid }}</el-col>
        <el-col :span="12" class="right">普 {{ index + 1 }}/{{ presList.length }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="title"><h2>{{ customer.clinicname }}</h2></el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="title"><h2>中药处方笺</h2></el-col>
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
          <el-col :span="12" class="right"><span class="label">开具日期: {{ customer.createtime }}</span></el-col>
        </el-row>
      </div>
      <div class="container">
        <h1 class="rp">Rp</h1>
        <p class="chinese-list">
          <span class="list-item" v-for="(item_c, key) in item.drug_list" :key="key">
            {{ item_c.name }} {{ item_c.dosage }}{{ item_c.dose_unit }}  
            <i v-show="item_c.use_note">({{ item_c.use_note }})</i>
          </span>
        </p>
        <p class="empty">(以下空白)</p>
        <div class="usage">
          <p class="bold">{{ item.use_method }} 总共{{ item.total }}剂</p>
          <p>{{ item.frequency }} {{ item.talking_note }}</p>
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
      presList: [],  // 处方列表
      customer: {},  // 客户信息
      diagn_result: ''  // 临床诊断
    }
  },
  mounted() {
    this.customer = this.$store.getters.printMessage.details
    this.presList = this.$store.getters.printMessage.chinaMedPre
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
  }
}
</script>

<style lang="scss" scoped>
.chinese {
  padding: 10px;
  font-size: 12px;
  .item {
    &.one-page {
      page-break-after: always;
    }
    .boring-icon{
      font-size: 28px;
    }
    .el-row {
      .el-col {
        padding: 5px 0;
      }
      .right{
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
      min-height: 300px;
      border-bottom: 1px solid #000;
      .chinese-list {
        line-height: 30px;
        .list-item {
          margin-left: 20px;
        }
      }
      .empty {
        margin-top: 20px;
        font-size: 14px;
        text-align: center;
      }
      .usage {
        position: absolute;
        bottom: 0;
        left: 20px;
        .bold {
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
    .suggestion {
      border-top: 1px solid #000;
    }
  }
}
@media print {
  .chinese {
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

