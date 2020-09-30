<template>
  <div class="check-client-message">
    <div class="box">
      <div class="back">
        <el-button type="primary" size="small" @click="goHistory">返回</el-button>
      </div>
      <h4 class="title">客户信息</h4>
      <el-row>
        <el-col :span="8">
          <p>姓名: {{ patientMsg.name }}</p>
          <p>性别: {{ patientMsg.gender | sexFilter }}</p>
        </el-col>
        <el-col :span="8">
          <p>年龄: {{ patientMsg.age }}岁({{ patientMsg.birthdate }})</p>
          <p>客户类型: 自费</p>
        </el-col>
        <el-col :span="8">
          <p>客户来源: {{ patientMsg.patienttype | sourceTypeFilter }}</p>
          <p>最近就诊时间: {{ patientMsg.createtime }}</p>
        </el-col>
      </el-row>
    </div>
    <div class="content">
      <h4 class="title">门诊病历</h4>
      <el-row>
        <el-col :span="8">
          <p>主诉: {{ medical.complaint }}</p>
          <p>现病史: {{ medical.cur_history }}</p>
          <p>既往史: {{ medical.past_history }}</p>
          <p>个人史: {{ medical.person_history }}</p>
          <p>过敏史: {{ medical.allergy_history }}</p>
          <p>家族史: {{ medical.family_history }}</p>
        </el-col>
        <el-col :span="8">
          <p>其它: {{ medical.other_history }}</p>
          <p>体温: {{ medical.temperature }} °C</p>
          <p>血压: {{ medical.systolic_pressure }} / {{ medical.diastolic_pressure }} mmHg</p>
          <p>脉搏: {{ medical.pulse }} bpm</p>
          <p>呼吸: {{ medical.breathing }} 次/分</p>
          <p>体格检查: {{ medical.mainphyexam }}</p>
        </el-col>
        <el-col :span="8">
          <p>辅助检查: {{ medical.other_phy_exam }}</p>
          <p>初步诊断: </p>
          <p v-for="(item, index) in medical.jibingjson" :key="index">{{ item.jbname }}</p>
          <p>治疗意见: {{ medical.advice }}</p>
        </el-col>
      </el-row>
      <h4 class="title">处方单</h4>
      <div class="west" v-for="(item, index) in westPrescriptions" :key="index">
        <h4>西药处方{{ index + 1 }} ({{ item.status | statusFilter }})</h4>
        <div v-for="(item2, index2) in item.drug_list" :key="index2">
          <p>药名: {{ item2.name }}</p>
          <p>厂商: {{ item2.producer }}</p>
          <p>规格: {{ item2.spec_text }}</p>
          <p>用法: {{ item2.use_method }}</p>
          <p>单次剂量: {{ item2.dosage }} {{ item2.dose_unit }}</p>
          <p>频次: {{ item2.frequency }}</p>
          <p>天数: {{ item2.days }}</p>
          <p>开药数量: {{ item2.total }} {{ item2.total_unit }}</p>
        </div>
      </div>
      <div class="china" v-for="(item, index) in chinaPrescriptions" :key="index">
        <h4>中药处方{{ index + 1 }} ({{ item.status | statusFilter }})</h4>
        <div v-for="(item2, index2) in item.drug_list" :key="index2">
          <p>药名: {{ item2.name }}</p>
          <p>厂商: {{ item2.producer }}</p>
          <p>单次剂量: {{ item2.dosage }} {{ item2.dose_unit }}</p>
          <p>煎法/用法: {{ item2.use_note }}</p>
          <p>{{ item2.use_method }}</p>
          <p>总共: {{ item2.total }} 剂</p>
          <p>每次: {{ item2.daily_use }} ml</p>
          <p>频次: {{ item2.frequency }}</p>
          <p>其他要求: {{ item2.taking_note }}</p>
        </div>
      </div>
      <div class="water" v-for="(item, index) in waterPrescriptions" :key="index" 
        v-show="waterPrescriptions.length">
        <h4>输液处方{{ index + 1 }} ({{ item.status | statusFilter }})</h4>
        <div v-for="(item2, index2) in item.drug_list" :key="index2">
          <p>输液组{{ item2.group_index_str}}</p>
          <p>药名: {{ item2.name }}</p>
          <p>厂商: {{ item2.producer }}</p>
          <p>规格: {{ item2.spec_text }}</p>
          <p>单次剂量: {{ item2.dosage }} {{ item2.dose_unit }}</p>
          <p>皮试: {{ item2.skin_test === 0 ? '不需要' : '需要' }}</p>
          <p>数量: {{ item2.total }} {{ item2.total_unit }}</p>
          <p>用法: {{ item2.use_method }} </p>
          <p>频次: {{ item2.frequency }} </p>
          <p>滴速: {{ item2.infusion_speed }} {{ item2.infu_speed_unit }}</p>
          <p>开始日期: {{ item2.begin_date | dateFilter }} </p>
          <p>连续天数: {{ item2.days }} </p>
        </div>
      </div>
      <h4 class="title">收费项目</h4>
      <div class="charg-items" v-for="(item, index) in chargitems" :key="index">
        <el-row>
          <el-col :span="8"><p>项目名: {{ item.name }}</p></el-col>
          <el-col :span="8"><p>数量: {{ item.total }} {{ item.total_unit }}</p></el-col>
          <el-col :span="8"><p>状态: {{ item.status | statusFilter }}</p></el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { diagnosisInfo } from '@/serve/api'
export default {
  data() {
    return {
      patientMsg: {},
      defaultMedical: {
        complaint: '',
        cur_history: '',   // 现病史
        past_history: '',        // 既往史
        person_history: '',  // 个人史
        allergy_history: '',   // 过敏史
        family_history: '',    // 家族史
        other_history: '',  // 其他
        other_phy_exam: '',    // 其他体格检查
        diagn_result: ''   // 本次诊断结果
      },
      medical: {},
      // 处方列表
      prescriptions: [],
      // 中药处方列表
      chinaPrescriptions: [],
      // 西药处方列表
      westPrescriptions: [],
      // 输液处方列表
      waterPrescriptions: [],
      // 收费项列表
      chargitems: [],
      materialList: [],  // 耗材
      treamentList: [],  // 诊疗项目
      otherList: []  // 其他收费项目列表
    }
  },
  methods: {
    goHistory() {  // 返回
      this.$router.push({ path: '/doctor-station/treatment-history' })
    },
    getDiagnosisInfo(id) {
      service(diagnosisInfo, {
        regist_id: id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.patientMsg = res.regist
          this.patientMsg.age = new Date().getFullYear() - (res.patient.birthdate.slice(0, 4))
          this.patientMsg.createtime = res.regist.createtime.split(' ')[0]
          this.medical = res.medical || this.defaultMedical
          this.prescriptions = res.prescriptions || []
          this.chargitems = res.chargitems || []
          this.medical.temperature = this.medical.temperature === 0 ? '' : this.medical.temperature
          this.medical.systolic_pressure = this.medical.systolic_pressure === 0 ? '' : this.medical.systolic_pressure
          this.medical.diastolic_pressure = this.medical.diastolic_pressure === 0 ? '' : this.medical.diastolic_pressure
          this.medical.pulse = this.medical.pulse === 0 ? '' : this.medical.pulse
          this.medical.breathing = this.medical.breathing === 0 ? '' : this.medical.breathing
          // 处方分类
          this.prescriptionsClassify()
          // 收费项分类
          this.chargeItemsClassify()
        }
      })
    },
     // 处方分类
    prescriptionsClassify() {
      this.chinaPrescriptions = this.prescriptions.filter(item => item.prescript_type === 2)
      this.westPrescriptions = this.prescriptions.filter(item => item.prescript_type === 1)
      this.waterPrescriptions = this.prescriptions.filter(item => item.prescript_type === 3)
    },
    // 收费项分类
    chargeItemsClassify() {
      this.treamentList = this.chargitems.filter(item => item.item_type === 3)
      this.materialList = this.chargitems.filter(item => item.item_type === 4)
      this.otherList = this.chargitems.filter(item => item.item_type === 6)
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  mounted() {
    this.getDiagnosisInfo(this.$route.query.patientId)
  },
  filters: {
    sourceTypeFilter(id) {  // 客户来源
      switch (id) {
        case 1:
          return '自然来源'
        case 2:
          return '熟人介绍'
        case 3:
          return '平台推广'
        default:
          return '未知'
      }
    },
    statusFilter(id) {
      switch (id) {
        case 0:
          return '已保存'
        case 1:
          return '已收费'
        case 2:
          return '已发药'
        case 3:
          return '已退药'
        case 4:
          return '已退费'
      }
    },
    typeFilter(id) {
      switch (id) {
        case 3:
          return '诊疗项目'
        case 4:
          return '耗材'
        case 6:
          return '其它'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-left: 50px;
  width: 1000px;
  .back {
    margin-top: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 6px;
  }
  .title {
    background: #eee;
    height: 40px;
    line-height: 40px;
    padding-left: 6px;
    color: #666;
  }
  p {
    color: #666;
    margin-left: 10px;
  }
}
.content {
  margin-left: 50px;
  width: 1000px;
  .title {
    background: #eee;
    height: 40px;
    line-height: 40px;
    padding-left: 6px;
    color: #666;
  }
  p {
    margin-left: 10px;
    color: #666;
  }
}
</style>

