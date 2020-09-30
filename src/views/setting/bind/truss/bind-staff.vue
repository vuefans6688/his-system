<template>
  <div class="bind-staff">
    <div class="add">
      <el-button size="small" type="primary" @click="addMedicalStaff">新增医务人员</el-button>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column prop="bkc320" label="医务人员编码" align="center" width="120"></el-table-column>
      <el-table-column prop="aac003" label="姓名" align="center"></el-table-column>
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <span>{{ Number(scope.row.aac004) | sexFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" align="center"></el-table-column>
      <el-table-column prop="aac006" label="出生时间" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.aac006 | sheBaoDateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属科室" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.akf001 | departmentFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医护人员类别" align="center" width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.bka633 | doctorTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="aae005" label="联系电话" align="center" width="120"></el-table-column>
      <el-table-column prop="acc501" label="工号" align="center"></el-table-column>
      <el-table-column prop="aac007" label="参加工作日期" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.aac007 | sheBaoDateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="modify(scope.row)" type="text">修改</el-button>
          <el-button @click="reFiling(scope.row)" v-if="scope.row.bke155 === '3' || scope.row.bke155 === '4'" type="text" style="color: #42b983;">
            重新备案
          </el-button>
          <el-button @click="del(scope.row)" v-else type="text" style="color: #f00;">注销</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="staffStatus ? '新建医务人员' : '编辑医务人员'" align="center" :visible.sync="dialogVisible">
      <staff-form :rule-form="ruleForm" @closeWin="closeWin" ref="staffForm" :staff-status="staffStatus" @changeDoctor="closeWin" :section-list="sectionList"></staff-form>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/utils/request'
import { getDeptList, szdoctorListHis, changeDocotorSb, changeDocotorHis, doctorRegistSb } from '@/serve/api'
import { AKF001 } from '@/common/dictionary'
import { getCurrentMonthDays } from '@/utils/ageTransfer'
import deepClone from '@/utils/deepClone'
import connectionTest from '@/common/connection'
import StaffForm from './staff-form'
export default {
  components: { StaffForm },
  data() {
    return {
      dialogVisible: false,
      staffStatus: true,  // 新增或修改。新增为true，修改为false
      tableData: [],
      sectionList: [],
      ruleForm: {
        bka633: '1'
      }
    }
  },
  methods: {
    getDepartment() {  // 获取科室
      service(getDeptList, {
        disabled: 0,
        can_appoint: 1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res = res && res.length ? res : []
          const arr = []
          res.forEach(val => {
            if (val.szsbcode) {
              arr.push({
                key: val.szsbcode,
                value: val.szsbname
              })
            }
          })
          this.sectionList = arr
        }
      })
    },
    addMedicalStaff() {  // 新增
      this.staffStatus = true
      this.dialogVisible = true
    },
    modify(item) {  // 修改
      this.staffStatus = false
      this.dialogVisible = true
      this.ruleForm = deepClone(item)
    },
    closeWin(staffForm, flag) { // 关闭模态
      this.dialogVisible = false
      this.$refs.staffForm.resetForm()
      if (flag) {
        this.getDoctorList()
      }
    },
    del(item) {
      this.$confirm(`确定注销医务人员(${item.aac003}) ?<p>注销后如需再添加该医生时需重新登记 !</p>`, '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.delectDocotorSheBao(item)
      }).catch()
    },
    async delectDocotorSheBao(item) {  // 注销
      const flag = await connectionTest()
      if (flag === '1') {
        service(changeDocotorSb, {
          transBody: {
            listsize: 1,
            inputlist: [
              {
                bkc320: item.bkc320,
                bke155: '3'
              }
            ]
          }
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            this.delectDocotorHis(item, '3')
          }
        })
      }
    },
    delectDocotorHis(item, status) {
      service(changeDocotorHis, {
        doctorKey: item.doctorkey,
        bke155: status
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const title = status === '3' ? '注销医务人员成功' : '备案成功'
          this.$message({ message: title, type: 'success', showClose: true, duration: 1500 })
          this.getDoctorList()
        }
      })
    },
    getDoctorList() {  // 获取社保医生
      service(szdoctorListHis).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.tableData = res.record_arr ? res.record_arr : []
          this.tableData.forEach(val => {
            val.aac006 += ''
            val.aac007 += ''
            val.aae030 += ''
            // 计算年龄
            const curMonth = parseInt(val.aac006.slice(4, 6), 8)
            const curYear = parseInt(val.aac006.slice(0, 4), 8)
            const daysInMonth = getCurrentMonthDays(curMonth, curYear)
            let age = new Date().getFullYear() - (val.aac006.slice(0, 4))
            let month = new Date().getMonth() + 1 - (val.aac006.slice(4, 6))
            let day = new Date().getDate() - (val.aac006.slice(6, 8))
            if (day < 0) {
              day += daysInMonth
              month -= 1
            }
            if (month < 0) {
              month += 12
              age -= 1
            }
            val.age = age
          })
        }
      })
    },
    // 重新备案
    async reFiling(obj) {
      const doctor = deepClone(obj)
      const connectionStatus = await connectionTest()
      if (connectionStatus !== '1') {
        return
      }
      if (doctor.bka633 === '1') {   // 选择医师，则删除药师信息
        delete doctor.bkc332
        delete doctor.bkc333
        delete doctor.bkc334
        delete doctor.bkc335
      } else {
        delete doctor.bkc325
        delete doctor.ckc304
        delete doctor.akc055
        delete doctor.bcc950
        delete doctor.bcc955
        delete doctor.bka503
      }
      doctor.aac006 = Number(doctor.aac006)
      doctor.aac007 = Number(doctor.aac007)
      doctor.aae030 = Number(doctor.aae030)
      // 社保医生注册
      service(doctorRegistSb, {
        transBody: {
          listsize: 1,
          inputlist: [{ ...doctor }]
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.delectDocotorHis(obj, '1')
        }
      })
    }
  },
  created() {
    this.getDepartment()
    this.getDoctorList()
  },
  filters: {
    departmentFilter(value) {
      const obj = AKF001.find(item => item.key === value)
      return obj ? obj.value : '-'
    },
    doctorTypeFilter(doctor) {
      return doctor === '1' ? '医师' : '药师'
    },
    sheBaoDateFilter(date) {
      return `${date.slice(0, 4)}年${date.slice(4, 6)}月${date.slice(6, 8)}日`
    }
  }
}
</script>

<style lang="scss" scoped>
.bind-staff {
  margin-top: 20px;
  .el-table {
    margin-top: 20px;
    // width: 95%;
  }
}
</style>
