<template>
  <div class="follow">
    <div class="header">
      <el-button type="primary" size="small" @click="finishFollow">保存</el-button>
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
      <p>
        <span>创建时间: {{ client.createdTime }}</span>
        <span>创建人员: {{ client.founder }}</span>
        <span>计划执行人员: {{ client.planMan }}</span>
      </p>
      <p>
        <span>计划随访时间: {{ client.planTime | followFilter }}</span>
        <span>随访类型: {{ client.followclass | classFilter }}</span>
        <span>随访内容: {{ client.followcontent }}</span>
      </p>
      <h4 class="title">随访列表</h4>
      <div class="footer">
        <el-button type="primary" size="small" @click="addNewProject">新增随访计划</el-button>
      </div>
      <el-table :data="tableData" stripe>
        <el-table-column prop="followTime" label="随访时间" align="center" width="160"></el-table-column>
        <el-table-column label="随访人" prop="followMan" align="center"></el-table-column>
        <el-table-column label="随访类型" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.followclass" placeholder="请选择" size="small">
              <el-option v-for="item in followclass" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="随访方式" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.planWay" placeholder="请选择" size="small">
              <el-option v-for="item in planWay" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="随访结果" width="500" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.followContent" placeholder="请选择" size="small"></el-input>
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
        results: '',
        createdTime: '',  // 创建时间
        founder: '',  // 创建人
        planMan: '',  // 计划执行人
        followclass: '',  // 随访类型
        followcontent: '',  // 随访内容
        planTime: ''  // 计划随访时间
      },
      tableData: [
        {
          followTime: new Date().format('yyyy-MM-dd hh:mm:ss'),
          followMan: '',
          planWay: '',
          followContent: '',
          followclass: ''
        }
      ],
      planWay: [
        { value: 1, label: '微信随访' }, 
        { value: 2, label: '电话随访' }, 
        { value: 3, label: '面对面' }
      ],
      followclass: [
        { value: 1, label: '满意度随访' }, 
        { value: 2, label: '诊疗效果随访' }
      ],
      registId: ''
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    addNewProject() {
      this.$router.push({ name: 'NewFollowProject', query: { registid: this.registId } })
      this.$store.commit('user/SET_PURCH_RECODE', '')
      this.$store.commit('user/SET_PURCH_RECODE', {
        scopeRow: {
          patient_name: this.client.name,
          sex: this.client.sex,
          patient_phone: this.client.mobilephone,
          age: this.client.age,
          diagn_dept: this.client.department,
          diagn_doctor: this.client.doctor,
          diagn_result: this.client.results,
          create_time: this.client.createdTime
        }
      })
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
          followupid: this.$route.query.followid
        }
      }).then(res => {
        const data = res.data.data
        this.client.name = data.name
        this.client.sex = data.gender
        this.client.mobilephone = data.phone
        this.client.age = data.birthdate
        this.client.department = data.deptname
        this.client.doctor = data.doctor
        this.registid = data.registid
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
      }).catch()
    },
    // 完成随访
    finishFollow() {
      this.$http.post('/service/customers/followupupd', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          followupid: this.$route.query.followid,
          status: 2,  // 完成随访
          actualtype: this.tableData[0].followclass,  // 随访类型 1满意度 2诊疗效果
          actualmode: this.tableData[0].planWay,  // 随访方式 1电话随访 2微信随访 3面对面
          actualexecutorid: this.tableData[0].followMan,  // 实际随访者 当为取消时为取消执行人
          actualcontent: this.tableData[0].followContent  // 随访内容，当为取消时填写取消原因
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '随访成功！',
            type: 'success'
          })
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
        }
      }).catch()
    }
  },
  created() {
    this.followUpInfo()
    if (this.user.truename) {
      this.tableData[0].followMan = this.user.truename
    } else {
      this.tableData[0].followMan = this.user.phone
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'purchRecode'])
  },
  filters: {
    followFilter(time) {
      return time.substr(0, 10)
    },
    classFilter(classes) {
      switch (classes) {
        case 1:
          return '满意度随访'
        case 2:
          return '诊疗效果随访'
        case 3:
          return '面对面'
      }
    },
    ageFilter(age) {
      if (!age) {
        return ''
      }
      return new Date().format('yyyy') - age.substr(0, 4)
    }
  }
}
</script>

<style lang="scss" scoped>
.follow {
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
    p {
      display: flex;
      color: #666;
      span {
        flex: 1;
        margin-left: 10px;
      }
    }
  }
  .footer {
    margin-top: 20px;
  }
  .el-table {
    margin-top: 10px;
  }
}
</style>
