<template>
  <div class="patient-message">
    <!-- 基本信息 -->
    <div class="base-info">
      <h4 class="title">客户信息</h4>
      <el-row>
        <el-col :span="6">
          <p>姓名: {{ patientMsg.details.name }}</p>
          <p>性别: {{ patientMsg.details.gender | sexFilter }}</p>
        </el-col>
        <el-col :span="6">
          <p>年龄: {{ patientMsg.details.age }}({{ patientMsg.details.birthdate }})</p>
          <p>客户类型: 自费</p>
        </el-col>
        <el-col :span="6">
          <p>客户来源: {{ patientMsg.details.sourcetype }}</p>
          <p>就诊次数: {{ patientMsg.details.visitcount }}</p>
        </el-col>
        <el-col :span="6">
          <p>最近就诊时间: {{ patientMsg.details.recenttime }}</p>
          <p>就诊类型: 
            <el-radio-group v-model="patientMsg.details.registtype" @change="clinicTypeChange">
              <el-radio :label="1">初诊</el-radio>
              <el-radio :label="2">复诊</el-radio>
            </el-radio-group>
          </p>
          <p>
            <el-button type="primary" size="small" @click="checkMessage(patientMsg.patientid)">详细信息</el-button>
            <el-button type="warning" size="small" @click="endDiagnosis(patientMsg.registid)">结束就诊</el-button>
          </p>
        </el-col>
      </el-row>
    </div>
    <!-- 正文 -->
    <div class="content">
      <el-tabs type="border-card" v-model="patientTab">
        <el-tab-pane label="病历" name="1">
          <medical-records :patient-msg="patientMsg"></medical-records>
        </el-tab-pane>
        <el-tab-pane label="处方" name="2">
          <prescription :patient-msg="patientMsg"></prescription>
        </el-tab-pane>
        <el-tab-pane label="诊疗项目" name="3">
          <check title="诊疗" :patient-msg="patientMsg" :pay-list="zhenliaoList" :check-item="patientMsg.checkItem" :check-id="3" :item-type-num="5"></check>
        </el-tab-pane>
        <el-tab-pane label="耗材" name="4">
          <check title="耗材" :patient-msg="patientMsg" :pay-list="haocaiList" :check-item="patientMsg.comsumables" :check-id="4" :item-type-num="6"></check>
        </el-tab-pane>
        <el-tab-pane label="其他" name="5">
          <check title="其他" :patient-msg="patientMsg" :pay-list="qitaList" :check-item="patientMsg.other" :check-id="6" :item-type-num="7"></check>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { modifyReferral, acceptPatients, getChargitemList, lastDiagnosis } from '@/serve/api'
import service from '@/utils/request'
import MedicalRecords from './medical-records'  // 病历组件
import Prescription from './prescription'  // 处方组件
import Check from './check'  // 诊疗项目耗材其它组件
import UsePlates from './use-plates'
export default {
  data() {
    return {
      registtype: 0,
      patientTab: '1',
      zhenliaoList: [],
      haocaiList: [],
      qitaList: []
    }
  },
  props: {
    patientMsg: {
      type: Object
    }
  },
  components: { MedicalRecords, Prescription, UsePlates, Check },
  methods: {
    initType(type) {
      this.registtype = type
    },
    checkMessage(patientid) {  // 查看详细信息
      if (!this.patientMsg.registid) {
        return
      }
      this.$store.commit('user/SET_CUSTOMER_ID', patientid)
      this.$router.push({ path: `/doctor-station/patient-visitor/${patientid}` })
    },
    getPayList() {  // 获取收费项目
      service(getChargitemList, {
        disabled: 0,
        can_appoint: 1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (!res && !res.length) {
            return
          }
          res.forEach(val => {
            if (val.disabled === 0) {
              switch (val.type) {
                case 3:
                  this.zhenliaoList.push(val)
                  break
                case 4:
                  this.haocaiList.push(val)
                  break
                case 6:
                  this.qitaList.push(val)
                  break
              }
            }
          })
        }
      })
    },
    getHistory() {  // 获取最近就诊记录
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      service(lastDiagnosis, {
        patient_id: this.patientMsg.patientid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          console.log(res)
        }
      })
    },
    clinicTypeChange() {  // 修改就诊类型
      if (!this.patientMsg.registid) {
        return
      }
      service(modifyReferral, {
        regist_id: this.patientMsg.details.registid,
        regist_type: this.patientMsg.details.registtype
      })
    },
    endDiagnosis() {  // 结束就诊
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.$confirm('结束就诊将无法再次修改病历、处方及其他信息，请确保所填信息已保存，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        service(acceptPatients, {
          registid: this.patientMsg.registid,
          oldstatus: 2,
          newstatus: 3
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            this.$emit('endDiagnosis', true)
            this.$message({ message: '已结束就诊', type: 'success', showClose: true, duration: 1000 })
            this.$router.go(0)
          }
        })
      }).catch()
    }
  },
  watch: {
    $nextTick() {
      this.$forceUpdate()
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  created() {
    this.getPayList()
  }
}
</script>

<style lang="scss" scoped>
.patient-message {
  margin-left: 30px;
  .base-info {
    width: 1000px;
    border-bottom: 1px solid #ddd;
    .title {
      height: 40px;
      line-height: 40px;
      padding-left: 8px;
      background: #eee;
      color: #666;
    }
    .el-row {
      .el-col {
        p {
          color: #666;
          margin-left: 10px;
        }
      }
    }
  }
  .content {
    min-height: 650px;
    .el-tabs {
      width: 1000px;
      margin-top: 20px;
    }
  }
}
</style>

