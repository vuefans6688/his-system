<template>
  <div class="new-follow-project">
    <div class="header">
      <el-button type="primary" size="small" @click="followUpAdd">保存</el-button>
      <el-button type="warning" size="small" @click="goBack">返回</el-button>
    </div>
    <div class="content">
      <h4 class="title">随访客户</h4>
      <p>
        <span>客户姓名: {{ client.name }}</span>
        <span>性别: {{ client.sex | sexFilter }}</span>
        <span>手机号: {{ client.mobilephone }}</span>
        <span>年龄: {{ client.age | ageFilter }}</span>
      </p>
      <h4 class="title">就诊信息</h4>
      <p>
        <span>最近就诊科室: {{ client.department }}</span>
        <span>最近就诊医生: {{ client.doctor }}</span>
        <span>最近就诊时间: {{ client.time }}</span>
        <span>诊断结果: {{ client.results }}</span>
      </p>
      <h4 class="title">随访计划</h4>
      <el-table :data="tableData" stripe>
        <el-table-column label="计划随访时间" align="center">
          <template slot-scope="scope">
            <el-date-picker v-model="scope.row.planTime" placeholder="请选择" size="small" style="width: 160px;"></el-date-picker>
          </template>
        </el-table-column>
        <el-table-column label="计划随访人" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.planMan" placeholder="请选择" size="small">
              <el-option v-for="item in planMan" :key="item.userid" :label="item.truename" :value="item.userid"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="随访类型" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.followClass" placeholder="请选择" size="small">
              <el-option v-for="item in followClass" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="计划随访方式" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.planWay" placeholder="请选择" size="small">
              <el-option v-for="item in planWay" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="随访内容" width="500" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.followContent" placeholder="请输入随访内容" size="small"></el-input>
          </template>
        </el-table-column>
      </el-table>
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
        mobilephone: '',
        age: '',
        department: '',
        doctor: '',
        time: '',
        results: ''
      },
      tableData: [
        {
          planTime: new Date(),  // 随访时间
          planMan: '',  // 随访人
          followClass: '',  // 随访类型
          planWay: '',  // 随访方式
          followContent: ''  // 随访内容
        }
      ],
      planMan: [],
      followClass: [
        { value: 1, label: '满意度随访' }, 
        { value: 2, label: '诊疗效果随访' }
      ],
      planWay: [
        { value: 1, label: '微信随访' }, 
        { value: 2, label: '电话随访' }, 
        { value: 3, label: '面对面' }
      ]
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    // 获取医生
    getDoctor() {
      this.$http.post('/service/clinic/user_list', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: { 
          clinic_id: this.clinic 
        }
      }).then(res => {
        if (res.data.errcode === 0 && res.data.data.clinic_id === this.clinic) {
          const arr = []
          if (res.data.data.items) {
            res.data.data.items.forEach(val => {
              if (val.disabled === 0) {
                arr.push(val)
              }
            })
            this.planMan = arr
            const arr2 = this.planMan.find(val => this.planMan.userid === val.userid)
            if (!arr2) {
              this.planMan.push({
                userid: this.user.userid,
                truename: this.user.truename || this.user.phone
              })
            }
            this.tableData.forEach(val => val.planMan = this.user.userid)
          }
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
        }
      }).catch()
    },
    // 获取客户信息
    getDiagnosisInfo(id) {
      this.$http.post('/service/diagnosis/info', {
        head: {
          accessToken: this.token,  // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''  // 留空
        },
        body: {
          clinic_id: this.clinic,
          regist_id: id
        }
      }).then(res => {
        const resdata = res.data
        if (resdata.errcode === 0) {
          this.client.name = resdata.data.patient.name
          this.client.sex = resdata.data.patient.gender
          this.client.mobilephone = resdata.data.patient.phone
          this.client.age = resdata.data.patient.birthdate
          this.client.department = resdata.data.regist.deptname
          this.client.doctor = resdata.data.regist.doctor
          this.client.time = resdata.data.regist.createtime
          if (resdata.data.medical) {
            this.client.results = resdata.data.medical.diagn_result
          }
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
        }
      }).catch()
    },
    // 添加随访
    followUpAdd() {
      this.$http.post('/service/customers/followupadd', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          registid: this.$route.query.registid,  // 挂号id
          plantype: this.tableData[0].followClass,  // 随访类型 1满意度 2诊疗效果
          planmode: this.tableData[0].planWay,  // 随访方式 1电话随访 2微信随访 3面对面
          plantime: this.tableData[0].planTime.format('yyyy-MM-dd') + ' 00:00:00',  // 随访时间
          planexecutorid: this.tableData[0].planMan,  // 计划随访者id
          plancontent: this.tableData[0].followContent  // 计划随访内容
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'success',
            message: '保存成功！'
          })
          this.goBack()
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: '保存失败！'
          })
        }
      }).catch()
    },
    // 获取每行列表信息
    getRowInfo() {
      if (this.$route.query.registid) {
        this.getDiagnosisInfo(this.$route.query.registid)
      }
      if (this.purchRecode.scopeRow) {
        this.client.name = this.purchRecode.scopeRow.patient_name
        if (this.purchRecode.scopeRow.sex) {
          this.client.sex = this.purchRecode.scopeRow.sex
        }
        if (this.purchRecode.scopeRow.age) {
          this.client.age = this.purchRecode.scopeRow.age
        }
        this.client.mobilephone = this.purchRecode.scopeRow.patient_phone
        this.client.department = this.purchRecode.scopeRow.diagn_dept
        this.client.doctor = this.purchRecode.scopeRow.diagn_doctor
        this.client.time = this.purchRecode.scopeRow.create_time
        this.client.results = this.purchRecode.scopeRow.diagn_result
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'purchRecode'])
  },
  filters: {
    ageFilter(age) {
      if (!age) {
        return ''
      }
      return new Date().format('yyyy') - age.substr(0, 4)
    }
  },
  created() {
    this.getDoctor()  
    this.getRowInfo()
  },
  beforeDestroy() {
    this.$store.commit('user/SET_PURCH_RECODE', '')
  }
}
</script>

<style lang="scss" scoped>
.new-follow-project {
  margin-top: 20px;
  margin-left: 30px;
  width: 92%;
  .header {
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
  }
  .content {
    .title {
      height: 40px;
      line-height: 40px;
      padding-left: 6px;
      color: #666;
      background: #eee;
    }
    p {
      display: flex;
      color: #666;
      span {
        flex: 1;
        margin-left: 10px;
      }
    }
  }
}
</style>
