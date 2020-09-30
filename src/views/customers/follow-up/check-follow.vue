<template>
  <div class="check-follow">
    <div class="header">
      <el-button type="primary" size="small" @click="goBack">返回</el-button>
    </div>
    <div class="content">
      <h4 class="title">随访客户</h4>
      <el-row>
        <el-col :span="12">
          <p>客户姓名: {{ client.name }}</p>
          <p>性别: {{ client.sex | sexFilter }}</p>
        </el-col>
        <el-col :span="12">
          <p>手机号: {{ client.mobilephone }}</p>
          <p>年龄: {{ client.age | ageFilter }}</p>
        </el-col>
      </el-row>
      <h4 class="title">就诊信息</h4>
      <el-row>
        <el-col :span="12">
          <p>最近就诊科室: {{ client.department }}</p>
          <p>最近就诊医生: {{ client.doctor }}</p>
        </el-col>
        <el-col :span="12">
          <p>最近就诊时间: {{ client.time }}</p>
          <p>诊断结果: {{ client.results }}</p>
        </el-col>
      </el-row>
      <h4 class="title">随访计划</h4>
      <el-row>
        <el-col :span="8">
          <p>创建时间: {{ client.createdTime }}</p>
          <p>创建人员: {{ client.founder }}</p>
        </el-col>
        <el-col :span="8">
          <p>计划执行人员: {{ client.planMan }}</p>
          <p>计划随访时间: {{ client.planTime | planFilter }}</p>
        </el-col>
        <el-col :span="8">
          <p>随访类型: {{ client.followclass | classFilter }}</p>
          <p>随访内容: {{ client.followcontent }}</p>
        </el-col>
      </el-row>
      <h4 class="title">随访结果</h4>
      <el-row>
        <el-col :span="8">
          <p>随访时间: {{ client.followTime }}</p>
        </el-col>
        <el-col :span="8">
          <p>执行人员: {{ client.followMen }}</p>
        </el-col>
        <el-col :span="8">
          <p>随访结果: {{ client.followResults }}</p>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      client: {
        name: '',
        sex: '',
        mobilephone: '',  // 手机
        age: '',  // 年龄
        department: '',  // 科室
        doctor: '',  // 诊断医生
        time: '',  // 诊断时间
        results: '',  // 诊断结果
        createdTime: '',  // 创建时间
        founder: '',  // 创建人
        planMan: '',  // 计划执行人
        followclass: '',  // 随访类型
        followcontent: '',  // 随访内容
        planTime: '',  // 计划随访时间
        followTime: '',  // 随访时间2
        followMen: '',  // 执行人2
        followResults: ''  // 随访结果2
      }
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    // 请求随访信息
    followUpInfo() {
      this.$http.post('/service/customers/followupinfo', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          followupid: this.purchRecode.followid
        }
      }).then(res => {
        const data = res.data.data
        this.client.name = data.name
        this.client.sex = data.gender
        this.client.mobilephone = data.phone
        this.client.age = data.birthdate
        this.client.department = data.deptname
        this.client.doctor = data.doctor
        if (data.medical) {
          this.client.results = data.medical.diagn_result
        }
        this.client.createdTime = data.createtime
        this.client.founder = data.creator
        this.client.planMan = data.planexecutor
        this.client.followclass = data.planmode
        this.client.followcontent = data.plancontent
        this.client.planTime = data.plantime
        this.client.time = data.visittime
        this.client.followTime = data.actualtime
        this.client.followMen = data.actualexecutor
        this.client.followResults = data.actualcontent
      }).catch()
    }
  },
  created() {
    this.followUpInfo()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'purchRecode'])
  },
  filters: {
    planFilter(time) {
      return time.substr(0, 10)
    },
    classFilter(classes) {
      return classes === 1 ? '满意度随访' : classes === 2 ? '诊疗效果随访' : ''
    },
    ageFilter(age) {
      if (!age) {
        return ''
      }
      return new Date().format('yyyy') - age.substr(0, 4)
    }
  },
  beforeDestroy() {
    this.$store.commit('user/SET_PURCH_RECODE', '')
  }
}
</script>

<style lang="scss" scoped>
.check-follow {
  margin-left: 30px;
  margin-top: 20px;
  width: 92%;
  .header {
    border-bottom: 1px solid #ccc;
    padding-bottom: 8px;
  }
  .content {
    .title {
      height: 40px;
      line-height: 40px;
      background: #eee;
      color: #666;
      padding-left: 8px;
    }
    .el-row {
      .el-col {
        p {
          margin-left: 10px;
          color: #666;
        }
      }
    }
  }
}
</style>
