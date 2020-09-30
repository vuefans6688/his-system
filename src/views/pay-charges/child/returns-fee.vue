<template>
  <div class="returns-fee">
    <el-row class="header">
      <el-col :span="8">
        <p>姓名: {{ feeMsg.name }}</p>
        <p v-if="feeMsg.gender">性别: {{ feeMsg.gender | sexFilter }}</p>
        <p v-if="feeMsg.birthdate">年龄: {{ feeMsg.birthdate | dateFilter }}岁</p>
        <p>客户手机: {{ feeMsg.phone }}</p>
      </el-col>
      <el-col :span="8">
        <p>收费单号: {{ feeMsg.chargeid }}</p>
        <p>收费方式: 自费</p>
        <p v-if="feeMsg.chargestatus === 1">支付状态: 支付</p>
        <p v-else>退费方式: {{ feeMsg.paymethod | payMethod }}</p>
      </el-col>
      <el-col :span="8">
        <p>退费金额: ￥{{ feeMsg.realprice }}</p>
        <p>减免金额: ￥{{ feeMsg.reduceprice }}</p>
      </el-col>
    </el-row>
    <div class="header">
      <el-button v-if="feeMsg.chargestatus === 1 && sbItems.length" type="primary" size="small" @click="sheBaoBillPrint">社保发票补打</el-button>
      <el-button v-if="feeMsg.chargestatus === 1 && normalItems.length" type="primary" size="small" @click="normalBillPrint">自费项发票补打</el-button>
      <el-button v-if="feeMsg.chargestatus === 1 && sbItems.length" type="primary" size="small" @click="sheBaoPrint(1)">社保收费收据补打</el-button>
      <el-button v-if="feeMsg.chargestatus === 1 && normalItems.length" type="primary" size="small" @click="normalPrint(1)">自费项收费收据补打</el-button>
      <el-button v-if="feeMsg.chargestatus === 2 && sbItems.length" type="primary" size="small" @click="sheBaoPrint(2)">社保退费打印</el-button>
      <el-button v-if="feeMsg.chargestatus === 2 && normalItems.length" type="primary" size="small" @click="normalPrint(2)">自费退费打印</el-button>
    </div>
    <div class="content">
      <el-row class="title">
        <el-col :span="1">
          <el-checkbox v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
        </el-col>
        <el-col :span="5">收费项目</el-col>
        <el-col :span="5">单价</el-col>
        <el-col :span="5">数量</el-col>
        <el-col :span="5">金额（元）</el-col>
      </el-row>
      <div class="fee-list" v-for="(item, index) in feeMsg.items" :key="index">
        <div v-if="item.chargetype === 1"></div>
        <div v-if="item.chargetype === 2">
          <el-row>
            <el-col :span="1">
              <el-checkbox v-model="item.isChecked" @change="selectOneItem($event, index)" 
                :disabled="!item.canBackFee">
              </el-checkbox>
            </el-col>
            <el-col :span="23">
              <span v-if="item.data.prescript_type === 1">西药处方{{ item.data.prescript_id | indexFilter(1, feeMsg.items) }}</span>
              <span v-if="item.data.prescript_type === 2">中药处方{{ item.data.prescript_id | indexFilter(2, feeMsg.items) }}</span>
              <span v-if="item.data.prescript_type === 3">输液处方{{ item.data.prescript_id | indexFilter(3, feeMsg.items) }}</span>
              <span>({{ item.data.status | prescriptStatus }})</span>
            </el-col>
          </el-row>
          <el-row v-for="(drug_item, index2) in item.data.drug_list" :key="index2">
            <el-col :span="4">{{ drug_item.name }}</el-col>
            <el-col :span="5">
              <span v-if="item.data.prescript_type === 1">
                <i v-if="item.paymethod === 5 && drug_item.druginfo.szsbstatus === 1">{{ drug_item.druginfo.shebao_price | priceFilter }}</i>
                <i v-else>{{ drug_item.price | priceFilter }}</i>元/{{ drug_item.total_unit }}
              </span>
              <span v-if="item.data.prescript_type === 2">
                <i v-if="item.paymethod === 5 && drug_item.druginfo.szsbstatus === 1">{{ drug_item.druginfo.shebao_price | priceFilter }}元/{{ drug_item.dose_unit }}</i>
                <i v-else>{{ drug_item.price | priceFilter }}元/{{ drug_item.price_unit }}</i>
              </span>
              <span v-if="item.data.prescript_type === 3">
                <i v-if="item.paymethod === 5 && drug_item.druginfo.szsbstatus === 1">{{ drug_item.druginfo.shebao_price | priceFilter }}</i>
                <i v-else>{{ drug_item.price | priceFilter }}</i>元/{{ drug_item.total_unit }}
              </span>
              <span v-if="item.data.prescript_type === 2">({{ drug_item.spec_text }})</span>
            </el-col>
            <el-col :span="5">
              <span v-if="item.data.prescript_type === 2">
                {{ drug_item.dosage }}{{ drug_item.dose_unit }} *
              </span>
              <span>{{ drug_item.total }}{{ drug_item.total_unit }}</span>
            </el-col>
            <el-col :span="5">
              <span v-if="item.paymethod === 5 && drug_item.druginfo.szsbstatus === 1">
                <i v-if="item.data.prescript_type !== 2">{{ drug_item.druginfo.shebao_price * drug_item.total | priceFilter }}</i>
                <i v-else>{{ drug_item.druginfo.shebao_price * (drug_item.total * drug_item.dosage / drug_item.druginfo.specs.unit_primary.specs_unit) | priceFilter }}</i>
              </span>
              <span v-else>{{ drug_item.total_price | priceFilter }} 元</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5">
              合计: <i>{{ item.total_price | priceFilter }}</i>
            </el-col>
          </el-row> 
        </div> 
        <div v-if="item.chargetype === 5">
          <el-row>
            <el-col :span="1">
              <el-checkbox v-model="item.isChecked" @change="selectOneItem($event, index)" 
                :disabled="!item.canBackFee">
              </el-checkbox>
            </el-col>
            <el-col :span="23">
              <span>门诊零售: ({{ item.data.status | prescriptStatus }})</span>
            </el-col>
          </el-row>
          <el-row v-for="(drug_item, index2) in item.data.drug_list" :key="index2">
            <el-col :span="4">{{ drug_item.name }}</el-col>
            <el-col :span="5">{{ drug_item.price | priceFilter }}元/{{ drug_item.price_unit }}
              <span v-show="drug_item.drug_type === 1">({{ drug_item.spec }})</span>
            </el-col>
            <el-col :span="5">{{ drug_item.total }}{{ drug_item.total_unit }}</el-col>
            <el-col :span="5">{{ drug_item.total_price | priceFilter }}元</el-col>
          </el-row>
          <el-row>
            <el-col :span="5">合计: {{ item.data.total_price | priceFilter }} 元</el-col>
          </el-row> 
        </div> 
        <div v-else>
          <el-row>
            <el-col :span="1">
              <el-checkbox v-model="item.isChecked" @change="selectOneItem($event, index)" 
                :disabled="!item.canBackFee">
              </el-checkbox>
            </el-col>
            <el-col :span="5">
              <span>{{ item.data.name }}</span>
              <span>({{ item.data.status | otherStatus }})</span>
            </el-col>
            <el-col :span="5">
              <span v-if="item.paymethod === 5 && item.data.item.szsbstatus === 1">
                {{ item.data.item.szsbprice | priceFilter }}
              </span>
              <span v-else>{{ item.data.price | priceFilter }}</span>元
            </el-col>
            <el-col :span="5">{{ item.data.total }}{{ item.data.total_unit }}</el-col>
            <el-col :span="5">
              <span>{{ item.total_price }}</span>
            </el-col>
          </el-row>
        </div> 
      </div>
    </div>
    <div class="footer" v-if="feeMsg.chargestatus === 1">
      <p>
        <span>应退金额(元): </span>
        <span class="price-bold" v-if="feeMsg.paymethod === 5">￥{{ totalPrice2 }}</span>
        <span class="price-bold" v-else>￥{{ totalPrice }}</span>
        <span v-if="feeMsg.paymethod === 5">(社保: {{ sbFee }}元, 自费: {{ personalFee }}元)</span>
      </p>
      <p v-if="feeMsg.paymethod !== 5">
        <span>实退金额(元): </span>
        <el-input class="real-return-fee" v-model="realReturnFee" size="small" 
          @keyup.native="returnPriceLimit">
        </el-input>
      </p>
      <div class="operation">
        <p class="warn">
          <i class="el-icon-warning" style="color: #eb9e05;"></i>
          温馨提示: 当前退费为不可逆动作, 请谨慎操作!
        </p>
        <div>
          <el-button type="primary" size="small" @click="isBackFee" :disabled="!selectedItems.length">确认退费</el-button>
          <el-button type="warning" size="small" @click="cancelFee">取消</el-button> 
        </div>
      </div>
    </div>
    <div class="footer" v-if="feeMsg.chargestatus === 2">
      <el-button type="primary" size="small" @click="cancelFee">返回</el-button> 
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { floatLimit } from '@/utils/inputLimit'
import connection from '@/common/connection'
import { backFeeDetail, payedRefund, jycancel } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      feeMsg: {},
      realReturnFee: ''  // 实际退费金额
    }
  },
  methods: {
    // 收据打印
    sheBaoPrint(type) {
      const printData = {}
      this.$set(printData, 'type', type)
      this.sbItems = this.sbItems.sort((a, b) => b.szsbrecord.personleftbp - b.szsbrecord.personleftbp)
      const personleftbp = type === 1 ? this.sbItems[0].szsbrecord.personleftbp : this.sbItems[this.sbItems.length - 1].szsbrecord.personleft
      const personleft = type === 1 ? this.sbItems[this.sbItems.length - 1].szsbrecord.personleft : this.sbItems[0].szsbrecord.personleftbp
      this.$set(printData, 'name', this.sbItems[0].szsbrecord.patientname)
      this.$set(printData, 'liushui', this.feeMsg.registid)
      this.$set(printData, 'danju', this.feeMsg.chargeid)
      this.$set(printData, 'yiliaoCard', this.sbItems[0].szsbrecord.yiliaohao)
      this.$set(printData, 'computerCard', this.sbItems[0].szsbrecord.diannaohao)
      this.$set(printData, 'personleftbp', personleftbp)
      this.$set(printData, 'personleft', personleft)
      // 清单
      this.$set(printData, 'list', this.sbItems)
      // 药品
      let checkTotalPrice = 0
      let westTotalPrice = 0
      let zhongchengTotalPrice = 0
      let zhongcaoTotalPrice = 0
      let otherTotalPrice = 0
      // 支付组成
      let printSbTotal = 0
      let printsbCash = 0
      let printSbAccount = 0
      let printSbJijin = 0
      this.sbItems.forEach(item => {
        printSbTotal += item.szsbrecord.total
        printsbCash += item.szsbrecord.personpay
        printSbAccount += item.szsbrecord.personaccount
        printSbJijin += item.szsbrecord.jijinpay
        if (item.szsbrecord.outputlist && item.szsbrecord.outputlist.outputlist1) {
          const list = item.szsbrecord.outputlist.outputlist1
          list.forEach(v => {
            if (v.aka111 === '06' || v.aka111 === '07') {  // 检查治疗
              checkTotalPrice += v.bka058
            } else if (v.aka111 === '02') {
              westTotalPrice += v.bka058
            } else if (v.aka111 === '04') {
              zhongchengTotalPrice += v.bka058
            } else if (v.aka111 === '03' || v.aka111 === '05') {
              zhongcaoTotalPrice += v.bka058
            } else {
              otherTotalPrice += v.bka058
            }
          })
        }
      })
      if (type === 2) {  // 退费
        checkTotalPrice = -checkTotalPrice
        westTotalPrice = - westTotalPrice
        zhongchengTotalPrice = - zhongchengTotalPrice
        zhongcaoTotalPrice = - zhongcaoTotalPrice
        otherTotalPrice = - otherTotalPrice
        printSbTotal = - printSbTotal
        printsbCash = - printsbCash
        printSbAccount = - printSbAccount
        printSbJijin = - printSbJijin
      }
      this.$set(printData, 'checkTotalPrice', checkTotalPrice)
      this.$set(printData, 'westTotalPrice', westTotalPrice)
      this.$set(printData, 'zhongchengTotalPrice', zhongchengTotalPrice)
      this.$set(printData, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
      this.$set(printData, 'otherTotalPrice', otherTotalPrice)
      this.$set(printData, 'printSbTotal', printSbTotal)
      this.$set(printData, 'printsbCash', printsbCash)
      this.$set(printData, 'printSbAccount', printSbAccount)
      this.$set(printData, 'printSbJijin', printSbJijin)
      this.$store.commit('user/SET_FEE_PRINT', [printData])
      window.open('/print/fee-print-2')
    },
    // 非社保收据
    normalPrint(type) {
      const printData = {}
      this.$set(printData, 'type', type)
      this.$set(printData, 'name', this.feeMsg.name)
      this.$set(printData, 'liushui', this.feeMsg.registid)
      this.$set(printData, 'danju', this.feeMsg.chargeid)
      let printSbTotal = 0
      let reduce = this.feeMsg.reduceprice
      // 药品
      let checkTotalPrice = 0
      let westTotalPrice = 0
      let zhongchengTotalPrice = 0
      let zhongcaoTotalPrice = 0
      let otherTotalPrice = 0
      this.normalItems.forEach(item => {
        printSbTotal += item.total_price
        if (item.chargetype === 3) {    // 检验检查
          checkTotalPrice += item.total_price
        } else if (item.chargetype === 4 || item.chargetype === 6 || item.chargetype === 7) {   // 其他
          otherTotalPrice += item.total_price
        } else if (item.chargetype === 2) {   // 处方
          item.data.drug_list.forEach(drug => {
            if (drug.druginfo.drugclass === '1') {  // 西药
              westTotalPrice += drug.total_price
            } else if (drug.druginfo.drugclass === '2') {  // 中成药
              zhongchengTotalPrice += drug.total_price
            } else if (drug.druginfo.drugclass === '3' || drug.druginfo.drugclass === '4') {
              zhongcaoTotalPrice += drug.total_price
            }
          })
        }
      })
      if (type === 2) {  // 退费
        checkTotalPrice = -checkTotalPrice
        westTotalPrice = - westTotalPrice
        zhongchengTotalPrice = - zhongchengTotalPrice
        zhongcaoTotalPrice = - zhongcaoTotalPrice
        otherTotalPrice = - otherTotalPrice
        printSbTotal = - printSbTotal
        reduce = -reduce
      }
      this.$set(printData, 'checkTotalPrice', checkTotalPrice)
      this.$set(printData, 'westTotalPrice', westTotalPrice)
      this.$set(printData, 'zhongchengTotalPrice', zhongchengTotalPrice)
      this.$set(printData, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
      this.$set(printData, 'otherTotalPrice', otherTotalPrice)
      this.$set(printData, 'printSbTotal', printSbTotal)
      this.$set(printData, 'printsbCash', printSbTotal - reduce)
      this.$set(printData, 'printSbAccount', 0)
      this.$set(printData, 'printSbJijin', 0)
      this.$store.commit('user/SET_FEE_PRINT', [printData])
      window.open('/print/fee-print-2')
    },
    // 发票补打
    // 1 社保
    sheBaoBillPrint() {
      const printData = {}
      this.$set(printData, 'type', 1)
      this.$set(printData, 'isSb', true)  // 是否社保
      this.$set(printData, 'deptname', this.feeMsg.deptname)
      this.sbItems = this.sbItems.sort((a, b) => b.szsbrecord.personleftbp - b.szsbrecord.personleftbp)
      const personleftbp = this.sbItems[0].szsbrecord.personleftbp
      const personleft = this.sbItems[this.sbItems.length - 1].szsbrecord.personleft
      this.$set(printData, 'name', this.sbItems[0].szsbrecord.patientname)
      this.$set(printData, 'liushui', this.feeMsg.registid)
      this.$set(printData, 'danju', this.feeMsg.chargeid)
      this.$set(printData, 'yiliaoCard', this.sbItems[0].szsbrecord.yiliaohao)
      this.$set(printData, 'computerCard', this.sbItems[0].szsbrecord.diannaohao)
      this.$set(printData, 'personleftbp', personleftbp)
      this.$set(printData, 'personleft', personleft)
      // 药品
      let checkTotalPrice = 0
      let westTotalPrice = 0
      let zhongchengTotalPrice = 0
      let zhongcaoTotalPrice = 0
      let otherTotalPrice = 0
      // 支付组成
      let printSbTotal = 0
      let printsbCash = 0
      let printSbAccount = 0
      let printSbJijin = 0
      this.sbItems.forEach(item => {
        printSbTotal += item.szsbrecord.total
        printsbCash += item.szsbrecord.personpay
        printSbAccount += item.szsbrecord.personaccount
        printSbJijin += item.szsbrecord.jijinpay
        if (item.szsbrecord.outputlist && item.szsbrecord.outputlist.outputlist1) {
          const list = item.szsbrecord.outputlist.outputlist1
          list.forEach(v => {
            if (v.aka111 === '06' || v.aka111 === '07') {  // 检查治疗
              checkTotalPrice += v.bka058
            } else if (v.aka111 === '02') {
              westTotalPrice += v.bka058
            } else if (v.aka111 === '04') {
              zhongchengTotalPrice += v.bka058
            } else if (v.aka111 === '03' || v.aka111 === '05') {
              zhongcaoTotalPrice += v.bka058
            } else {
              otherTotalPrice += v.bka058
            }
          })
        }
      })
      this.$set(printData, 'checkTotalPrice', checkTotalPrice)
      this.$set(printData, 'westTotalPrice', westTotalPrice)
      this.$set(printData, 'zhongchengTotalPrice', zhongchengTotalPrice)
      this.$set(printData, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
      this.$set(printData, 'otherTotalPrice', otherTotalPrice)
      this.$set(printData, 'printSbTotal', printSbTotal)
      this.$set(printData, 'printsbCash', printsbCash)
      this.$set(printData, 'printSbAccount', printSbAccount)
      this.$set(printData, 'printSbJijin', printSbJijin)
      this.$store.commit('user/SET_FEE_PRINT', [printData])
      window.open('/print/bill-print')
    },
    // 2 自费项
    normalBillPrint() {
      const printData = {}
      this.$set(printData, 'type', 1)
      this.$set(printData, 'isSb', false)  // 是否社保
      this.$set(printData, 'deptname', this.feeMsg.deptname)
      this.$set(printData, 'name', this.feeMsg.name)
      this.$set(printData, 'liushui', this.feeMsg.registid)
      this.$set(printData, 'danju', this.feeMsg.chargeid)
      let printSbTotal = 0
      const reduce = this.feeMsg.reduceprice
      // 药品
      let checkTotalPrice = 0
      let westTotalPrice = 0
      let zhongchengTotalPrice = 0
      let zhongcaoTotalPrice = 0
      let otherTotalPrice = 0
      this.normalItems.forEach(item => {
        printSbTotal += item.total_price
        if (item.chargetype === 3) {    // 检验检查
          checkTotalPrice += item.total_price
        } else if (item.chargetype === 4 || item.chargetype === 6 || item.chargetype === 7) {   // 其他
          otherTotalPrice += item.total_price
        } else if (item.chargetype === 2) {   // 处方
          item.data.drug_list.forEach(drug => {
            if (drug.druginfo.drugclass === '1') {  // 西药
              westTotalPrice += drug.total_price
            } else if (drug.druginfo.drugclass === '2') { // 中成药
              zhongchengTotalPrice += drug.total_price
            } else if (drug.druginfo.drugclass === '3' || drug.druginfo.drugclass === '4') {
              zhongcaoTotalPrice += drug.total_price
            }
          })
        }
      })
      this.$set(printData, 'checkTotalPrice', checkTotalPrice)
      this.$set(printData, 'westTotalPrice', westTotalPrice)
      this.$set(printData, 'zhongchengTotalPrice', zhongchengTotalPrice)
      this.$set(printData, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
      this.$set(printData, 'otherTotalPrice', otherTotalPrice)
      this.$set(printData, 'printSbTotal', printSbTotal)
      this.$set(printData, 'printsbCash', printSbTotal - reduce)
      this.$set(printData, 'printSbAccount', 0)
      this.$set(printData, 'printSbJijin', 0)
      this.$store.commit('user/SET_FEE_PRINT', [printData])
      window.open('/print/bill-print')
    },
    // 限制退费价格输入
    returnPriceLimit() {  // 限制数字输入
      this.realReturnFee = floatLimit(this.realReturnFee, 2)
    },
    // 获取费用信息
    getFeeDetail(chargeid) {
      service(backFeeDetail, {
        chargeid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.feeMsg = res || {}
          // 为每条记录设置选中状态，方便后面勾选
          if (!this.feeMsg.items) {
            return
          }
          this.feeMsg.items.forEach((elem, index) => {
            this.$set(this.feeMsg.items[index], 'isChecked', false)
          })
          // 记录设置是否禁用(不能退费的需要禁用)
          this.setDisabled()
        }
      })
    },
    // 设置每条记录是否可以退费
    setDisabled() {
      if (!this.feeMsg.items) {
        return
      }
      this.feeMsg.items.forEach((item, index) => {
        let canBackFee = false
        if (item.chargetype === 1) {
          canBackFee = (item.data.feestatus === 1)
            && (item.data.status === 1 || item.data.status === 4)
        } else if (item.chargetype === 2 || item.chargetype === 5) {
          canBackFee = item.data.status === 1 || item.data.status === 3
        } else {
          canBackFee = item.data.status === 1
        }
        this.$set(this.feeMsg.items[index], 'canBackFee', canBackFee)
      })
    },
    // 是否选中所有
    handleCheckAllChange(isCheckAll) {
      if (!this.feeMsg.items) {
        return isCheckAll
      }
      this.feeMsg.items.forEach((elem, index) => {
        if (elem.canBackFee) {
          this.feeMsg.items[index].isChecked = isCheckAll
        }
      })
    },
    // 选中或取消单个
    selectOneItem(check, index) {
      this.feeMsg.items[index].isChecked = check
    },
    cancelFee() {
      this.$router.push({ path: '/pay-charges/child/pay-charges-history' })
    },
    // 是否退费
    async isBackFee() {
      // 如果需要调社保客户端退费
      if (this.sbClientList.length) {
        // 检查是否连接社保
        const flag = await connection()
        if (flag !== '1') {
          return
        }
        this.$confirm('当前退费为不可逆动作，是否退费？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.sheBaoBackFee(this.sbClientList, 0)
        }).catch()
        return
      }
      // 如果退费金额未填，不允许退费
      if (this.feeMsg.paymethod !== 5 && !this.realReturnFee) {
        this.$message.error({
          message: '请填写退费金额',
          duration: 1000,
          showClose: true
        })
        return
      }
      // 如果退费金额超出总金额，将阻止
      const realReturnFee = this.realReturnFee ? parseFloat(this.realReturnFee) : 0
      if (realReturnFee > this.totalPrice) {
        this.$message.error({
          message: '退费金额不能大于实际金额',
          duration: 1000,
          showClose: true
        })
        return
      }
      this.$confirm('当前退费为不可逆动作，是否退费？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.getNeedBackFeeList()
      }).catch()
    },
    // 整理退费条目
    getNeedBackFeeList() {
      // 添加退费条目
      const list = []
      this.selectedItems.forEach(element => {
        const obj = {}
        obj.chargetype = element.chargetype
        obj.paymethod = element.paymethod
        if (element.chargetype === 1) {
          obj.chargetypeid = element.data.registid
        } else if (element.chargetype === 2) {
          obj.chargetypeid = element.data.prescript_id
        } else if (element.chargetype === 3 || element.chargetype === 4 || element.chargetype === 6 || element.chargetype === 7) {
          obj.chargetypeid = element.data.diagn_chargitem_id
        } else if (element.chargetype === 5) {
          obj.chargetypeid = element.data.drug_sales_id
        }
        if (element.paymethod === 5) {
          const record = element.szsbrecord
          record.chargestatus = new Date(element.szsbrecord.szsbtime).getMonth() === new Date().getMonth() ? 2 : 3
          obj.szsbrecord = record
          obj.total_price = element.szsbrecord.total
        } else {
          obj.total_price = element.total_price
        }
        list.push(obj)
      })
      this.backFee(list)
    },
    // 退费请求
    backFee(needBackFeeList) {
      let total = parseFloat(this.totalPrice)
      let realReturn = parseFloat(this.realReturnFee)  // 实退金额
      const discount = parseFloat(this.feeMsg.reduceprice)  // 退费时应当去掉折扣
      let paymethod = 1
      // 存在社保退费
      if (this.feeMsg.paymethod === 5) {
        realReturn = parseFloat(this.personalFee)
        paymethod = 5
        total = parseFloat(this.totalPrice2)
      }
      service(payedRefund, {
        patientid: this.feeMsg.patientid,
        registid: this.feeMsg.registid,
        totalprice: total,
        realprice: realReturn,
        reduceprice: discount,
        paymethod: paymethod,  // 一期默认现金方式退费
        payprice: realReturn,
        items: [...needBackFeeList]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message.success({ message: '退费成功', duration: 1000, showClose: true })
          this.back()
        }
      })
    },
    // 社保退费
    sheBaoBackFee(list, index) {
      service(jycancel, {
        transBody: {
          akc190: this.feeMsg.registid,
          bke384: list[index].szsbrecord.jigousn
        }
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
        } else if (index < list.length - 1) {
          this.sheBaoBackFee(list, index + 1)
        } else {
          this.getNeedBackFeeList()
        }
      })
    }
  },
  filters: {
    indexFilter(id, type, list) {
      // 设置处方index
      if (!list) {
        return
      }
      // 筛选出处方
      const preceptionList = list.filter(obj => obj.chargetype === 2) || []
      // 找出对应类型的处方
      const curTypePreceptionList = preceptionList.filter(obj => obj.data.prescript_type === type) || []
      // 找出该类型处方的下标
      const index = curTypePreceptionList.findIndex(obj => obj.data.prescript_id === id) || 0
      return index + 1
    },
    // 挂号项费用状态
    registFeeStatus(status) {
      return status === 1 ? '已收费' : status === 2 ? '已退费' : ''
    },
    // 挂号项接诊状态
    registStatus(status) {
      switch (status) {
        case 1:
          return '等待接诊'
        case 2:
          return '诊断中，不可退费'
        case 3:
          return '完成，不可退费'
        case 4:
          return '已取消'
        case 5:
          return '已失效'  
      }
    },
    // 处方签状态
    prescriptStatus(status) {
      switch (status) {
        case 1:
          return '已收费'
        case 2:
          return '未退药，不可退费'
        case 3:
          return '已退药'
        case 4:
          return '已退费'
      }
    },
    // 其他状态
    otherStatus(status) {
      switch (status) {
        case 1:
          return '已收费'
        case 2:
          return '已使用，不可退费'
        case 3:
          return '已退费'
      }
    },
    // 支付方式
    payMethod(pay) {
      const methods = [
        { index: 0, label: '其他' },
        { index: 1, label: '现金' },
        { index: 2, label: '银行卡' },
        { index: 3, label: '微信' },
        { index: 4, label: '支付宝' },
        { index: 5, label: '社保' }
      ]
      const method = methods.findIndex(obj => obj.index === pay)
      return method ? method.label : ''
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic']),
    checkAll: {
      get() {
        if (!this.feeMsg.items) {
          return true
        }
        return this.feeMsg.items.filter(obj => !obj.isChecked && obj.canBackFee).length === 0
      }
    },
    // 退费总金额
    totalPrice() {
      if (!this.feeMsg.items) {
        return 0
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.isChecked)
      let price = 0
      selectItems.forEach(obj => price += obj.total_price)
      return price.toFixed(2)
    },
    // 社保退费总金额
    totalPrice2() {
      if (!this.feeMsg.items) {
        return 0
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.isChecked)
      let price = 0
      selectItems.forEach(obj => price += obj.total_price)
      return price.toFixed(2)
    },
    // 选中的条目
    selectedItems() {
      if (!this.feeMsg.items) {
        return []
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.isChecked)
      return selectItems || []
    },
    // 社保费用
    sbFee() {
      if (this.feeMsg.paymethod !== 5) {
        return 0
      }
      if (!this.feeMsg.items) {
        return 0
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.isChecked && obj.paymethod === 5)
      let price = 0
      selectItems.forEach(obj => {
        const sheBao = obj.szsbrecord.total - obj.szsbrecord.personpay
        price += sheBao
      })
      return price.toFixed(2)
    },
    // 自费
    personalFee() {
      if (this.feeMsg.paymethod !== 5) {
        return 0
      }
      return (this.totalPrice2 - this.sbFee).toFixed(2)
    },
    // 需要走客户端退费的条目
    sbClientList() {
      if (this.feeMsg.paymethod !== 5) {
        return []
      }
      if (!this.feeMsg.items) {
        return []
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.isChecked && obj.paymethod === 5)
      return selectItems || []
    },
    // 社保部分(打印数据)
    sbItems: {
      get() {
        if (this.feeMsg.paymethod !== 5) {
          return []
        }
        if (!this.feeMsg.items) {
          return []
        }
        const selectItems = this.feeMsg.items.filter(obj => obj.paymethod === 5)
        return selectItems || []
      }
    },
    // 非社保部分(打印数据)
    normalItems() {
      if (!this.feeMsg.items) {
        return []
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.paymethod !== 5)
      return selectItems || []
    }
  },
  created() {
    const chargeid = this.$route.params.chargeid
    this.getFeeDetail(chargeid)
  }
}
</script>

<style lang="scss" scoped>
.returns-fee {
  margin-left: 30px;
  .header {
    color: #666;
  }
  .content {
    margin-top: 20px;
    width: 1130px;
    .title {
      background: #eee;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      font-weight: 700;
      .el-col:first-of-type {
        text-align: center;
      }
    }
    .fee-list {
      .el-row {
        padding: 15px 0;
        border-bottom: 1px dashed #ccc;
        .el-col:first-of-type { 
          text-align: center; 
        }
      }
    }
  }
  .footer {
    padding-top: 30px;
    .price-bold {
      color: #f00;
      font-size: 18px;
      font-weight: 600;
    }
    .real-return-fee {
      width: 200px;
    }
    .operation {
      margin-top: 20px;
      .warn {
        line-height: 32px;
        color: #f00;
      }
    }
  }
}
</style>

