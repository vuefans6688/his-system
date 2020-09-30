<template>
  <div class="modification-follow">
    <div class="header">
      <el-button type="primary" size="small">保存</el-button>
      <el-button type="warning" @click="goBack" size="small">返回</el-button>
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
      <h4 class="title">随访列表</h4>
      <el-table :data="tableData" stripe>
        <el-table-column label="计划随访时间" align="center">
          <template slot-scope="scope">
            <el-date-picker v-model="scope.row.planTime" placeholder="请选择" size="small" style="width: 120px;"></el-date-picker>
          </template>
        </el-table-column>
        <el-table-column label="计划随访人" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.planMan" placeholder="请选择" size="small">
              <el-option :label="user2.username" :value="user2.userid"></el-option>
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
            <el-input v-model="scope.row.followContent" placeholder="请选择" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="disable(scope.$index)" type="warning" size="small">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹出框 -->
    <el-dialog title="取消随访原因" :visible.sync="dialogFormVisible" :before-close="handleClose" align="center">
      <el-form :model="disableForm" :rules="rules" ref="disableForm" size="small" label-width="60px">
        <el-form-item prop="content" label="原因:">
          <el-input v-model="disableForm.content" placeholder="请输入取消的原因"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="confirmForm('disableForm')">确定</el-button>
          <el-button @click="cancelForm('disableForm')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      client: {
        name: '',  // 客户姓名
        sex: '',  // 性别
        mobilephone: '',  // 手机号
        age: '',  // 年龄
        department: '',  // 最近就诊科室
        doctor: '',  // 最近就诊医生
        time: '',  // 最近就诊时间
        results: ''  // 诊断结果
      },
      tableData: [
        {
          planTime: new Date(),
          planMan: '',
          followClass: '',
          planWay: '',
          followContent: ''
        }
      ],
      planMan: [],  // 计划随访人
      user2: {
        userid: '',
        username: ''
      },
      followClass: [
        { value: 1, label: '满意度随访' }, 
        { value: 2, label: '诊疗效果随访' }
      ],
      planWay: [
        { value: 1, label: '微信随访' }, 
        { value: 2, label: '电话随访' }, 
        { value: 3, label: '面对面' }
      ],
      // 取消对话框
      disableindex: '',  // 获取要删除的行数
      dialogFormVisible: false,
      disableForm: {
        content: ''
      },
      rules: {
        content: [
          { required: true, message: '请输入取消原因', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    cancelForm(formName) {
      this.dialogFormVisible = false
      this.$refs[formName].resetFields()
    },
    handleClose() {
      this.dialogFormVisible = false
      this.$refs.disableForm.resetFields()
    },
    confirmForm(formName) {
      this.dialogFormVisible = false
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '取消成功！',
            type: 'success'
          })
          this.tableData.splice(this.disableindex, 1)
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '请填写取消的原因',
            type: 'error'
          })
          return false
        }
      })
    },
    disable(index) {
      this.disableForm.content = ''
      this.disableindex = index
      this.dialogFormVisible = true
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
          res.data.data.items.forEach(val => {
            if (val.disabled === 0) {
              arr.push(val)
            }
          })
          this.planMan = arr
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
        this.client.time = data.visittime
      }).catch()
    }
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
    this.user2.userid = this.user.userid
    this.user2.username = this.user.truename
    this.getDoctor()
    this.followUpInfo()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'purchRecode'])
  },
  beforeDestroy() {
    this.$store.commit('user/SET_PURCH_RECODE', '')
  }
}
</script>

<style lang="scss" scoped>
.modification-follow {
  margin-left: 30px;
  margin-top: 20px;
  width: 94%;
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
  .el-table {
    margin-top: 20px;
  }
}
</style>
