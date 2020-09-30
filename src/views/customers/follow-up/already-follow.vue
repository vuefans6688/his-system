<template>
  <div class="already-follow">
    <el-form :model="userData" size="small" label-width="80px">
      <el-form-item label="客户姓名:">
        <el-input v-model="userData.name" placeholder="请输入客户姓名" style="width: 280px;"></el-input>
      </el-form-item>
      <el-form-item label="随访日期:" style="margin-left: 10px;">
        <el-date-picker v-model="userData.planTime" type="daterange" unlink-panels :editable="false" 
          :clearable="false" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="执行人:">
        <el-select v-model="userData.planMan" clearable>
          <el-option v-for="(item, index) in planMan" :key="index" :label="item.truename" 
            :value="item.userid">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建人:">
        <el-select v-model="userData.founder" size="small" clearable>
          <el-option v-for="(item, index) in planMan" :key="index" :label="item.truename" 
            :value="item.userid">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
      <el-table-column prop="name" label="姓名" align="center" width="90"></el-table-column>
      <el-table-column prop="sex" label="性别" align="center" width="70">
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
      <el-table-column prop="visittime" label="最近就诊日期" align="center" width="180"></el-table-column>
      <el-table-column prop="actualtime" label="随访日期" align="center" width="180"></el-table-column>
      <el-table-column prop="actualcontent" label="随访结果" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="actualexecutor" label="执行人" align="center" width="90"></el-table-column>
      <el-table-column prop="createtime" label="创建日期" align="center" width="180"></el-table-column>
      <el-table-column prop="creator" label="创建人员" align="center" width="100"></el-table-column>
      <el-table-column label="操作" align="center" width="130">
        <template slot-scope="scope">
          <el-button type="text" @click="handleCheckFollow(scope.row.followupid)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="15" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      userData: {
        name: '',  // 客户姓名
        planTime: [new Date(), new Date()],  // 计划随访日期
        planMan: '',  // 计划执行人
        founder: ''  // 创建人
      },
      tableData: [],
      planMan: [],  // 计划执行人的options
      user2: {
        userid: '',
        username: ''
      },
      // 分页
      currentPage: 1,
      total: 0,
      pageindex: 0
    }
  },
  methods: {
    handleCheckFollow(id) {
      this.$router.push({ name: 'CheckFollow' })
      this.$store.commit('user/SET_PURCH_RECODE', { followid: id })
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
            const obj = arr.find(val =>  arr.userid === val.userid)
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
    },
    // 请求随访列表
    followlist() {
      this.$http.post('/service/customers/followuplist', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinicid: this.clinic,
          patientid: '',  // 患者id
          name: this.userData.name,   // patientid和name为优先patientid。二者可选
          executorid: this.userData.planMan,  // 可选 当status为1时为计划随访者id。status为2、3时为执行随访者id
          creatorid: this.userData.founder,  // 可选 建立随访者id
          status: 2,  // 1待随访 2随访完成 3取消随访 必选
          type: -1,  // 随访类型 -1全部 1满意度 2诊疗效果 必选
          fromdate: this.userData.planTime[0].format('yyyy-MM-dd') + ' 00:00:00',  // 当status为1时为计划随访时间。status为2、3时为执行随访时间（或者取消随访时间） 必选
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
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.followlist()
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'purchRecode']),
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
    this.followlist()
  },
  watch: {
    userData: {
      handler() {
        this.followlist()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  display: flex;
  margin-top: 20px;
  margin-left: 20px;
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
