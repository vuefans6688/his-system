<template>
  <div class="bind-company">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="small">
      <el-form-item label="医疗机构编码:" prop="hospitalcode">
        <el-input v-model="ruleForm.hospitalcode"></el-input>
      </el-form-item>
      <el-form-item label="所在区域编码:" prop="areacode">
        <el-input v-model="ruleForm.areacode" placeholder="当前系统社保接入区域只支持深圳市: 440300"></el-input>
      </el-form-item>
      <el-form-item label="操作员账号:" prop="operatorcode">
        <el-input v-model="ruleForm.operatorcode" :maxlength="10"></el-input>
      </el-form-item>
      <el-form-item label="操作员姓名:" prop="operatorname">
        <el-input v-model="ruleForm.operatorname" :maxlength="10"></el-input>
      </el-form-item>
      <el-form-item label="智慧医保密钥:" prop="zhihuiybtoken">
        <el-input v-model="ruleForm.zhihuiybtoken"></el-input>
      </el-form-item>
      <el-form-item>
        <!-- 是否绑定社保 -->
        <el-button type="primary" size="small" @click="submitForm('ruleForm')">{{ isBind ? '绑定' : '修改' }}</el-button>
        <el-button type="primary" size="small" @click="cancelBindSheBao">解除社保绑定</el-button>
      </el-form-item>
    </el-form>
    <booking-query :booking-list="bookingList"></booking-query>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { bindSzsb, bookingStatus, clinicInfo } from '@/serve/api'  // his接口
import service from '@/utils/request'
import connectionTest from '@/common/connection'
import BookingQuery from './booking-query'
export default {
  components: { BookingQuery },
  data() {
    const operatorcodeValidate = (rule, value, callback) => {
      const valid = /^[a-zA-Z0-9]{3,}$/
      if (!valid.test(value)) {
        callback(new Error('账号需3位以上数字或字母'))
      } else {
        callback()
      }
    }
    const areacodeValidate = (rule, value, callback) => {
      if (value !== '440300') {
        callback(new Error('当前系统社保接入区域只支持深圳市: 440300'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        hospitalcode: '',
        areacode: '440300'
      },
      rules: {
        hospitalcode: [
          { required: true, message: '请输入医疗机构编码', trigger: 'change' }
        ],
        operatorcode: [
          { validator: operatorcodeValidate, trigger: 'blur' }
        ],
        areacode: [
          { validator: areacodeValidate, trigger: 'blur' }
        ],
        operatorname: [
          { required: true, message: '请输入操作员姓名', trigger: 'change' },
          { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        zhihuiybtoken: [
          { required: true, message: '请输入操作员姓名', trigger: 'change' }
        ]
      },
      bookingList: [],  // 预约状态
      isBind: true
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.bindSheBao()
        } else {
          this.$message({ message: '请按要求填写相关信息', type: 'warning', showClose: true, duration: 1500 })
          return false
        }
      })
    },
    cancelBindSheBao() {
      service(bindSzsb, {
        items: [
          {
            name: 'hospitalcode',
            newVal: ''
          }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          this.$message.success({
            message: '社保解绑成功!',
            duration: 1000,
            showClose: true
          })
          this.$store.commit('user/SET_SHE_BAO', '')
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    getClinicInfo() {
      service(clinicInfo).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          this.ruleForm = res.clinic
          if (res.clinic.hospitalcode) {
            this.isBind = false
            this.requestClient()  // 绑定则测试连接
          }
        }
      })
    },
    bindSheBao() {
      service(bindSzsb, {
        items: [
          {
            name: 'hospitalcode',
            newVal: this.ruleForm.hospitalcode
          },
          {
            name: 'areacode',
            newVal: this.ruleForm.areacode
          },
          {
            name: 'operatorcode',
            newVal: this.ruleForm.operatorcode
          },
          {
            name: 'operatorname',
            newVal: this.ruleForm.operatorname
          },
          {
            name: 'zhihuiybtoken',
            newVal: this.ruleForm.zhihuiybtoken
          }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          this.$message.success({
            message: '绑定社保信息成功!',
            duration: 1000,
            showClose: true
          })
          const obj = {
            cardArea: this.ruleForm.areacode,
            hospitalCode: this.ruleForm.hospitalcode,
            operatorCode: this.ruleForm.operatorcode,
            operatorName: this.ruleForm.operatorname,
            zhihuiybtoken: this.ruleForm.zhihuiybtoken
          }
          this.$store.commit('user/SET_SHE_BAO', obj)
          this.requestClient()   // 测试连接
        }
      })
    },
    async requestClient() {
      const flag = await connectionTest()
      if (flag === '1') {
        this.bookingStatus()  // 调用定点医药机构约定信息查询
      }
    },
    bookingStatus() {  // 定点医药机构约定信息查询
      service(bookingStatus).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          this.bookingList = res.transBody.outputlist ? res.transBody.outputlist : []
        }
      })
    }
  },
  created() {
    this.getClinicInfo()
  }
}
</script>

<style lang="scss" scoped></style>
