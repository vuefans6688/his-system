<template>
  <div class="check-item">
    <div class="header">
      <span class="el-icon-printer" @click="print">打印诊疗项目</span>
      <span class="el-icon-circle-check" @click="saveAsTemplate">保存为模板</span>
      <span class="el-icon-document" @click="usePlates('诊疗项目')">调用模板</span>
    </div>
    <el-form :model="patientMsg.checkItem" ref="checkItem" size="small">
      <el-form-item>
        <el-row>
          <el-col :span="2">序号</el-col>
          <el-col :span="6">项目名称</el-col>
          <el-col :span="4">数量</el-col>
          <el-col :span="3">单价（元）</el-col>
          <el-col :span="3">金额（元）</el-col>
          <el-col :span="3">状态</el-col>
          <el-col :span="3">操作</el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-for="(item, index) in patientMsg.checkItem.items" :key="index">
        <!-- 序号 -->
        <el-col :span="2">
          <el-form-item>
            <span>({{ index + 1 }})</span>
          </el-form-item>
        </el-col>
        <!-- 项目名称 -->
        <el-col :span="6">
          <el-form-item :prop="'items.' + index + '.name'" :rules="{required: true, message: '项目名称不能为空', trigger: 'blur'}">
            <el-select v-model="item.name" placeholder="请选择项目名称" :disabled="patientMsg.checkItem.checkItemStatus.isDisabled" v-if="item.status === 0">
              <el-option v-for="val in payList" :key="val.item_id" :label="val.name" :value="val.name" @click.native="selectPayItem(val, index)"></el-option>
            </el-select>
            <span v-if="item.status !== 0">{{ item.name }}</span>
          </el-form-item>
        </el-col>
        <!-- 数量 -->
        <el-col :span="4">
          <el-form-item :prop="'items.' + index + '.total'" :rules="{required: true, message: '数量不能为空', trigger: 'blur' }">
            <el-input v-model="item.total" @keyup.native="numberInput('total')" @blur="calculate(index)" :disabled="patientMsg.checkItem.checkItemStatus.isDisabled" v-if="item.status === 0"></el-input>
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
            <i class="el-icon-delete" @click="del(item, index)" v-show="!patientMsg.checkItem.checkItemStatus.isDisabled"></i>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <span @click="addFormItem" v-show="!patientMsg.checkItem.checkItemStatus.isDisabled">
          <i class="el-icon-circle-plus-outline"></i> 增加一行
          </span>
          <span class="total-money"> 
          合计: <strong>{{ patientMsg.checkItemTotalMoney }}</strong>元
        </span>
      </el-form-item>
      <!-- 底部 -->
      <el-form-item>
        <div class="doctor-message">
          <p>医生: {{ patientMsg.doctorTip.name }}</p>
          <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
          <el-button type="primary" @click="submitForm('checkItem')" v-show="!patientMsg.checkItem.checkItemStatus.isDisabled">保存</el-button>
          <el-button type="primary" v-show="patientMsg.checkItem.checkItemStatus.isDisabled" @click="amendPre(patientMsg)">修改</el-button>
        </div>
      </el-form-item>
    </el-form>
    <!-- 调用模板 -->
    <el-dialog :visible.sync="usePlateWin" @close="cancelSaveTemplate">
      <use-plates :templateList="templateList" :templateType="5" @callball="templateCallBack"></use-plates>
    </el-dialog>
    <!-- 保存为模板的弹窗 -->
    <save-item-template :items="patientMsg.checkItem.items" :itemtype="5" v-if="savePlateWin" @cancel="cancelSaveTemplate"></save-item-template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit } from '@/utils/inputLimit'
import deepClone from '@/utils/deepClone'
import UsePlates from './use-plates'
import SaveItemTemplate from './save-item-template'
export default {
  components: { UsePlates, SaveItemTemplate },
  props: {
    patientMsg: {
      type: Object
    }
  },
  data() {
    return {
      usePlateWin: false,
      savePlateWin: false,
      payList: [],
      templateList: []
    }
  },
  methods: {
    usePlates() {  // 调用模板
      if (this.patientMsg.checkItem.checkItemStatus.isDisabled) {
        this.$message.error('请先点击修改按钮')
        return
      }
      this.getMedicalTemplateList()
      this.usePlateWin = true
    },
    calculate(index) {  // 计算金额
      this.patientMsg.checkItem.items[index].total_price =
      this.patientMsg.checkItem.items[index].total * this.patientMsg.checkItem.items[index].price  // 计算当前价格
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      let sum = 0
      this.patientMsg.checkItem.items.forEach(val => sum += val.total_price)
      this.patientMsg.checkItemTotalMoney = sum  // 超出库存提示
    },
    amendPre() {  // 修改
      this.patientMsg.checkItem.checkItemStatus.isDisabled = false  // 可修改处方
      this.getCheckPayList()
    },
    addFormItem() {
      if (!this.patientMsg.registid) {
        this.$message({ message: '请接诊客户', type: 'warning', showClose: true, duration: 1000 })
        return
      }
      const json = {
        clinic_id: this.clinic,
        regist_id: this.patientMsg.registid,
        chargitem_id: '',
        name: '',
        item_type: 3,  // 0未知 1挂号 2处方 3检查项 4耗材 5门诊购药 6其他"name": "抽血检查"
        total: '1',
        price: 0,
        total_price: 0,
        doctor: this.patientMsg.doctorTip.name,
        status: 0
      }
      this.patientMsg.checkItem.items.push(json)
    },
    del(item, index) {
      switch (item.status) {
        case 1:
          this.$message.error('该项目已收费')
          return
        case 2:
          this.$message.error('该项目已使用')
          return
        default:
          if (item.diagn_chargitem_id) {
            this.$confirm('此收费项已保存, 是否删除?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.delCheck(item, index)
            }).catch()
          } else {
            this.patientMsg.checkItem.items.splice(index, 1)
            this.calculateAll()
          }
          break
      }
    },
    numberInput(str) {  // 限制数字输入
      for (let i = 0; i < this.patientMsg.checkItem.items.length; i++) {
        this.patientMsg.checkItem.items[i][str] = intLimit(this.patientMsg.checkItem.items[i][str])
      }
    },
    selectPayItem(item, index) {  // 选择收费项事件 
      this.patientMsg.checkItem.items[index].chargitem_id = item.item_id
      this.patientMsg.checkItem.items[index].price = item.price
      this.patientMsg.checkItem.items[index].total_unit = item.unit
      this.calculate(index)  // 调用计算
    },
    submitForm(formName) {  // 保存
      if (!this.patientMsg.registid) {
        return
      }
      let flag = true
      this.patientMsg.checkItem.items.forEach(val => {
        if (val.total === '0' || val.price === 0) {
          flag = false
        }
      })
      if (!flag) {
        this.$message.error('数量错误')
        return
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          const arr = []
          this.patientMsg.checkItem.items.map(val => {
            val.total -= 0
            if (val.status === 0) {
              arr.push(val)
            }
            return arr
          })
          if (arr.length) {
            this.saveCheck(arr)
          }
        } else {
          this.$message({ message: '信息有误', type: 'warning' })
          return false
        }
      })
    },
    saveCheck(array) {  // 保存收费项目
      this.$http.post('/service/chargitem/save', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          items: array
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({ message: '保存成功', type: 'success' })
          this.patientMsg.checkItem.checkItemStatus.isDisabled = true
          res.data.data.forEach((val, index) => array[index].diagn_chargitem_id = val.diagn_chargitem_id)
        } else {
          this.$message.error(res.data.errmsg)
        }
      }).catch()
    },
    delCheck(item, index) {  // 删除收费项
      this.$http.post('/service/chargitem/delete', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          regist_id: this.patientMsg.registid,
          item_id: item.diagn_chargitem_id
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({ message: '删除成功', type: 'success' })
          this.patientMsg.checkItem.items.splice(index, 1)
          this.calculateAll()
        } else {
          this.$message.error(res.data.errmsg)
        }
      }).catch()
    },
    getPayList() {  // 获取收费项目
      this.$http.post('/service/clinic/chargitem_list', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''                  // 留空
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          const arr = []
          res.data.data.forEach(val => {
            if (val.disabled === 0 && val.type === 3) {
              arr.push(val)
            }
          })
          this.payList = arr
        } else {
          this.$message.error(res.data.errmsg)
        }
      }).catch()
    },
    getCheckPayList() {  // 获取客户收费项目列表
      this.$http.post('/service/chargitem/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          status: -1,
          regist_id: this.patientMsg.registid
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          const arr1 = []
          if (res.data.data) {
            res.data.data.forEach(val => {
              if (val.item_type === 3) {
                val.total += ''
                arr1.push(val)
              }
            })
          }
          this.patientMsg.checkItem.items = arr1
        } else {
          this.$message.error(res.data.errmsg)
        }
      }).catch()
    },
    // 打印诊疗项
    print() {
      if (!this.patientMsg.checkItem.items.length) {
        this.$message.error('无检查项可供打印')
        return
      }
      const printMsg = deepClone(this.patientMsg)
      this.$store.commit('user/SET_PRINT_MESSAGE', printMsg)
      this.$nextTick(() => {
        window.open('/print/treatment-print')
      })
    },
    // 获取诊疗模板
    getMedicalTemplateList() {
      this.$http.post('/service/template/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          type: 5,
          name: '',
          owner_type: 2,
          page_index: 0,
          page_size: 10000
        }
      }).then(response => {
        if (response.data.errcode === 0) {
          this.templateList = response.data.data.items || []
        } else {
          this.$message.error(response.data.errmsg)
        }
      }).catch()
    },
    // 调用模板的回调
    templateCallBack(data) {
      this.cancelSaveTemplate()
      data.data.item_list.forEach(obj => {
        this.addFormItem()
        const curItem = this.payList.find(chargeItem => chargeItem.name === obj.name)
        const lastOne = this.patientMsg.checkItem.items.length - 1
        this.patientMsg.checkItem.items[lastOne].name = obj.name
        this.patientMsg.checkItem.items[lastOne].total = obj.total
        this.selectPayItem(curItem, lastOne)
        this.calculate(lastOne)
      })
    },
    // 取消保存模板
    cancelSaveTemplate() {
      this.savePlateWin = false
    },
    // 保存为模板
    saveAsTemplate() {
      this.savePlateWin = true
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  watch: {
    patientMsg() {
      if (this.patientMsg.checkPayList.length) {
        this.patientMsg.checkItem.items = this.patientMsg.checkPayList
        this.patientMsg.checkItem.checkItemStatus.isDisabled = true
        this.calculateAll()
      }
    }
  },
  created() {
    this.getPayList()
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

</style>

