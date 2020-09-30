<template>
  <div class="new-medical-records">
    <div class="header">
      <h3 class="title">{{ title }}</h3>
      <div class="action">
        <el-button type="primary" @click="submitForm('form')" size="small">保存</el-button>
        <el-button type="warning" @click="cancel" size="small">取消</el-button>
      </div>
    </div>
    <el-form :model="form" :rules="rules" label-width="90px" ref="form" size="small">
      <el-form-item label="模板名称:" prop="name">
        <el-input v-model="form.name" :maxlength="64"></el-input>
      </el-form-item>
      <el-form-item label="模板类型:">
        <el-radio-group v-model="owner_type_str">
        <el-radio label="个人"></el-radio>
        <el-radio label="通用"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主 诉:" prop="complaint">
        <el-input v-model="form.complaint" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="现病史:">
        <el-input type="textarea" v-model="form.cur_history" :autosize="{ minRows: 1, maxRows: 4}">
        </el-input>
      </el-form-item>
      <el-form-item label="过敏史:">
        <el-input v-model="form.allergy_history" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="既往史:">
        <el-input v-model="form.past_history" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="个人史:">
        <el-input v-model="form.person_history" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="家族史:">
        <el-input v-model="form.family_history" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="其他:">
        <el-input v-model="form.other_history" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="体格检查:" prop="mainphyexam">
        <el-input v-model="form.mainphyexam" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="辅助检查:" prop="other_phy_exam">
        <el-input v-model="form.other_phy_exam" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
      <el-form-item label="初步诊断:" prop="jibingjson">
        <el-select v-model="first_diagn_result" multiple filterable remote  :trigger-on-focus="false"  
          placeholder="注：请选择符合国际疾病分类ICD-10的标准疾病名称，否则医保系统将无法识别" 
          style="width: 100%;" :remote-method="remoteMethod" @change="handleSelectChange">
          <el-option v-for="item in jibingSelectOptions" :key="item.maincode" :label="item.jbname"
            :value="item.maincode + '-' + item.jbname">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="治疗意见:" prop="advice">
        <el-input v-model="form.advice" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
import service from '@/utils/request'
import { getjibing } from '@/serve/api'
export default {
  data() {
    const checkDiagnResult = (rule, value, callback) => {
      if (!this.first_diagn_result.length) {
        callback(new Error('本次诊断结果中至少选择一个疾病名称'))
      } else {
        callback()
      }
    }
    return {
      rules: {  // 病历验证
        name: [
          { required: true, message: '请输入模板名称', trigger: 'change' }
        ],
        complaint: [
          { required: true, message: '请输入病人主诉', trigger: 'blur' },
          { min: 2, max: 500, message: '长度为2~500 ', trigger: 'blur' }
        ],
        jibingjson: [
          { validator: checkDiagnResult, trigger: 'change' }
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
      // 表单数据
      owner_type_str: '个人',
      form: {
        clinic_id: '',
        template_id: '',
        name: '',  // 模板名字
        type: 1,  // 类型为病历模板
        owner_type_str: '',  // 模板类型
        owner_type: 0,  // 类型整数，默认个人
        complaint: '',  // 主诉
        cur_history: '', // 现病史
        past_history: '',   // 既往史
        person_history: '',  // 个人史
        allergy_history: '',   // 过敏史
        family_history: '',    // 家族史
        other_history: '',   // 其他
        jibingjson: []   // 初步诊断
      },
      title: '新增门诊病历模板',
      isNew: true,
      searchName: '',
      jibingSelectOptions: [],
      first_diagn_result: []
    }
  },
  methods: {
    cancel() {
      this.$confirm('是否取消保存?', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.$router.back()
      }).catch()
    },
    validateAllInputs() {
      if (!this.form.name) {
        return '请输入模板名称'
      }
      if (this.form.name.length > 64) {
        return '模板名称长度不能超64个字符'
      }
      if (!this.form.complaint) {
        return '请输入主诉'
      }
      if (this.form.complaint.length > 256) {
        return '主诉长度不能超256个字符'
      }
      if (!this.form.diagn_result) {
        return '请输入诊断结果'
      }
      if (this.form.diagn_result.length > 256) {
        return '诊断结果长度不能超256个字符'
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.owner_type_str === '通用') {
            this.form.owner_type = 1
          } else {
            this.form.owner_type = 0
          }
          const url = this.isNew ? '/service/template/create' : '/service/template/modify'
          const templateId = this.isNew ? '' : this.form.template_id
          this.$http.post(url, {
            head: {
              accessToken: this.token,
              lastnotice: 0,
              msgid: ''
            },
            body: { 
              clinic_id: this.clinic,
              template_id: templateId,
              type: 1,
              name: this.form.name,
              owner_type: this.form.owner_type,
              data: this.form
            }
          }).then(response => {
            const res = response.data
            if (res.errcode === 0 && res.data && res.data.clinic_id === this.clinic) {
              this.$message({ message: '保存成功!', type: 'success', showClose: true, duration: 1000 })
              this.$router.back()
            } else if (res.errcode !== 0) {
              this.$message({ message: res.errmsg, type: 'error', showClose: true, duration: 1000 })
            }
          }).catch()
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    save() {
      this.form.clinic_id = this.clinic
      if (this.owner_type_str === '通用') {
        this.form.owner_type = 1
      } else {
        this.form.owner_type = 0
      }
      const url = this.isNew ? '/service/template/create' : '/service/template/modify'
      const templateId = this.isNew ? '' : this.form.template_id
      this.$http.post(url, {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: { 
          clinic_id: this.clinic,
          template_id: templateId,
          type: 1,
          name: this.form.name,
          owner_type: this.form.owner_type,
          data: this.form
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data && res.data.clinic_id === this.clinic) {
          this.$message({ message: '保存成功!', type: 'success', showClose: true, duration: 1000 })
          this.$router.back()
        } else if (res.errcode !== 0) {
          this.$message({ message: res.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
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
          } else {  // code错误需要进行的操作
            this.jibingSelectOptions = []
          }
        })
      } else {
        this.jibingSelectOptions = []
      }
    },
    handleSelectChange(value) {
      this.form.jibingjson = value.map(v => {
        const tempArr = v.split('-')
        return {
          maincode: tempArr[0],
          jbname: tempArr[1]
        }
      })
      this.form.jibingjson = value
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  mounted() {
    const data = this.$route.params.data
    if (!data) {
      this.title = '新增门诊病历模板'
      this.isNew = true
      this.form.owner_type = 0
      this.form.owner_type_str = '个人'
    } else {
      this.title = '修改门诊病历模板'
      this.isNew = false
      if (data.data) {
        this.form = deepClone(data.data)
      }
      this.owner_type_str = (data.owner_type === 0 || data.owner_type === '个人模板') ? '个人' : '通用'
      this.form.template_id = data.template_id
      this.form.name = data.name
      if (!data.data.jibingjson && this.form.jibingjson.length) {
        data.data.jibingjson = data.data.jibingjson.map(v => (v.maincode + '-' + v.jbname))
      }
      this.first_diagn_result = data.data.jibingjson
    }
  }
}
</script>

<style lang="scss" scoped>
.new-medical-records {
  margin-top: 20px;
  margin-left: 30px;
  .header {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    .title {
      color: #42b983;
    }
    .action {
      margin-right: 50px;
    }
  }
  .el-form {
    width: 90%;
    margin-top: 20px;
  }
}
</style>
