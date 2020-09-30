<template>
  <div class="check">
    <div class="header">
      <span class="el-icon-printer" @click="print" v-if="checkId === 3">打印{{ title }}项目</span>
      <span class="el-icon-circle-check" @click="saveAsTemplate">保存为模板</span>
      <span class="el-icon-document" @click="usePlates(title)">调用模板</span>
    </div>
    <el-form :model="checkItem" ref="checkItem" size="small">
      <el-form-item>
        <el-row class="check-item">
          <el-col :span="2">序号</el-col>
          <el-col :span="6">{{ title }}项目</el-col>
          <el-col :span="4">数量</el-col>
          <el-col :span="3">单价（元）</el-col>
          <el-col :span="3">金额（元）</el-col>
          <el-col :span="3">状态</el-col>
          <el-col :span="3">操作</el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-for="(item, index) in checkItem.items" :key="index">
        <!-- 序号 -->
        <el-col :span="2">
          <el-form-item>
            <span>({{ index + 1 }})</span>
          </el-form-item>
        </el-col>
        <!-- 项目名称 -->
        <el-col :span="6">
          <el-form-item :prop="'items.' + index + '.name'" :rules="{required: true, message: '项目名称不能为空', trigger: 'change'}">
            <el-autocomplete popper-class="my-autocomplete" v-model="item.name" v-if="item.status === 0"
              :disabled="checkItem.otherMsg.isDisabled" :fetch-suggestions="querySearch" placeholder="请选择项目名称"
              @select="item => selectPayItem(item, index)" value-key="name">
              <i class="el-icon-edit" slot="suffix"></i>
              <template slot-scope="{ item }">
                <span style="display: flex;width: 190px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ item.name }}</span>
                <span style="display: flex;color: #8492a6;margin-left: 10px;" v-if="item.szsbzhenliaokey">社保</span>
              </template>
            </el-autocomplete>
            <span v-if="item.status !== 0">{{ item.name }}</span>
          </el-form-item>
        </el-col>
        <!-- 数量 -->
        <el-col :span="4">
          <el-form-item :prop="'items.' + index + '.total'" :rules="{required: true, message: '数量不能为空', trigger: 'blur' }">
            <el-input v-model="item.total" @keyup.native='numberInput("total")' @blur="calculate(index)" :disabled="checkItem.otherMsg.isDisabled" v-if="item.status === 0"></el-input>
            <p v-if="item.status !== 0">
              <span>{{ item.total }}</span>
              <span>{{ item.total_unit }}</span>
            </p>
            <span v-if="item.status === 0">{{ item.total_unit }}</span>
          </el-form-item>
        </el-col>
        <!-- 单价 -->
        <el-col :span="3">
          <el-form-item>
            <span>￥ {{ item.price | priceFilter }}</span>
          </el-form-item>
        </el-col>
        <!-- 金额 -->
        <el-col :span="3">
          <el-form-item>
            <span>￥ {{ item.total_price | priceFilter }}</span>
          </el-form-item>
        </el-col>
        <!-- 操作 -->
        <el-col :span="3">
          <el-form-item>
            <span>{{ item.status | statusFliter }}</span>
          </el-form-item>
        </el-col>
          <!-- 状态 -->
        <el-col :span="3">
          <el-form-item>
            <i class="el-icon-delete" @click="del(item, index)" v-show="!checkItem.otherMsg.isDisabled"></i>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button v-show="!checkItem.otherMsg.isDisabled" @click="addFormItem" type="primary" size="small" class="el-icon-circle-plus-outline">
          增加一行
        </el-button>
        <p class="money"> 
          合计: <strong style="color: #f00;">{{ checkItem.totalMoney | priceFilter }}</strong>元
        </p>
      </el-form-item>
      <!-- 底部 -->
      <el-form-item align="right">
        <div class="doctor-message">
          <span class="name">医生: {{ patientMsg.doctorTip.name }}</span>
          <el-button type="primary" @click="submitForm('checkItem')" size="mini" v-show="!checkItem.otherMsg.isDisabled">保存</el-button>
          <el-button type="primary" v-show="checkItem.otherMsg.isDisabled" size="mini" @click="modifyPrescript(patientMsg)">修改</el-button>
          <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
        </div>
      </el-form-item>
    </el-form>
    <!-- 调用模板弹层 -->
    <el-dialog :visible.sync="usePlateWin">
      <use-plates :template-list="templateList" :template-type="itemtypeNum" @callball="templateCallBack"></use-plates>
    </el-dialog>
    <!-- 保存为模板的弹层 -->
    <el-dialog :visible.sync="savePlateWin">
      <save-item-template :items="checkItem.items" :item-type="itemtypeNum" v-if="savePlateWin" @cancel="cancelSaveTemplate"></save-item-template>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { dateFilter } from '@/utils/filters'
import { intLimit } from '@/utils/inputLimit'
import deepClone from '@/utils/deepClone'
import service from '@/utils/request'
import { saveChargitem, deleteChargitem, getUserChargitemList, sbAuditApi } from '@/serve/api'
import connectionTest from '@/common/connection'
import { AKF001 } from '@/common/dictionary'
import UsePlates from './use-plates'
import SaveItemTemplate from './save-item-template'
export default {
  data() {
    return {
      usePlateWin: false,
      savePlateWin: false,
      templateList: [],
      opener: null
    }
  },
  props: {
    patientMsg: {
      type: Object
    },
    title: {
      type: String
    },
    checkItem: {
      type: Object
    },
    checkId: {
      type: Number
    },
    itemtypeNum: {
      type: Number
    },
    payList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    usePlates() {  // 调用模板
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      if (this.checkItem.otherMsg.isDisabled) {
        this.$message.error('请先点击修改按钮')
        return
      }
      this.usePlateWin = true
    },
    calculate(index) {  // 计算金额
      this.checkItem.items[index].total_price = this.checkItem.items[index].total * this.checkItem.items[index].price  // 计算当前价格
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      let sum = 0
      this.checkItem.items.forEach(val => sum += val.total_price)
      this.checkItem.totalMoney = sum  // 超出库存提示
    },
    modifyPrescript() {  // 修改处方
      this.checkItem.otherMsg.isDisabled = false  
      this.getCheckPayList()
    },
    addFormItem() {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      let flag = true
      this.checkItem.items.forEach(val => {
        if (val.name === '') {
          flag = false
        }
      })
      if (!flag) {
        return
      }
      const json = {
        clinic_id: this.clinic,
        regist_id: this.patientMsg.registid,
        chargitem_id: '',
        name: '',
        item_type: this.checkId,  // 0未知 1挂号 2处方 3检查项 4耗材 5门诊购药 6其他"name": "抽血检查"
        total: '1',
        price: 0,
        total_price: 0,
        doctor: this.patientMsg.doctorTip.name,
        status: 0
      }
      this.checkItem.items.push(json)
    },
    del(item, index) {
      switch (item.status) {
        case 1:
          this.$alert(`此诊疗项(${item.name})已收费`, '提示', {
            confirmButtonText: '确定',
            callback: () => {}
          })
          return
        case 2:
          this.$alert(`此诊疗项(${item.name})已使用`, '提示', {
            confirmButtonText: '确定',
            callback: () => {}
          })
          return
        default:
          if (item.diagn_chargitem_id) {
            this.$confirm(`此诊疗项(${item.name})已保存, 是否删除?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.delCheck(item, index)
            }).catch()
          } else {
            this.checkItem.items.splice(index, 1)
            this.calculateAll()
          }
          break
      }
    },
    numberInput(str) {  // 限制数字输入
      for (let i = 0; i < this.checkItem.items.length; i++) {
        this.checkItem.items[i][str] = intLimit(this.checkItem.items[i][str])
      }
    },
    querySearch(queryString, callback) {
      const payList = this.payList
      const results = queryString ? payList.filter(this.createFilter(queryString)) : payList
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    createFilter(queryString) {
      return treat => treat.name.toLowerCase().indexOf(queryString.toLowerCase()) > -1
    },
    selectPayItem(item, index) {  // 选择收费项事件 chargitem_id
      this.checkItem.items[index].name = item.name
      this.checkItem.items[index].chargitem_id = item.item_id
      this.checkItem.items[index].price = item.price
      this.checkItem.items[index].total_unit = item.unit
      this.calculate(index)  // 调用计算
    },
    submitForm(formName) {  // 保存
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      let flag = true
      this.checkItem.items.forEach(val => {
        if (val.total === '0') {
          flag = false
        }
      })
      if (!flag) {
        this.$message({ message: '数量错误', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          const arr = []
          this.checkItem.items.map(val => {
            val.total -= 0
            delete (val.item)
            if (val.status === 0) {
              arr.push(val)
            }
            return arr
          })
          if (arr.length) {
            this.saveCheck(arr)
          }
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    saveCheck(array) {  // 保存收费项目
      service(saveChargitem, {
        items: array
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '保存成功', type: 'success' })
          this.checkItem.otherMsg.isDisabled = true
          res.forEach((val, index) => array[index].diagn_chargitem_id = val.diagn_chargitem_id)
          // 智慧医保
          if (this.patientMsg.details.szsbcardid && this.shebao.hospitalCode) {  // 存在电脑号则走智慧医保
            this.getCheckPayList(true)
          }
        }
      })
    },
    // 智慧医保
    smartMedical(items) {
      const item = items[0]
      const content = {
        tran_serial_no: this.shebao.operatorCode + new Date().format('yyyyMMddhhmmss'),
        operate_person_code: this.shebao.operatorCode,
        operate_person_name: this.shebao.operatorName,
        operate_time: dateFilter(new Date().getTime(), 'yyyyMMdd'),
        visit_no: item.regist_id,
        medical_dept_code: item.departmentcode,
        medical_dept_name: AKF001.find(v => v.key === item.departmentcode).value,
        visit_type: '2',   // 就诊类型（2门诊）
        medicine_type: '11',  // 医疗类别
        card_no: this.patientMsg.details.szsbcardid,
        pc_no: this.patientMsg.details.szsbcardid,
        patient_name: this.patientMsg.name,
        sex: this.patientMsg.gender + '',
        age: this.patientMsg.age.toString(),
        birth_date: this.patientMsg.birthdate.replace(/-/g, ''),
        region_code: '440300',
        insurance_type: '310',  // 险种类型
        doctor_code: item.doctorszsbid,
        doctor_name: item.doctorszsbname,
        doctor_advice_no: item.regist_id,   // 处方流水号
        diagnoses: [],  // 门诊诊断信息
        advice_details: []    // 医嘱明细信息
      }
      content.diagnoses = this.patientMsg.medicalRecordsForm.jibingjson.map((val, index) => {
        return {
          diagnose_no: (index + 1).toString(),
          diagnose_code: val.maincode,
          diagnose_desc: val.jbname
        }
      })
      content.advice_details = items.map(v => {
        return {
          project_code: v.item.szsbcode,
          hospital_code: this.shebao.hospitalCode,
          project_name: v.item.szsbname,
          is_out_recip: '1',  // 外配处方标志。0非外配处方 1外配处方
          recipe_no: v.diagn_chargitem_id,  // 换成处方id
          price: v.item.szsbprice,
          medical_number: parseFloat(v.total),
          amount: v.total_price
        }
      })
      service(sbAuditApi, {
        auth_token: this.shebao.zhihuiybtoken,
        content
      }).then(res => {
        if (this.opener) {
          this.opener.close()
          this.opener = null
        }
        const url = res.window_url
        const outerWidth = window.outerWidth
        const outerHeight = window.outerHeight
        const height = parseFloat(res.window_size.split(',')[1])
        const width = parseFloat(res.window_size.split(',')[0])
        const top = (outerHeight - height) / 2
        const left = (outerWidth - width) / 2
        this.opener = window.open(url, '_blank', `height=${height},width=${width},top=${top},left=${left}`)
        if (res.window_open_way === '2') {
          setTimeout(() => {
            this.opener.close()
            this.opener = null
          }, 5000)
        }
      })
    },
    delCheck(item, index) {  // 删除收费项
      service(deleteChargitem, {
        regist_id: this.patientMsg.registid,
        item_id: item.diagn_chargitem_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '删除成功', type: 'success', showClose: true, duration: 1000 })
          this.checkItem.items.splice(index, 1)
          this.calculateAll()
        }
      })
    },
    getCheckPayList(isAudit) {  // 获取客户收费项目列表
      service(getUserChargitemList, {
        status: -1,
        regist_id: this.patientMsg.registid
      }).then(async res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const arr1 = []
          if (res && res.length) {
            res.forEach(val => {
              if (val.item_type === this.checkId) {
                val.total += ''
                arr1.push(val)
              }
            })
          }
          this.checkItem.items = arr1
          const items = this.checkItem.items.filter(v => v.item.szsbcode && v.item.szsbstatus === 0 && v.item_type !== 7) || []
          if (isAudit && items.length) {
            const connectionStatus = await connectionTest()
            if (connectionStatus !== '1') {
              return
            }
            this.smartMedical(items)
          }
        }
      })
    },
    // 打印诊疗项
    print() {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      if (!this.checkItem.items[0].name) {
        this.$message({ message: '无诊疗项可供打印', type: 'error', showClose: true, duration: 1000 })
        return
      }
      const message = deepClone(this.patientMsg)
      this.$store.commit('user/SET_PRINT_MESSAGE', message)
      this.$nextTick(() => {
        window.open('/print/treatment-print')
      })
    },
    // 调用模板的回调
    templateCallBack(data) {
      data.data.item_list.forEach(obj => {
        const currentItem = this.payList.find(item => item.name === obj.name)
        if (!currentItem) {
          this.$message({ message: '模板中存在未设置收费项', type: 'error', showClose: true, duration: 1000 })
          return
        }
        this.addFormItem()
        const lastOne = this.checkItem.items.length - 1
        this.checkItem.items[lastOne].name = obj.name
        this.checkItem.items[lastOne].total = obj.total
        this.selectPayItem(currentItem, lastOne)
        this.calculate(lastOne)
      })
    },
    // 取消保存模板
    cancelSaveTemplate() {
      this.savePlateWin = false
    },
    // 保存为模板
    saveAsTemplate() {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'error', showClose: true, duration: 1000 })
        return
      }
      this.savePlateWin = true
    }
  },
  components: { UsePlates, SaveItemTemplate },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'shebao'])
  },
  filters: {
    statusFliter(status) {   // 挂号类别
      switch (status) {
        case 0:
          return '未缴费'
        case 1:
          return '已缴费'
        case 2:
          return '已使用'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  text-align: right;
  span {
    padding: 8px;
    color: #666;
  }
  span:hover {
    color: #09f;
    cursor: pointer;
  }
}
.check-item {
  margin-top: 20px;
  .el-col {
    text-align: center;
    border: 1px solid #ccc;
    color: #666;
  }
}
.doctor-message {
  text-align: right;
  .name {
    margin-right: 20px;
    color: #09f;
  }
}
</style>

