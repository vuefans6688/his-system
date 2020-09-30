<template>
  <div class="other">
    <div class="header">
      <span class="el-icon-circle-check" @click="saveAsTemplate">保存为模板</span>
      <span class="el-icon-document" @click="usePlates('其它收费项目')">调用模板</span>
    </div>
    <el-form :model="patientMsg.other" ref="other" size="small">
      <el-form-item>
        <el-row>
          <el-col :span="2">序号</el-col>
          <el-col :span="6">收费项名称</el-col>
          <el-col :span="4">数量</el-col>
          <el-col :span="3">单价（元）</el-col>
          <el-col :span="3">金额（元）</el-col>
          <el-col :span="3">状态</el-col>
          <el-col :span="3">操作</el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-for="(item, index) in patientMsg.other.items" :key="index">
        <!-- 序号 -->
        <el-col :span="2">
          <el-form-item>
            <span>({{ index + 1 }})</span>
          </el-form-item>
        </el-col>
        <!-- 项目名称 -->
        <el-col :span="6">
          <el-form-item :prop="'items.' + index + '.name'" :rules="{required: true, message: '收费项名称不能为空', trigger: 'blur'}">
            <el-select v-model="item.name" placeholder="请选择收费项名称" 
              :disabled="patientMsg.other.otherStatus.isDisabled" v-if="item.status === 0">
              <el-option v-for="val in payList" :key="val.item_id" :label="val.name" 
                :value="val.name" @click.native="selectPayItem(val, index)">
              </el-option>
            </el-select>
            <span v-if="item.status !== 0">{{ item.name }}</span>
          </el-form-item>
        </el-col>
        <!-- 数量 -->
        <el-col :span="4">
          <el-form-item :prop="'items.' + index + '.total'" :rules="{required: true, message: '数量不能为空', trigger: 'blur' }">
            <el-input v-model="item.total" @keyup.native="numberInp('total')" v-if="item.status === 0"
              @blur="calculate(index)" :disabled="patientMsg.other.otherStatus.isDisabled">
            </el-input>
            <p v-if="item.status !== 0">{{ item.total }} <span>{{ item.total_unit }}</span></p>
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
            <i class="el-icon-delete" @click="del(item, index)" v-show="!patientMsg.other.otherStatus.isDisabled"></i>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <span @click="addFormItem" v-show="!patientMsg.other.otherStatus.isDisabled">
          <i class="el-icon-circle-plus-outline"></i> 增加一行
        </span>
        <span class="total-money"> 
        合计: <strong>{{ patientMsg.otherTotalMoney }}</strong>元
      </span>
      </el-form-item>
      <!-- 底部 -->
      <el-form-item align="right">
        <div class="doctor-message">
          <p>医生: {{ patientMsg.doctorTip.name }}</p>
          <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
          <el-button type="primary" @click="submitForm('other')" v-show="!patientMsg.other.otherStatus.isDisabled">保存</el-button>
          <el-button type="primary" v-show="patientMsg.other.otherStatus.isDisabled" @click="amendPre(patientMsg)">修改</el-button>
        </div>
      </el-form-item>
    </el-form>
    <!-- 调用模板 -->
    <el-dialog :visible.sync="usePlateWin" @close="cancelCallTemplate">
      <use-plates :template-list="templateList" :template-type="7" @callball="templateCallBack"></use-plates>
    </el-dialog>
    <!-- 保存为模板窗 -->
    <save-item-template :items="patientMsg.other.items" :item-type="7" v-if="savePlateWin" @cancel="cancelSaveTemplate"></save-item-template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit } from '@/utils/inputLimit'
import service from '@/utils/request'
import { saveChargitem } from '@/serve/api'
import UsePlates from './use-plates'
import SaveItemTemplate from './save-item-template'
export default {
  data() {
    return {
      savePlateWin: false,
      templateList: [],
      usePlateWin: false,
      payList: []
    }
  },
  methods: {
    usePlates() {  // 调用模板
      if (this.patientMsg.other.otherStatus.isDisabled) {
        this.$message.error('请先点击修改按钮')
        return
      }
      this.getMedicalTemplateList()
      this.usePlateWin = true
    },
    // 取消调用模板
    cancelCallTemplate() {
      this.usePlateWin = false
    },
    calculate(index) {  // 计算金额
      this.patientMsg.other.items[index].total_price =
      this.patientMsg.other.items[index].total * this.patientMsg.other.items[index].price  // 计算当前价格
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      let sum = 0
      this.patientMsg.other.items.forEach(val => sum += val.total_price)
      this.patientMsg.otherTotalMoney = sum  // 超出库存提示
    },
    amendPre() {  // 修改
      this.patientMsg.other.otherStatus.isDisabled = false  // 可修改处方
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
        item_type: 6,  // 0未知，1挂号，2处方，3检查项，4耗材，5门诊购药，6其他"name": "抽血检查"
        total: '1',
        price: 0,
        total_price: 0,
        doctor: this.patientMsg.doctorTip.name,
        status: 0
      }
      this.patientMsg.other.items.push(json)
    },
    del(item, index) {
      switch (item.status) {
        case 1:
          this.$message.error('该项目已收费')
          return
        case 2:
          this.$message.error('该项目已使用')
          return
      }
      if (this.patientMsg.other.items.length <= 1) {
        return
      }
      this.patientMsg.other.items.splice(index, 1)
      this.calculateAll()
    },
    numberInput(str) {  // 限制数字输入
      for (let i = 0; i < this.patientMsg.other.items.length; i++) {
        this.patientMsg.other.items[i][str] = intLimit(this.patientMsg.other.items[i][str])
      }
    },
    selectPayItem(item, index) {  // 选择收费项事件 chargitem_id
      this.patientMsg.other.items[index].chargitem_id = item.item_id
      this.patientMsg.other.items[index].price = item.price
      this.patientMsg.other.items[index].total_unit = item.unit
      this.calculate(index)  // 调用计算
    },
    submitForm(formName) {  // 保存
      if (!this.patientMsg.registid) return
      let flag = true
      this.patientMsg.other.items.forEach(val => {
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
          const array = []
          // 过滤掉收费过的
          this.patientMsg.other.items.map(val => {
            val.total -= 0
            if (val.status === 0) {
              array.push(val)
            }
            return array
          })
          if (array.length) {
            this.saveCheck(array)
          }
        } else {
          this.$message({ message: '信息有误', type: 'warning' })
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
          this.patientMsg.other.otherStatus.isDisabled = true
        }
      })
    },
    getPayList() {  // 获取收费项目
      this.$http.post('/service/clinic/chargitem_list', {
        head: {
          accessToken: this.token,      // 用户身份标识，必选参数
          lastnotice: 0,
          msgid: ''                // 留空
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          const arr = []
          res.data.data.forEach(val => {
            if (val.disabled === 0 && val.type === 6) {
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
            for (let i = res.data.data.length - 1; i >= 0; i--) {
              if (res.data.data[i].item_type === 6) {
                arr1.push(res.data.data[i])
              }
            }
          }
          this.patientMsg.other.items = arr1
        } else {
          this.$message.error(res.data.errmsg)
        }
      }).catch()
    },
    // 获取诊疗项目模板
    getMedicalTemplateList() {
      this.$http.post('/service/template/list', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          type: 7,
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
      this.cancelCallTemplate()
      data.data.item_list.forEach(obj => {
        this.addFormItem()
        const curItem = this.payList.find(chargeItem => chargeItem.name === obj.name)
        const lastOne = this.patientMsg.other.items.length - 1
        this.patientMsg.other.items[lastOne].name = obj.name
        this.patientMsg.other.items[lastOne].total = obj.total
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
  components: { UsePlates, SaveItemTemplate },
  props: {
    patientMsg: {
      type: Object
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  watch: {
    patientMsg() {
      if (this.patientMsg.otherPayList.length) {
        this.patientMsg.other.items = this.patientMsg.otherPayList
        this.patientMsg.other.otherStatus.isDisabled = true
        this.calculateAll()
      }
    }
  },
  created() {
    this.getPayList()
  },
  filters: {
    statusFliter(id) {   // 挂号类别
      switch (id) {
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
  cursor: pointer;
  span {
    padding: 6px;
    color: #666;
  }
  span:hover {
    color: #09f;
  }
}
</style>

