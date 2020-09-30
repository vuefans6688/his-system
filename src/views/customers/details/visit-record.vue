<template>
  <div class="visit-record">
    <div class="list-left">
      <div class="pages">
        <el-button type="primary" size="small" @click="prevPage" :disabled="prevPageDisable">上一页</el-button>
        <el-button type="primary" size="small" @click="nextPage" :disabled="nextPageDisable">下一页</el-button>
      </div>
      <div class="item" v-for="(item, index) in visitList" :key="index" :class="{active: regist_id === item.regist_id}" @click="switchRecord(item.regist_id)">
        <h3 class="date">{{ item.create_time | dateFilter }}</h3>
        <p class="type">
          <span v-show="item.diagn_type !== 0">({{ item.diagn_type | diagnTypeFilter }})</span>
          <span v-show="item.diagn_dept">{{ item.diagn_dept }} | </span>
          <span v-show="item.diagn_doctor">{{ item.diagn_doctor }}</span>
        </p>
      </div>
    </div>
    <div class="detail-right">
      <h2 class="title">门诊病历</h2>
      <div class="content">
        <div class="detail">
          <p class="label">主诉: </p>
          <p class="value">{{ medical.complaint }}</p>
        </div>
        <div class="detail">
          <p class="label">现病史: </p>
          <p class="value">{{ medical.cur_history }}</p>
        </div>
        <div class="detail">
          <p class="label">既往史: </p>
          <p class="value">{{ medical.past_history }}</p>
        </div>
        <div class="detail">
          <p class="label">个人史: </p>
          <p class="value">{{ medical.person_history }}</p>
        </div>
        <div class="detail">
          <p class="label">过敏史: </p>
          <p class="value">{{ medical.allergy_history }}</p>
        </div>
        <div class="detail">
          <p class="label">家族史: </p>
          <p class="value">{{ medical.family_history }}</p>
        </div>
        <div class="detail">
          <p class="label">其他: </p>
          <p class="value">{{ medical.other_history }}</p>
        </div>
        <div class="detail">
          <p class="label">生命体征: </p>
          <p class="value">
            <span v-if="medical.temperature !== 0">体温: {{ medical.temperature }}°C </span>
            <span v-if="medical.systolic_pressure !== 0">血压: {{ medical.systolic_pressure }}/{{ medical.diastolic_pressure }}mmHg </span>
            <span v-if="medical.pulse !== 0">脉搏: {{ medical.pulse }}bpm </span>
            <span v-if="medical.breathing !== 0">呼吸: {{ medical.breathing }}次/分</span>
          </p>
        </div>
        <div class="detail">
          <p class="label">体格检查: </p>
          <p class="value">{{ medical.mainphyexam }}</p>
        </div>
        <div class="detail">
          <p class="label">辅助检查: </p>
          <p class="value">{{ medical.other_phy_exam }}</p>
        </div>
        <div class="detail">
          <p class="label">初步诊断: </p>
          <p class="value">
            <span v-for="(item, index) in medical.jibingjson" :key="index">{{ item.jbname }}</span>
          </p>
        </div>
        <div class="detail">
          <p class="label">治疗意见: </p>
          <p class="value">{{ medical.advice }}</p>
        </div>
        <div class="detail">
          <p class="label">处方: </p>
          <p class="value">
            <el-tooltip placement="top" effect="light">
              <div class="wrapper" slot="content">
                <div v-for="(item, index) in westPrescriptions" :key="index" v-show="westPrescriptions.length" style="color: #09f;">
                  <h3>西药处方{{ index + 1 }}</h3>
                  <div v-for="(drug, index2) in item.drug_list" :key="index2">
                    <p>药名: {{ drug.name }}</p>
                    <p>厂商: {{ drug.producer }}</p>
                    <p>规格: {{ drug.spec_text }}</p>
                    <p>用法: {{ drug.use_method }}</p>
                    <p>单次剂量: {{ drug.dosage }} {{ drug.dose_unit }}</p>
                    <p>频次: {{ drug.frequency }}</p>
                    <p>开药数量: {{ drug.total }} {{ drug.total_unit }}</p>
                  </div>
                </div>
                <div v-for="(item, index) in chinaPrescriptions" :key="index" v-show="chinaPrescriptions.length" style="color: #09f;">
                  <h3>中药处方{{ index + 1 }}</h3>
                  <div v-for="(drug, index2) in item.drug_list" :key="index2">
                    <p>药名: {{ drug.name }}</p>
                    <p>厂商: {{ drug.producer }}</p>
                    <p>规格: {{ drug.spec_text }}</p>
                    <p>用法: {{ drug.use_method }}</p>
                    <p>单次剂量: {{ drug.dosage }}{{ drug.dose_unit }}</p>
                    <p>频次: {{ drug.frequency }}</p>
                    <p>开药数量: {{ drug.total }}{{ drug.total_unit }}</p>
                  </div>
                </div>
                <div v-for="(item, index) in waterPrescriptions" :key="index" v-show="waterPrescriptions.length" style="color: #09f;">
                  <h3>输液处方{{ index + 1 }}</h3>
                  <div v-for="(drug, index2) in item.drug_list" :key="index2">
                    <p>药名: {{ drug.name }}</p>
                    <p>厂商: {{ drug.producer }}</p>
                    <p>规格: {{ drug.spec_text }}</p>
                    <p>用法: {{ drug.use_method }}</p>
                    <p>单次剂量: {{ drug.dosage }} {{ drug.dose_unit }}</p>
                    <p>频次: {{ drug.frequency }}</p>
                    <p>开药数量: {{ drug.total }} {{ drug.total_unit }}</p>
                  </div>
                </div>
              </div>
              <div class="tooltip-detail">
                <span v-show="westPrescriptions.length">西药处方 * {{ westPrescriptions.length }}</span>
                <span v-show="chinaPrescriptions.length">中药处方 * {{ chinaPrescriptions.length }}</span>
                <span v-show="waterPrescriptions.length">输液处方 * {{ waterPrescriptions.length }}</span>
              </div>
            </el-tooltip>
          </p>
        </div>
        <div class="detail">
          <p class="label">诊疗项目: </p>
          <p class="value">
            <el-tooltip placement="top" effect="light">
              <div class="charge-item" slot="content">
                <span v-for="(item, index) in treamentList" :key="index">{{ item.name }} * {{ item.total }}</span>
              </div>
              <div class="tooltip-detail">
                <span v-for="(item, index) in treamentList" :key="index">{{ item.name }} * {{ item.total }}</span>
              </div>
            </el-tooltip>
          </p>
        </div>
        <div class="detail">
          <p class="label">耗材: </p>
          <p class="value">
            <el-tooltip placement="top" effect="light">
              <div class="charge-item" slot="content">
                <span v-for="(item, index) in materialList" :key="index">{{ item.name }} * {{ item.total }}</span>
              </div>
              <div class="tooltip-detail">
                <span v-for="(item, index) in materialList" :key="index">{{ item.name }} * {{ item.total }}</span>
              </div>
            </el-tooltip>
          </p>
        </div>
        <div class="detail">
          <p class="label">其他: </p>
          <p class="value">
            <el-tooltip placement="top" effect="light">
              <div class="charge-item" slot="content">
                <span v-for="(item, index) in otherList" :key="index">{{ item.name }} * {{ item.total }}</span>
              </div>
              <div class="tooltip-detail">
                <span v-for="(item, index) in otherList" :key="index">{{ item.name }} * {{ item.total }}</span>
              </div>
            </el-tooltip>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { diagnosisList, diagnosisInfo } from '@/serve/api'
import service from '@/utils/request'
export default {
  props: {
    customerId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeName: '1',
      visitList: [],
      medical: {},  // 当前记录的病历
      condition: {  // 搜索条件
        date_from: new Date(2000, 1, 1).format('yyMMdd'),
        date_to: new Date().format('yyMMdd'),
        patient_id: this.customerId,
        page_index: 0,
        page_size: 5
      },
      total: 0,
      // 当前展示项的挂号id
      regist_id: '',
      // 默认的病历(若病历为空)
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
    // 切换就诊记录
    switchRecord(id) {
      this.regist_id = id
      this.getDiagnosisInfo()
    },
    // 下一页
    nextPage() {
      this.condition.page_index += 1
      this.getRecoedsList()
    },
    // 上一页
    prevPage() {
      this.condition.page_index -= 1
      this.getRecoedsList()
    },
    // 获取接诊记录列表
    getRecoedsList() {
      service(diagnosisList, {
        ...this.condition
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.visitList = res.items || []
          this.total = res.total
          if (this.visitList.length) {
            // 按日期排序
            this.visitList.sort((obj1, obj2) => obj1.create_time < obj2.create_time)
            this.regist_id = this.visitList[0].regist_id
            // 获取详情
            this.getDiagnosisInfo()
          } else {
            this.medical = this.defaultMedical
          }
        }
      })
    },
    // 获取当次接诊详情
    getDiagnosisInfo() {
      service(diagnosisInfo, {
        regist_id: this.regist_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.medical = res.medical || this.defaultMedical
          this.prescriptions = res.prescriptions || []
          this.chargitems = res.chargitems || []
          // 处方分类
          this.prescriptionsClassify()
          // 收费项分类
          this.chargitemsClassify()
        }
      })
    },
    // 处方分类
    prescriptionsClassify() {
      this.westPrescriptions = this.prescriptions.filter(item => item.prescript_type === 1)
      this.chinaPrescriptions = this.prescriptions.filter(item => item.prescript_type === 2)
      this.waterPrescriptions = this.prescriptions.filter(item => item.prescript_type === 3)
    },
    // 收费项分类
    chargitemsClassify() {
      this.treamentList = this.chargitems.filter(item => item.item_type === 3)
      this.materialList = this.chargitems.filter(item=> item.item_type === 4)
      this.otherList = this.chargitems.filter(item => item.item_type === 6)
    }
  },
  mounted() {
    this.current_visit = this.visitList[0]
  },
  computed: {
    ...mapGetters(['token', 'clinic']),
    nextPageDisable() {
      return this.condition.page_index >= Math.ceil(this.total / this.condition.page_size) - 1
    },
    prevPageDisable() {
      return this.condition.page_index === 0
    }
  },
  filters: {
    dateFilter(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2)
    },
    // 就诊类型
    diagnTypeFilter(type) {
      if (type === 1) {
        return '初诊'
      } else if (type === 2) {
        return '复诊'
      }
    }
  },
  created() {
    this.getRecoedsList()
  }
}
</script>

<style lang="scss" scoped>
.visit-record {
  display: flex;
  .list-left {
    margin-top: 20px;
    margin-left: 50px;
    .item {
      margin-top: 20px;
      background: #eee;
      width: 220px;
      text-align: center;
      border: 1px solid #ccc;
      box-sizing: border-box;
      &.active {
        border: 1px solid #56bc94;
        background: #f6f6f6;
      }
      .date, .type {
        color: #666;
      }
    }
  }
  .detail-right {
    margin-left: 50px;
    margin-top: 20px;
    width: 1000px;
    border: 1px solid #ccc;
    .content {
      padding: 10px;
      .detail {
        display: flex;
        align-items: center;
        height: 30px;
        line-height: 30px;
        &:nth-of-type(2n) {
          background: #f1f1f1;
        }
        .label {
          margin-left: 10px;
        }
        .value {
          margin-left: 15px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .tooltip-detail {
            display: flex;
          }
        }
      }
    }
    .title {
      text-align: center;
      color: #666;
    }
  }
}
</style>

