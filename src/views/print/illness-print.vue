<template>
  <div class="illness" v-aotoClose>
    <el-row class="illness-type">
      <el-col :span="24" class="left"><span class="bold">NO.</span>{{ customer.registid }}</el-col>
    </el-row>
    <h3 class="title">门诊病历({{ customer.clinicname }})</h3>
    <el-row class="row3">
      <el-col :span="5"><span class="bold">姓名: {{ customer.name }}</span></el-col>
      <el-col :span="4"><span class="bold">性别: {{ customer.gender | sexFilter }}</span></el-col>
      <el-col :span="4"><span class="bold">年龄: {{ customer.age }}</span></el-col>
      <el-col :span="5"><span class="bold">科室: {{ customer.deptname }}</span></el-col>
      <el-col :span="6"><span class="bold">登记号: {{ customer.registid.slice(-8) }}</span></el-col>
    </el-row>
    <el-row>
      <el-col :span="3">主诉: </el-col>
      <el-col :span="21">{{ illness.complaint }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">过敏史: </el-col>
      <el-col :span="21">{{ illness.allergy_history }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">既往史: </el-col>
      <el-col :span="21">{{ illness.past_history }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">现病史: </el-col>
      <el-col :span="21">{{ illness.cur_history }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">个人史: </el-col>
      <el-col :span="21">{{ illness.person_history }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">家族史: </el-col>
      <el-col :span="21">{{ illness.family_history }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">生命体征: </el-col>
      <el-col :span="5">体温: {{ illness.temperature }} °C</el-col>
      <el-col :span="6">血压: {{ illness.systolic_pressure }}/{{ illness.diastolic_pressure }} mmHg</el-col>
      <el-col :span="5">脉搏: {{ illness.pulse }} bpm</el-col>
      <el-col :span="5">呼吸: {{ illness.breathing }} 次/分</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">体格检查: </el-col>
      <el-col :span="21">{{ illness.mainphyexam }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="3">辅助检查: </el-col>
      <el-col :span="21">{{ illness.other_phy_exam }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="4">初步诊断: </el-col>
      <el-col :span="20">
        <span v-for="(item, index) in illness.jibingjson" :key="index">{{ item.jbname }}</span>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="3">治疗意见: </el-col>
      <el-col :span="21">{{ illness.advice }}</el-col>
    </el-row>
    <el-row class="line">
      <el-col :span="24">
        <span class="bold">医生签字: {{ printMessage.doctorTip.name }}</span>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      customer: {},
      illness: {},
      advice: ''
    }
  },
  computed: {
    ...mapGetters(['printMessage'])
  },
  mounted() {
    this.customer = this.$store.getters.printMessage.details
    this.illness = this.$store.getters.printMessage.medicalRecordsForm
    this.advice = this.$store.getters.printMessage.advice
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
.illness {
  display: block;
  top: 0;
  padding: 16px;
  font-size: 12px;
  .el-row {
    .el-col {
      padding: 5px 2px;
    }
  }
  .illness-type {
    .right {
      text-align: right;
    }
  }
  .title {
    text-align: center;
  }
  .medical-card {
    border-bottom: 1px solid #000;
  }
  .row1, .row2 {
    border-bottom: 1px solid #ccc;
  }
  .row3 {
    border-bottom: 1px solid #000;
  }
  .line {
    border-top: 2px solid #000;
  }
  .bold {
    font-weight: bold;
  }
}
@media print {
  .illness {
    width: 100%;
    margin: 0;
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

