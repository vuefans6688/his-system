<template>
  <div class="save-record-plates">
    <h3 class="title">新增门诊病历模板</h3>
    <el-form :model="illness" ref="recordForm" :rules="rules" size="small" label-width="100px">
      <el-form-item label="模板名称:" prop="name">
        <el-input v-model="illness.name"></el-input>
      </el-form-item>
      <el-form-item label="模板类型:">
        <el-radio-group v-model="illness.owner_type">
          <el-radio :label="0">个人</el-radio>
          <el-radio :label="1">通用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主 诉:" prop="complaint">
        <el-input v-model="illness.complaint"></el-input>
      </el-form-item>
      <el-form-item label="现病史:">
        <el-input v-model="illness.cur_history"></el-input>
      </el-form-item>
      <el-form-item label="既往史:">
        <el-input v-model="illness.past_history"></el-input>
      </el-form-item>
      <el-form-item label="个人史:">
        <el-input v-model="illness.person_history"></el-input>
      </el-form-item>
      <el-form-item label="过敏史:">
        <el-input v-model="illness.allergy_history"></el-input>
      </el-form-item>
      <el-form-item label="家族史:">
        <el-input v-model="illness.family_history"></el-input>
      </el-form-item>
      <el-form-item label="其他:">
        <el-input v-model="illness.other_history"></el-input>
      </el-form-item>
      <el-form-item label="其他体格检查:">
        <el-input v-model="illness.other_phy_exam"></el-input>
      </el-form-item>
      <el-form-item label="本次诊断:" prop="diagn_result">
        <el-input v-model="illness.diagn_result"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('recordForm')">保存</el-button>
        <el-button @click="closeWin">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { createTemplate } from '@/serve/api'
import deepClone from '@/utils/deepClone'
export default {
  data() {
    return {
      templateConfig: {
        name: '',
        owner_type: 0
      },
      illness: {},
      rules: {  // 挂号验证
        name: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        complaint: [
          { required: true, message: ' ', trigger: 'blur' }
        ],
        diagn_result: [
          { required: true, message: ' ', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.templateConfig.name = this.illness.name
          this.templateConfig.owner_type = this.illness.owner_type
          delete this.illness.name
          delete this.illness.owner_type
          this.addIllTemplate()
        } else {
          this.$message({ message: '请正确填写信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    // 保存模板
    addIllTemplate() {
      service(createTemplate, {
        template_id: '',
        type: 1,
        name: this.templateConfig.name,
        owner_type: this.templateConfig.owner_type,
        data: this.illness
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$emit('closeWin')
          this.$message({ message: '保存模板成功', type: 'success', showClose: true, duration: 1000 })
        }
      })
    },
    closeWin() {
      this.$emit('closeWin')
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic'])
  },
  props: {
    recordForm: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  mounted() {
    this.illness = deepClone(this.recordForm)
    delete this.illness.breathing
    delete this.illness.diastolic_pressure
    delete this.illness.pulse
    delete this.illness.systolic_pressure
    delete this.illness.temperature
    this.$set(this.illness, 'name', '')
    this.$set(this.illness, 'owner_type', 0)
  }
}
</script>

<style lang="scss" scoped>
.title {
  text-align: center;
  margin-top: 20px;
  color: #666;
}
</style>
