<template>
  <div class="doctor-advice">
    <div class="header">
      <span class="el-icon-printer" @click="printRecord">打印病历</span>
      <span class="el-icon-circle-check" @click="saveAsTemplate">保存为模板</span>
      <span class="el-icon-document" @click="usePlates('常用医嘱')">常用医嘱</span>
    </div>
    <el-form :model="patientMsg" :rules="adviceRules" ref="adviceForm" size="small" label-width="80px">
      <el-form-item prop="advice">
        <el-input type="textarea" placeholder="请输入内容" v-model="patientMsg.advice" :autosize="{minRows: 4, maxRows: 16}"></el-input>
      </el-form-item>
      <el-form-item>
        <span class="name">医生: {{ patientMsg.doctorTip.name }}</span>
        <el-button type="primary" @click="submitForm('adviceForm')">保存</el-button>
        <p class="tip" v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
      </el-form-item>
    </el-form>
    <!-- 调用模板 -->
    <el-dialog :visible.sync="usePlateWin">
      <use-plates :template-type="8" @callball="templateCallBack"></use-plates>
    </el-dialog>
    <!-- 保存为模板窗 -->
    <el-dialog title="保存常用医嘱" align="center" :visible.sync="savePlateWin">
      <el-form :model="templateType" ref="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="模板名称:" prop="name">
          <el-input v-model="templateType.name"></el-input>
        </el-form-item>
        <el-form-item label="模板类型:">
          <el-radio-group v-model="templateType.owner_type">
            <el-radio :label="0">个人</el-radio>
            <el-radio :label="1">通用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save('form')">保存</el-button>
          <el-button @click="cancelSaveTemplate">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import deepClone from '@/utils/deepClone'
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { createTemplate, saveAdvice } from '@/serve/api'
import UsePlates from './use-plates'
export default {
  data() {
    return {
      usePlateWin: false,
      savePlateWin: false,
      advice: {
        content: '',
        doctor: ''
      },
      adviceRules: {
        advice: [
          { required: true, message: '请填写医嘱', trigger: 'change' },
          { min: 3, message: '医嘱内容不可少于3个字', trigger: 'change' }
        ]
      },
      rules: {
        name: [
          { required: true, message: ' ', trigger: 'blur' }
        ]
      },
      // 保存为模板
      templateType: {
        name: '',
        owner_type: 0
      }
    }
  },
  props: {
    patientMsg: {
      type: Object
    }
  },
  components: { UsePlates },
  methods: {
    submitForm(formName) {   // 提交医嘱
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.patientMsg.medicalRecordsForm.medical_id) {
            this.saveAdvice()
          } else {
            this.$message({ message: '请先保存病历', type: 'warning', showClose: true, duration: 1000 })
          }
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    saveAdvice() {  // 保存医嘱
      service(saveAdvice, {
        regist_id: this.patientMsg.registid,
        medical_id: this.patientMsg.medicalRecordsForm.medical_id,
        advice: this.patientMsg.advice,
        doctor: this.patientMsg.doctorTip.name
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '保存成功', type: 'success', showClose: true, duration: 1000 })
        }
      })
    },
    printRecord() {  // 打印病历
      const printMessage = deepClone(this.patientMsg)
      if (!printMessage.medicalRecordsForm.medical_id) {
        this.$message({ message: '请先保存病历', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.$store.commit('user/SET_PRINT_MESSAGE', printMessage)
      this.$nextTick(() => {
        window.open('/print/illness-print')
      })
    },
    usePlates() {  // 调用模板
      this.usePlateWin = true
    },
    templateCallBack(data) {  // 调用模板的回调
      this.patientMsg.advice = data.data.advice
    },
    cancelSaveTemplate() {  //  取消保存模板
      this.savePlateWin = false
    },
    saveAsTemplate() {   // 打开保存模板模态
      this.savePlateWin = true
    },
    save(ruleForm) { // 检验（是否保存）
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          this.saveAsTemplateRequest()
        } else {
          return false
        }
      })
    },
    saveAsTemplateRequest() {  // 保存模板请求
      service(createTemplate, {
        name: this.templateType.name,
        owner_type: this.templateType.owner_type,
        template_id: '',
        type: 8,
        data: {
          advice: this.patientMsg.advice
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '保存成功', type: 'success', showClose: true, duration: 1000 })
          this.cancelSaveTemplate()
        }
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  }
}
</script>

<style lang="scss" scoped>
.header {
  text-align: right;
  cursor: pointer;
  span {
    padding: 6px;
    color: #666;
  }
  span:hover {
    color: #09f;
  }
}
</style>
