<template>
  <div class="doctor-statistics">
    <!-- 挂号查询 -->
    <el-form :model="searchDate" size="small" label-width="80px">
      <el-form-item label="日期:">
        <el-date-picker v-model="searchDate.dateVal" unlink-panels :editable="false" 
          :clearable="false" type="daterange" :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="科室:">
        <el-select v-model="searchDate.dept_id" @change="clearDoctor">
          <el-option label="全部" value=""></el-option>
          <el-option :label="item.name" :value="item.dept_id" v-for="item in sections" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="医生:">
        <el-select v-model="searchDate.doctor_id">
          <el-option label="全部" value="" @click.native="selectDoctor"></el-option>
          <el-option :label="item.truename" :value="item.userid" v-for="(item, index) in usefulDoctor" :key='index' @click.native="selectDoctor(item.truename)"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="wordTable" ref="multipleTable" stripe>
      <el-table-column label="序号" align="center">
        <template slot-scope="props">
          <span>{{ props.row.index }}</span>
        </template>
      </el-table-column>
      <el-table-column label="科室" align="center" prop="dept_name">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.dept_name | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医生" align="center" prop="doctor_name">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.doctor_name | undefineFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接诊量" align="center" prop="quantity">
          <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.sum_diagn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="挂号费" align="center">
          <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.sum_regist | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处方金额" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.sum_prescript | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="诊疗项目金额" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.sum_exam | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="耗材金额" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.sum_material | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其他金额" align="center">
        <template slot-scope="props">
          <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.sum_others | priceFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handleCurrentChange" :current-page="pageindex" :page-size="15" 
      layout="total, prev, pager, next, jumper" :total="totalCount">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      wordTable: [],  // 接诊日志数据
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一月',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 30))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三月',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 91))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近半年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 183))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 364))
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      searchDate: {
        dateVal: [new Date(new Date() - (1000 * 60 * 60 * 24 * 30)), new Date()],   // 日期
        dept_id: '',  // 科室
        doctor_id: '',
        doctor_name: '',
        registtype: ''  // 就诊状态
      },
      sections: [],       // 就诊科室
      doctors: [],         // 就诊医生
      pageindex: 1,  // 当前页数
      totalCount: 0  // 总页数
    }
  },
  methods: {
    handleCurrentChange(val) {  // 切换页数
      this.pageindex = val
      this.getDoctorWordsList()
    },
    clearDoctor() {
      this.searchDate.doctor_id = ''
      this.searchDate.doctor_name = ''
    },
    selectDoctor(str) {
      this.searchDate.doctor_name = str
    },
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2) + ':' + str.substr(10, 2)
    },
    getDepartmentId() {  // 获取科室
      this.$http.post('/service/clinic/dept_list', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''                   // 留空
        },
        body: {
          clinic_id: this.clinic,
          disabled: 0,
          can_appoint: 1
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.sections = res.data.data
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    getDoctor() {  // 获取医生
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
          const obj = arr.find(val => val.userid === this.user.userid)
          if (!obj) {
            arr.push({
              userid: this.user.userid,
              truename: this.user.truename || this.user.phone,
              deptid: ''
            })
          }
          this.doctors = arr
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    },
    getDoctorWordsList() {
      this.$http.post('/service/stats/doctor_workloads', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          dept_id: this.searchDate.dept_id,
          doctor_id: this.searchDate.doctor_id,
          doctor_name: this.searchDate.doctor_name,
          date_from: this.searchDate.dateVal[0].format('yyMMdd'),
          date_to: this.searchDate.dateVal[1].format('yyMMdd'),
          page_index: this.pageindex - 1,
          page_size: 15
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data.clinic_id === this.clinic) {
          this.wordTable = res.data.items || []
          const obj = res.data
          obj.index = '合计'
          obj.dept_name = '所有科室'
          obj.doctor_name = '所有医生'
          this.wordTable.forEach((val, index) => val.index = index + 1)
          this.wordTable.unshift(obj)
          this.totalCount = res.data.total
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      }).catch()
    }
  },
  mounted() {
    this.getDepartmentId()   // 获取科室列表
    this.getDoctor()    // 获取医生列表
    this.getDoctorWordsList()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic']),
    usefulDoctor() {
      return this.doctors.filter(item => item.deptid === this.searchDate.dept_id)
    }
  },
  watch: {
    searchDate: {
      handler() {
        this.getDoctorWordsList()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.doctor-statistics {
  margin-top: 20px;
  .el-form {
    display: flex;
  }
  .el-table {
    margin-top: 20px;
    margin-left: 30px;
    width: 95%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
