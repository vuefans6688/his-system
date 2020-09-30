<template>
  <div class="registration-info">
    <!-- 挂号查询 -->
    <el-form :model="requestData" size="small" label-width="80px">
      <el-form-item prop="user" label="客户:">
        <el-input v-model="requestData.user" style="width: 260px;" placeholder="请输入客户姓名或电话"></el-input>
      </el-form-item>
      <el-form-item prop="date" label="登记日期:" style="margin-left: 20px;">
        <el-date-picker type="daterange" v-model="requestData.date" unlink-panels :editable="false" 
          :clearable="false" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item prop="section" label="就诊科室:" style="margin-left: 20px;">
        <el-select v-model="requestData.section" @change="changeDoctor">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.name" :value="item.dept_id" v-for="item in sections" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="doctor" label="医生:">
        <el-select v-model="requestData.doctor">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.truename" :value="item.userid" v-for="(item, index) in usefulDoctor" :key="index">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="registTable" stripe>
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" align="center"></el-table-column>
      <el-table-column label="性别" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.gender | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.phone | undefineFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="就诊类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.registtype | registTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="就诊科室" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.deptid | sectionFilter(sections) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="就诊医生" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.doctor | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="诊金" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.feename }}</span>
          <span>{{ scope.row.feeprice }}元</span>
        </template>
      </el-table-column>
      <el-table-column label="登记时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createtime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登记人" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.operator | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="就诊状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.registstatus | statusFilter(scope.row.createtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="scope">
          <el-button @click="returnNumber(registTable[scope.row.index].name, registTable[scope.row.index].registid)" 
            v-if="scope.row.registstatus === 1 && scope.row.feestatus === 0 && checkTime(scope.row.registstatus, scope.row.createtime)"
            type="text" style="color: #f00;">
            退号
          </el-button>
          <el-button @click="newFollowPlan(registTable[scope.row.index].registid)" type="text">
            新建随访计划
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination @current-change="handleCurrentChange" :current-page="pageindex" :page-size="15" layout="total, prev, pager, next, jumper" :total="totalCount"></el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { dateFilter } from '@/utils/filters'
import service from '@/utils/request'
import { cancelRegist, registList, getDeptList, getDocList } from '@/serve/api'
export default {
  data() {
    return {
      registTable: [],  // 挂号列表数据
      requestData: {
        date: [new Date(), new Date()],   // 日期
        section: '',  // 科室
        doctor: '',
        user: '',
        patientid: ''
      },
      sections: [],  // 就诊科室
      doctors: [],  // 就诊医生
      pageindex: 1,  // 当前页数
      totalCount: 0,  // 总条数
      interval: null  // 计时器
    }
  },
  methods: {
    checkTime(state, oldtime) {
      if (state !== 1 || oldtime.split(' ')[0] !== dateFilter(new Date(), 'yyyyMMdd')) {
        return false
      }
      return true
    },
    returnNumber(username, registid) {  // 退号
      this.$confirm(`是否对 <span style="color: #f00;font-size: 16px;">${username}</span> 进行退号?`, '退号', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        type: 'warning'
      }).then(() => {
        this.cancelPatient(registid)   // 确定则调用取消挂号
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消', showClose: true, duration: 1000 })
      })
    },
    handleCurrentChange(value) {  // 切换页数
      this.pageindex = value
      this.getPatientMessage()
    },
    cancelPatient(registid) {  // 取消挂号请求
      service(cancelRegist, {
        registid: registid,
        oldstatus: 1,
        newstatus: 4
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 直接返回data
          this.getPatientMessage()
          this.$message({ type: 'success', message: '退号成功!', showClose: true, duration: 1000 })
        }
      })
    },
    getPatientMessage() {   // 获取挂号列表
      service(registList, {
        registid: '',
        deptid: this.requestData.section,
        doctorid: this.requestData.doctor,    // 先传医生名字，暂没id
        patientid: this.requestData.patientid,
        name: this.requestData.user,
        fromdate: dateFilter(this.requestData.date[0]),
        todate: dateFilter(this.requestData.date[1]),
        pageindex: this.pageindex - 1,
        pagesize: 15
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.registTable = res.entity
          this.totalCount = +res.totalcount
        }
      })
    },
    getDepartment() {  // 获取科室
      service(getDeptList, {
        disabled: 0,
        can_appoint: 1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.sections = res
        }
      })
    },
    getDoctor() {  // 获取医生
      service(getDocList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (!res.items) {
            this.$message({ type: 'warning', message: '诊所医生为空', showClose: true, duration: 1000 })
            return
          }
          const arr = res.items.filter(val => val.disabled === 0)
          const obj = arr.find(val => val.userid === this.user.userid)
          if (!obj) {
            arr.push({
              userid: this.user.userid,
              truename: this.user.truename || this.user.phone,
              deptid: ''
            })
          }
          this.doctors = arr
        }
      })
    },
    newFollowPlan(id) {  // 新建随访计划
      this.$router.push({ name: 'NewFollowProject', query: { registid: id } })
    },
    changeDoctor() {  // 清空科室医生
      this.requestData.doctor = ''
    }
  },
  created() {
    this.getPatientMessage()
    this.getDepartment()  // 获取科室列表
    this.getDoctor()  // 获取医生
    this.interval = setInterval(this.getPatientMessage, 30000)
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic']),
    usefulDoctor() {
      return this.doctors.filter(item => item.deptid === this.requestData.section)
    }
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  filters: {
    statusFilter(status, date) {  // 就诊状态
      switch (status) {
        case 0:
          return '未知'
        case 1:
          if (date.split(' ')[0] !== dateFilter(new Date(), 'yyyyMMdd')) {  // 非当天则显示就诊完成
            return '已过期'
          } else {
            return '待接诊'
          }
        case 2:
          if (date.split(' ')[0] !== dateFilter(new Date(), 'yyyyMMdd')) {  // 非当天则显示就诊完成
            return '就诊完成'
          } else {
            return '诊断中'
          }
        case 3:
          return '就诊完成'
        case 4:
          return '已退号'
        case 5:
          return '已退费'
      }
    },
    registTypeFilter(type) {   // 挂号类别
      switch (type) {
        case 0:
          return '未知'
        case 1:
          return '初诊'
        case 2:
          return '复诊'
      }
    },
    sectionFilter(id, sections) {
      if (!sections) {
        return ''
      }
      const section = sections.find(section => section.dept_id === id)
      return section ? section.name : ''
    },
    doctorFilter(id, doctors) {
      if (!doctors) {
        return ''
      }
      const doctor = doctors.find(doctor => doctor.userid === id)
      return doctor ? doctor.truename : '-'
    }
  },
  watch: {
    requestData: {
      handler() {
        this.getPatientMessage()
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
}
.el-table {
  width: 96%;
  margin-left: 30px;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
