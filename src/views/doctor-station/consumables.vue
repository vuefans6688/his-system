<template>
  <div class="consumables">
    <div class="header">
      <span class="el-icon-circle-check" @click="saveAsTemplate">保存为模板</span>
      <span class="el-icon-document" @click="usePlates('耗材项目')">调用模板</span>
    </div>
    <el-form :model="patientMsg.comsumables" ref="comsumables" size="small">
      <el-form-item>
        <el-row>
          <el-col :span="2">序号</el-col>
          <el-col :span="6">耗材名称</el-col>
          <el-col :span="4">数量</el-col>
          <el-col :span="3">单价（元）</el-col>
          <el-col :span="3">金额（元）</el-col>
          <el-col :span="3">状态</el-col>
          <el-col :span="3">操作</el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-for="(item, index) in patientMsg.comsumables.items" :key="index">
        <!-- 序号 -->
        <el-col :span="2">
          <el-form-item align="center">
            <span>({{ index + 1 }})</span>
          </el-form-item>
        </el-col>
        <!-- 项目名称 -->
        <el-col :span="6">
          <el-form-item :prop="'items.' + index + '.name'" :rules="{required: true, message: '耗材名称不能为空', trigger: 'blur'}">
            <el-select v-model="item.name" placeholder="请选择耗材名称" 
              :disabled="patientMsg.comsumables.comsumablesStatus.isDisabled" v-if="item.status === 0">
              <el-option v-for="val in payList" :key="val.item_id" :label="val.name" :value="val.name" 
                @click.native="selectPayItem(val, index)">
              </el-option>
            </el-select>
            <span v-if="item.status !== 0">{{ item.name }}</span>
          </el-form-item>
        </el-col>
        <!-- 数量 -->
        <el-col :span="4">
          <el-form-item align="left" :prop="'items.' + index + '.total'" :rules="{required: true, message: '数量不能为空', trigger: 'blur' }">
            <el-input v-model="item.total" @keyup.native='numberInput("total")' @blur="calculate(index)" :disabled="patientMsg.comsumables.comsumablesStatus.isDisabled" v-if="item.status === 0"></el-input>
            <p v-if="item.status !== 0">
              <span>{{ item.total }}</span> 
              <span>{{ item.total_unit }}</span>
            </p>
            <span v-if="item.status === 0">{{ item.total_unit }}</span>
          </el-form-item>
        </el-col>
        <!-- 单价 -->
        <el-col :span="3">
          <el-form-item align="center">
            <span>￥ {{ item.price | priceFilter }}</span>
          </el-form-item>
        </el-col>
        <!-- 金额 -->
        <el-col :span="3">
          <el-form-item align="center">
            <span>￥ {{ item.total_price | priceFilter }}</span>
          </el-form-item>
        </el-col>
        <!-- 操作 -->
        <el-col :span="3">
          <el-form-item align="center">
            <span>{{ item.status | statusFliter }}</span>
          </el-form-item>
        </el-col>
          <!-- 状态 -->
        <el-col :span="3">
          <el-form-item align="center">
            <i class="el-icon-delete" @click="del(item, index)" v-show="!patientMsg.comsumables.comsumablesStatus.isDisabled"></i>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item align="left">
        <span @click="addFormItem" v-show="!patientMsg.comsumables.comsumablesStatus.isDisabled">
          <i class="el-icon-circle-plus-outline"></i> 增加一行
        </span>
        <span class="total-money"> 
          合计: <strong>{{ patientMsg.comsumablesTotalMoney }}</strong>元
        </span>
      </el-form-item>
      <!-- 底部 -->
      <el-form-item align="right">
        <div class="doctor-message">
          <p>医生: {{ patientMsg.doctorTip.name }}</p>
          <p v-if="patientMsg.doctorTip.tipMsg">{{ patientMsg.doctorTip.content }}</p>
          <el-button type="primary" @click="submitForm('comsumables')" v-show="!patientMsg.comsumables.comsumablesStatus.isDisabled">保存</el-button>
          <el-button type="primary" @click="amendPrescript(patientMsg)" v-show="patientMsg.comsumables.comsumablesStatus.isDisabled">修改</el-button>
        </div>
      </el-form-item>
    </el-form>
    <!-- 调用模板 -->
    <el-dialog :visible.sync="usePlateWin">
      <use-plates :template-list="templateList" :template-type="6" @callball="templateCallBack"></use-plates>
    </el-dialog>
    <!-- 保存为模板的弹窗 -->
    <save-item-template :items="patientMsg.comsumables.items" :item-type="6" v-if="savePlateWin" @cancel="cancelSaveTemplate"></save-item-template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit } from '@/utils/inputLimit'
import UsePlates from './use-plates'
import SaveItemTemplate from './save-item-template'
export default {
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
      if (this.patientMsg.comsumables.comsumablesStatus.isDisabled) {
        this.$message.error('请先点击修改按钮')
        return
      }
      this.getMedicalTemplateList()
      this.usePlateWin = true
    },
    calculate(index) {  // 计算金额
      this.patientMsg.comsumables.items[index].total_price =
      this.patientMsg.comsumables.items[index].total * this.patientMsg.comsumables.items[index].price  // 计算当前价格
      this.calculateAll()
    },
    calculateAll() {  // 计算总价
      let sum = 0
      this.patientMsg.comsumables.items.forEach(val => sum += val.total_price)
      this.patientMsg.comsumablesTotalMoney = sum  // 超出库存提示
    },
    amendPrescript() {  // 修改
      this.patientMsg.comsumables.comsumablesStatus.isDisabled = false  
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
        item_type: 4,  // 0未知 1挂号 2处方 3检查项 4耗材 5门诊购药 6其他"name": "抽血检查"
        total: '1',
        price: 0,
        total_price: 0,
        doctor: this.patientMsg.doctorTip.name,
        status: 0
      }
      this.patientMsg.comsumables.items.push(json)
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
      if (this.patientMsg.comsumables.items.length <= 1) {
        return
      }
      this.patientMsg.comsumables.items.splice(index, 1)
      this.calculateAll()
    },
    numberInput(str) {  // 限制数字输入
      for (let i = 0; i < this.patientMsg.comsumables.items.length; i++) {
        this.patientMsg.comsumables.items[i][str] = intLimit(this.patientMsg.comsumables.items[i][str])
      }
    },
    selectPayItem(item, index) {  // 选择收费项事件 chargitem_id
      this.patientMsg.comsumables.items[index].chargitem_id = item.item_id
      this.patientMsg.comsumables.items[index].price = item.price
      this.patientMsg.comsumables.items[index].total_unit = item.unit
      this.calculate(index)  // 调用计算
    },
    submitForm(formName) {  // 保存
      if (!this.patientMsg.registid) return
      let flag = true
      this.patientMsg.comsumables.items.forEach(val => {
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
          this.patientMsg.comsumables.items.map(val => {
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
          this.patientMsg.comsumables.comsumablesStatus.isDisabled = true
          res.data.data.forEach((val, index) => {
            array[index].diagn_chargitem_id = val.diagn_chargitem_id
          })
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
            if (val.disabled === 0 && val.type === 4) {
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
          const arr = []
          if (res.data.data) {
            res.data.data.forEach(val => {
              if (val.item_type === 4) {
                arr.push(val)
              }
            })
          }
          this.patientMsg.comsumables.items = arr
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
          type: 6,
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
      data.data.item_list.forEach(obj => {
        this.addFormItem()
        const curItem = this.payList.find(chargeItem => chargeItem.name === obj.name)
        const lastOne = this.patientMsg.comsumables.items.length - 1
        this.patientMsg.comsumables.items[lastOne].name = obj.name
        this.patientMsg.comsumables.items[lastOne].total = obj.total
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
      if (this.patientMsg.comsumablesPayList.length) {
        this.patientMsg.comsumables.items = this.patientMsg.comsumablesPayList
        this.patientMsg.comsumables.comsumablesStatus.isDisabled = true
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

