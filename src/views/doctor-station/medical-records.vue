<template>
  <div class="medical-records">
    <el-form :model="patientMsg.medicalRecordsForm" :rules="rules" ref="medicalRecordsForm" label-width="80px" size="small">
      <el-form-item align="right">
        <div class="item-wrap">
          <span class="el-icon-printer" @click="printRecord">打印病历</span>
          <span class="el-icon-circle-check" @click="savePlates">保存为模板</span>
          <span class="el-icon-document" @click="usePlates('病历')">调用模板</span>
        </div>
      </el-form-item>
      <el-form-item label="主 诉:" prop="complaint">
        <el-input v-model="patientMsg.medicalRecordsForm.complaint" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item label="现病史:" prop="cur_history">
        <el-input v-model="patientMsg.medicalRecordsForm.cur_history" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item label="症状:">
        <el-checkbox v-model="checkbox.allergy" @change="clearCheckbox('allergy')">过敏史</el-checkbox>
        <el-checkbox v-model="checkbox.past" @change="clearCheckbox('past')">既往史</el-checkbox>
        <el-checkbox v-model="checkbox.personal" @change="clearCheckbox('personal')">个人史</el-checkbox>
        <el-checkbox v-model="checkbox.family" @change="clearCheckbox('family')">家族史</el-checkbox>
        <el-checkbox v-model="checkbox.other" @change="clearCheckbox('other')">其他</el-checkbox>
      </el-form-item>
      <el-form-item label="过敏史:" prop="allergy_history" v-if="checkbox.allergy">
        <el-input v-model="patientMsg.medicalRecordsForm.allergy_history" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item label="既往史:" prop="past_history" v-if="checkbox.past">
        <el-input v-model="patientMsg.medicalRecordsForm.past_history" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item label="个人史:" prop="person_history" v-if="checkbox.personal">
        <el-input v-model="patientMsg.medicalRecordsForm.person_history" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item label="家族史:" prop="family_history" v-if="checkbox.family">
        <el-input v-model="patientMsg.medicalRecordsForm.family_history" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item label="其 他:" prop="other_history" v-if="checkbox.other">
        <el-input v-model="patientMsg.medicalRecordsForm.other_history" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <div class="person-life">
        <!-- 体温 -->
        <el-form-item prop="temperature" label="体温:">
          <el-input v-model="patientMsg.medicalRecordsForm.temperature" @keyup.native="numberInput('temperature')" 
            :maxlength="4" placeholder="35~42" style="width: 80px;">
          </el-input>
          <span class="temp">°C</span>
        </el-form-item>
        <!-- 血压 -->
        <el-form-item prop="systolic" label="血压:">
          <el-input v-model="patientMsg.medicalRecordsForm.systolic_pressure" placeholder="舒张压0~300"
            @keyup.native="numberInput('systolic_pressure')" style="width: 130px;">
          </el-input> /
          <el-input v-model="patientMsg.medicalRecordsForm.diastolic_pressure" placeholder="收缩压0~300"
            @keyup.native="numberInput('diastolic_pressure')" style="width: 130px;">
          </el-input>
          <span class="sys">mmHg</span>
        </el-form-item>
        <!-- 脉搏 -->
        <el-form-item prop="pulse" label="脉搏:">
          <el-input v-model="patientMsg.medicalRecordsForm.pulse" placeholder="50~300" 
            @keyup.native="numberInput('pulse')" :maxlength="3" style="width: 90px;">
          </el-input>
          <span class="pul">bpm</span>
        </el-form-item>
        <!-- 呼吸 -->
        <el-form-item prop="breathing" label="呼吸:">
          <el-input v-model="patientMsg.medicalRecordsForm.breathing" placeholder="0~50" 
            @keyup.native="numberInput('breathing')" style="width: 90px;">
          </el-input>
          <span class="brea">次/分</span>
        </el-form-item>
      </div>
      <el-form-item prop="mainphyexam" label="体格检查:">
        <el-input v-model="patientMsg.medicalRecordsForm.mainphyexam" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item prop="other_phy_exam" label="辅助检查:">
        <el-input v-model="patientMsg.medicalRecordsForm.other_phy_exam" type="textarea" :autosize="{maxRows: 3}"></el-input>
      </el-form-item>
      <el-form-item prop="jibingjson" label="初步诊断:">
        <el-select
          v-model="first_diagn_result"
          multiple filterable remote :trigger-on-focus="false" 
          placeholder="注：请选择符合国际疾病分类ICD-10的标准疾病名称，否则医保系统将无法识别" 
          :remote-method="remoteMethod" @change="handleSelectChange" style="width: 100%;">
          <el-option v-for="item in jibingSelectOptions" :key="item.maincode"
            :label="item.maincode + '-' + item.jbname" :value="item.maincode + '-' + item.jbname">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="advice" label="治疗意见:">
        <el-input v-model="patientMsg.medicalRecordsForm.advice" type="textarea" :autosize="{minRows:2, maxRows: 3}"></el-input>
      </el-form-item>
    </el-form>
    <div class="doctor-message">
      <span class="name">医生: {{ patientMsg.doctorTip.name }}</span>
      <el-button type="primary" @click="submitForm('medicalRecordsForm')" size="mini">保存</el-button>  
      <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
    </div>
    <el-dialog :visiblesync="savePlateWin">
      <save-record-plates :record-form="patientMsg.medicalRecordsForm" @closeWin="closeSavePlatesWin"></save-record-plates>
    </el-dialog>
    <!-- 调用模板 -->
    <el-dialog :visible.sync="usePlateWin">
      <use-plates :template-type="1" @callball="templateCallBack"></use-plates>
    </el-dialog>
  </div>
</template>

<script>
import { floatLimit } from '@/utils/inputLimit'
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
import service from '@/utils/request'
import { saveMedical, getjibing } from '@/serve/api'
import SaveRecordPlates from './save-record-plates'
import UsePlates from './use-plates'
export default {
  data() {
    const temperatureValidate = (rule, value, callback) => {
      const isValid = /^(3[5-9]{1}|4[0-1]{1})(\.\d{1})?$|^42$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合适数值'))
      } else {
        callback()
      }
    }
    const systolicValidate = (rule, value, callback) => {
      const num1 = this.patientMsg.medicalRecordsForm.systolic_pressure
      const num2 = this.patientMsg.medicalRecordsForm.diastolic_pressure
      const isValid1 = /^((?!0)\d{1,3}|300)$/
      const isValid2 = /^((?!0)\d{1,3}|300)$/
      if (num1 && !isValid1.test(num1)) {
        callback(new Error('请输入合适数值(1~300)'))
      } else if (num2 && !isValid2.test(num2)) {
        callback(new Error('请输入合适数值(1~300)'))
      } else {
        callback()
      }
    }
    // 脉搏
    const pulseValidate = (rule, value, callback) => {
      const isValid = /^(50|[5-9]\d{1}|1\d{2}|2\d{2})$|^300$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合适数值'))
      } else {
        callback()
      }
    }
    // 呼吸
    const breatheValidate = (rule, value, callback) => {
      if (value > 50) {
        callback(new Error('请输入合适数值'))
      } else {
        callback()
      }
    }
    const checkDiagnResult = (rule, value, callback) => {
      if (!this.first_diagn_result.length) {
        callback(new Error('本次诊断结果中至少选择一个疾病名称'))
      } else {
        callback()
      }
    }
    return {
      rules: {  // 挂号验证
        complaint: [
          { required: true, message: '请输入病人主诉', trigger: 'blur' },
          { min: 2, max: 500, message: '长度为2~500 ', trigger: 'blur' }
        ],
        jibingjson: [
          { validator: checkDiagnResult, trigger: 'blur' }
        ],
        temperature: [
          { validator: temperatureValidate, trigger: 'blur' }
        ],
        systolic: [
          { validator: systolicValidate, trigger: 'blur' }
        ],
        pulse: [
          { validator: pulseValidate, trigger: 'blur' }
        ],
        breathing: [
          { validator: breatheValidate, trigger: 'blur' }
        ],
        cur_history: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        mainphyexam: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        other_phy_exam: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        allergy_history: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        past_history: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        person_history: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        family_history: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        other_history: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ],
        advice: [
          { max: 500, message: '长度最多为500 ', trigger: 'blur' }
        ]
      },
      checkbox: {  // 个人史、过敏史等单选框
        past: false,
        personal: false,
        allergy: true,
        family: false,
        other: false
      },
      searchWindows: false,  // 常见疾病辅助窗口
      savePlateWin: false,  // 保存模板窗口
      usePlateWin: false,    // 调用模板窗口
      useMesTitle: {  // 调用模板抬头
        title: '',
        type: ''
      },
      jibingSelectOptions: [],
      first_diagn_result: [],
      printRecordObj: {},  // 保存打印对象
      templateList: [],  // 模板列表
      searchName: ''
    }
  },
  methods: {
    clearCheckbox(str) {  // 剔除不选的内容
      switch (str) {
        case 'past':
          this.patientMsg.medicalRecordsForm.past_history = ''
          break
        case 'personal':
          this.patientMsg.medicalRecordsForm.person_history = ''
          break
        case 'allergy':
          this.patientMsg.medicalRecordsForm.allergy_history = ''
          break
        case 'family':
          this.patientMsg.medicalRecordsForm.family_history = ''
          break
        case 'other':
          this.patientMsg.medicalRecordsForm.other_history = ''
          break
        default:
          break
      }
    },
    beforeSubmit() {  // 保存前处理
      this.printRecordObj = {
        clinic_id: this.clinic,
        regist_id: this.patientMsg.registid,
        medical_id: this.patientMsg.medicalRecordsForm.medical_id,
        complaint: this.patientMsg.medicalRecordsForm.complaint,
        past_history: this.patientMsg.medicalRecordsForm.past_history,
        cur_history: this.patientMsg.medicalRecordsForm.cur_history,
        person_history: this.patientMsg.medicalRecordsForm.person_history,
        family_history: this.patientMsg.medicalRecordsForm.family_history,
        allergy_history: this.patientMsg.medicalRecordsForm.allergy_history,
        other_history: this.patientMsg.medicalRecordsForm.other_history,
        temperature: +this.patientMsg.medicalRecordsForm.temperature,
        systolic_pressure: +this.patientMsg.medicalRecordsForm.systolic_pressure,
        diastolic_pressure: +this.patientMsg.medicalRecordsForm.diastolic_pressure,
        pulse: +this.patientMsg.medicalRecordsForm.pulse,
        breathing: +this.patientMsg.medicalRecordsForm.breathing,
        mainphyexam: this.patientMsg.medicalRecordsForm.mainphyexam,
        other_phy_exam: this.patientMsg.medicalRecordsForm.other_phy_exam,
        jibingjson: this.patientMsg.medicalRecordsForm.jibingjson,
        advice: this.patientMsg.medicalRecordsForm.advice,
        doctor: this.patientMsg.doctorTip.name
      }
    },
    submitForm(formName) {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          delete (this.printRecordObj.medical_id)
          this.beforeSubmit()
          this.saveMedical()   // 保存病历
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    fromChildTitle(data) {  // 辅助输入组件传值
      if (!this.patientMsg.registid) return
      if (this.patientMsg.medicalRecordsForm.diagn_result.includes(data)) {
        return
      }
      this.patientMsg.medicalRecordsForm.diagn_result += data + ' '
    },
    numberInput(str) { // 限制数字输入
      this.patientMsg.medicalRecordsForm[str] = floatLimit(this.patientMsg.medicalRecordsForm[str], 2)
    },
    savePlates() {  // 打开保存模板窗口
      this.savePlateWin = true
    },
    closeSavePlatesWin() {
      this.savePlateWin = false
    },
    usePlates(name) {  // 调用模板窗口
      this.useMesTitle.title = name
      this.usePlateWin = true
    },
    printRecord() {  // 打印病历
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const printMsg = deepClone(this.patientMsg)
      if (!printMsg.medicalRecordsForm.medical_id) {
        this.$message({ message: '请先保存病历', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.$store.commit('user/SET_PRINT_MESSAGE', printMsg)
      this.$nextTick(() => {
        window.open('/print/illness-print')
      })
    },
    saveMedical() {  // 保存病历
      service(saveMedical, this.printRecordObj).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$set(this.patientMsg.medicalRecordsForm, 'medical_id', res.medical_id)
          this.$message({ message: '病历保存成功', type: 'success', showClose: true, duration: 1000 })
        }
      })
    },
    // 调用模板的回调
    templateCallBack(data) {
      const illness = data.data
      this.patientMsg.medicalRecordsForm.complaint = illness.complaint
      this.patientMsg.medicalRecordsForm.cur_history = illness.cur_history
      this.patientMsg.medicalRecordsForm.past_history = illness.past_history
      this.patientMsg.medicalRecordsForm.person_history = illness.person_history
      this.patientMsg.medicalRecordsForm.allergy_history = illness.allergy_history
      this.patientMsg.medicalRecordsForm.family_history = illness.family_history
      this.patientMsg.medicalRecordsForm.other_history = illness.other_history
      this.patientMsg.medicalRecordsForm.mainphyexam = illness.mainphyexam
      this.patientMsg.medicalRecordsForm.other_phy_exam = illness.other_phy_exam
      this.patientMsg.medicalRecordsForm.advice = illness.advice
      this.patientMsg.medicalRecordsForm.jibingjson = illness.jibingjson
      this.patientMsg.medicalRecordsForm.jibingstring = illness.jibingstring
      if (illness.past_history) {
        this.checkbox.past = true
      }
      if (illness.person_history) {
        this.checkbox.personal = true
      }
      if (illness.allergy_history) {
        this.checkbox.allergy = true
      }
      if (illness.family_history) {
        this.checkbox.family = true
      }
      if (illness.other_history) {
        this.checkbox.other = true
      }
    },
    remoteMethod(query) {
      this.jibingSelectOptions = []
      if (query !== '') {
        service(getjibing, {
          txtname: query
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            // 成功的回调，直接返回data
            if (!res) {  // 联想无则返回空
              this.jibingSelectOptions = []
            } else {
              this.jibingSelectOptions = res.data
            }
          } else {  // 代码错误需要进行的操作
            this.jibingSelectOptions = []
          }
        })
      } else {
        this.jibingSelectOptions = []
      }
    },
    handleSelectChange(value) {
      this.patientMsg.medicalRecordsForm.jibingjson = value.map(v => {
        const tempArr = v.split('-')
        return {
          maincode: tempArr[0],
          jbname: tempArr[1]
        }
      })
      this.patientMsg.medicalRecordsForm.jibingstring = value
      this.patientMsg.medicalRecordsForm.diagn_result = (jibingjson => 
        jibingjson.map(val => val.jbname).toString()
      )(this.patientMsg.medicalRecordsForm.jibingjson)
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  components: { SaveRecordPlates, UsePlates },
  props: {
    patientMsg: {
      type: Object
    }
  },
  watch: {
    patientMsg: {
      handler() {
        if (this.patientMsg.medicalRecordsForm2) {
          this.patientMsg.medicalRecordsForm = this.patientMsg.medicalRecordsForm2
          // 既往史
          if (this.patientMsg.medicalRecordsForm.past_history) {
            this.checkbox.past = true
          } else {
            this.checkbox.past = false
          }
          // 个人史
          if (this.patientMsg.medicalRecordsForm.person_history) {
            this.checkbox.personal = true
          } else {
            this.checkbox.personal = false
          }
          // 家族史
          if (this.patientMsg.medicalRecordsForm.family_history) {
            this.checkbox.family = true
          } else {
            this.checkbox.family = false
          }
          // 其他
          if (this.patientMsg.medicalRecordsForm.other_history) {
            this.checkbox.other = true
          } else {
            this.checkbox.other = false
          }
        }
        if (this.patientMsg.medicalRecordsForm.jibingstring && this.patientMsg.medicalRecordsForm.jibingstring.length) {
          this.first_diagn_result = this.patientMsg.medicalRecordsForm.jibingstring
        } else {
          this.first_diagn_result = []
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.item-wrap {
  cursor: pointer;
  span {
    padding: 6px;
    color: #666;
  }
  span:hover {
    color: #09f;
  }
}
.person-life {
  display: flex;
}
.doctor-message {
  text-align: right;
  margin-right: 5px;
  .info {
    color: #666;
  }
  .name {
    margin-right: 20px;
    color: #09f;
  }
}
</style>
