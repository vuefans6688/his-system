<template>
  <div class="waiting-follow">
    <el-form class="search-form" :model="userData" size="small" label-width="100px">
      <el-form-item label="客户姓名:">
        <el-input v-model="userData.name" placeholder="请输入客户姓名" style="width: 240px;"></el-input>
      </el-form-item>
      <el-form-item label="随访日期:">
        <el-date-picker v-model="userData.planTime" unlink-panels type="daterange" :editable="false" 
          :clearable="false" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="计划执行人:" style="margin-left: 10px;">
        <el-select v-model="userData.planMan" clearable>
          <el-option v-for="(item, index) in planMan" :key="index" :label="item.truename" 
            :value="item.userid">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建人:" style="margin-left: -20px;">
        <el-select v-model="userData.founder" clearable>
          <el-option v-for="(item, index) in planMan" :key="index" :label="item.truename" 
            :value="item.userid">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="80"></el-table-column>
      <el-table-column prop="name" label="姓名" width="80" align="center"></el-table-column>
      <el-table-column prop="sex" label="性别" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.gender | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.birthdate | ageFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" align="center" width="110">
      </el-table-column>
      <el-table-column label="最近就诊科室" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.deptname | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="doctor" label="最近就诊医生" align="center" width="110"></el-table-column>
      <el-table-column prop="visittime" label="最近就诊日期" align="center" width="160"></el-table-column>
      <el-table-column prop="planTime" label="计划随访日期" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.plantime | planFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="plancontent" label="随访内容" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="planexecutor" label="计划执行人" width="100" align="center"></el-table-column>
      <el-table-column prop="createtime" label="创建日期" width="180" align="center"></el-table-column>
      <el-table-column prop="creator" label="创建人员" width="120" align="center"></el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="follow(scope.row.followupid)">随访</el-button>
          <el-button type="text" style="color: #f00;" @click="disable(scope.row.followupid)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="15" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <!-- 弹出框 -->
    <el-dialog title="取消随访原因" :visible.sync="dialogFormVisible" :before-close="handleClose" align="center">
      <el-form :model="disableform" :rules="rules" ref="disableform" size="small" label-width="60px">
        <el-form-item prop="content" label="原因:">
          <el-input v-model="disableform.content" placeholder="请输入取消的原因"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirm('disableform')">确定</el-button>
          <el-button @click="handleCancel('disableform')">取消</el-button>
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
      userData: {
        name: '',  // 客户姓名
        planTime: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date(new Date().setDate(new Date().getDate() + 21))], // 计划随访日期
        planMan: '',  // 计划执行人
        founder: ''  // 创建人
      },
      tableData: [],
      followupid: '',  // 用作删除的followid
      planMan: [],  // 计划随访人下拉框的options
      // 分页
      currentPage: 1,
      total: 0,
      pageindex: 0,
      // 取消对话框
      disableindex: '',  // 获取要删除的行数
      dialogFormVisible: false,
      disableform: {
        content: ''  // 输入的取消原因
      },
      rules: {
        content: [{ required: true, message: '请输入取消原因', trigger: 'blur, change' }]
      }
    }
  },
  methods: {
    follow(id) {
      this.$router.push({ name: 'Follow', query: { followid: id } })
    },
    modification(id) {
      this.$router.push({ name: 'ModificationFollow' })
      this.$store.commit('user/SET_PURCH_RECODE', { followid: id })
    },
    // 取消随访请求
    cancelFollow() {
      this.$http.post('/service/customers/followupupd', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          followupid: this.followupid,
          status: 3,  // 取消随访
          actualtype: 1,  // 随访类型 1满意度 2诊疗效果
          actualmode: 1,  // 随访方式 1电话随访 2微信随访 3面对面
          actualexecutorid: this.user.userid,  // 实际随访者 当为取消时为取消执行人
          actualcontent: this.disableform.content  // 随访内容，当为取消时填写取消原因
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '取消成功！',
            type: 'success'
          })
          this.followList()
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
          return false
        }
      }).catch()
    },
    // 取消随访
    handleConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.cancelFollow()
          this.dialogFormVisible = false
        } else {
          return false
        }
      })
    },
    handleCancel(formName) {
      this.dialogFormVisible = false
      this.$refs[formName].resetFields()
    },
    handleClose() {
      this.dialogFormVisible = false
      this.$refs.disableform.resetFields()
    },
    // 取消按钮
    disable(id) {
      this.followupid = id
      this.disableform.content = ''
      this.dialogFormVisible = true
    },
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.followList()
    },
    // 请求随访列表
    followList() {
      this.$http.post('/service/customers/followuplist', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          patientid: '',  // 患者id
          name: this.userData.name,   // patientid 和 name 优先patientid 二者可选
          executorid: this.userData.planMan,  // 可选 当status为1时为计划随访者id status为2,3时为执行随访者id
          creatorid: this.userData.founder,  // 可选 建立随访者id
          status: 1,  // 1待随访 2随访完成 3取消随访 必选
          type: -1,  // 随访类型 -1全部 1满意度 2诊疗效果 必选
          fromdate: this.userData.planTime[0].format('yyyy-MM-dd') + ' 00:00:00',  // 当status为1时为计划随访时间 2,3时为执行随访时间（或者取消随访时间） 必选
          todate: this.userData.planTime[1].format('yyyy-MM-dd') + ' 23:59:59',  // 必选
          pageindex: this.pageindex,
          pagesize: 15
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.tableData = res.data.data.entity
          this.total = res.data.data.totalcount
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
          if (res.data.data.items) {
            const arr = []
            res.data.data.items.forEach(val => {
              if (val.disabled === 0) {
                arr.push(val)
              }
            })
            const obj = arr.find(val => arr.userid === val.userid)
            if (!obj) {
              arr.push({
                userid: this.user.userid,
                truename: this.user.truename || this.user.phone
              })
            }
            this.planMan = arr
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
    }
  },
  created() {
    this.followList()
    this.getDoctor()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  filters: {
    planFilter(time) {
      const str = '' + time
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    },
    ageFilter(age) {
      if (!age) {
        return ''
      }
      return new Date().format('yyyy') - age.substr(0, 4)
    }
  },
  watch: {
    userData: {
      handler() {
        this.followList()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  display: flex;
  margin-top: 20px;
}
.el-table {
  width: 100%;
  margin-top: 20px;
  margin-left: 30px;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
