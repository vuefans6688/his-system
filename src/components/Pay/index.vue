<template>
  <div class="pay">
    <div class="container" v-show="!sheBaoInput.show">
      <div class="close" @click="cancelCharge">
        <i class="el-icon-close"></i>
      </div>
      <h3 class="title">收费信息</h3>
      <div class="content">
        <p>收费机构: {{ chargeList.clinic }}</p>
        <p v-if="!socialSecurityPay.isChekced">总金额: ￥{{ chargeList.total_price | priceFilter }}元</p>
        <p v-else>总金额: ￥{{ sheBaoTotalPrice | priceFilter }}元</p>
        <p class="reduction" v-show="!socialSecurityPay.isChekced">
          <strong style="color: #f00;">减免金额: </strong>
          <el-input :class="{'red-border': showRedBorder}" v-model="payObj.discount" 
            @keyup.native="numberLimit('discount')" size="small" style="width: 460px;">
          </el-input>
          <span style="margin-left: 10px;">元</span>
        </p>
        <div class="other" v-show="isSocialSecuritySupport">
          <el-checkbox v-model="socialSecurityPay.isChekced" @change="selectSheBao">
            {{ socialSecurityPay.label }}
          </el-checkbox>
          <p v-show="socialSecurityPay.isChekced">
            <strong>{{ socialSecurityPay.label }}: </strong>
            <el-input v-model="socialSecurityPay.price" disabled size="small" style="width: 460px;"></el-input>
            <span v-if="socialSecurityPay.readCardStatus === 2" style="margin-left: 10px;">元</span>
            <el-button v-if="socialSecurityPay.readCardStatus === 0" @click="sheBaoInput.show = true" type="primary" size="small">
              读卡
            </el-button>
            <el-button v-else type="primary" size="small" :loading="true">读卡中</el-button>
          </p>
          <p v-if="socialSecurityPay.readCardStatus === 2 && socialSecurityPay.isChekced">
            社保卡余额: <strong>{{ baseInfo.aae240 }}</strong>元
          </p>
          <p v-if="socialSecurityPay.readCardStatus === 2 && socialSecurityPay.isChekced">
            持卡人姓名: <strong>{{ baseInfo.aac003 }}</strong>
          </p>
          <p v-if="socialSecurityPay.readCardStatus === 2 && socialSecurityPay.isChekced">
            自费部分: <strong>{{ cashPay }}</strong>元
          </p>
        </div>
        <p v-show="!socialSecurityPay.isChekced">
          应收: ￥<strong>{{ needPay }}</strong>元
        </p>
        <p v-show="!socialSecurityPay.isChekced">
          <span class="method" v-show="!socialSecurityPay.isChekced">支付方式: </span>
          <el-radio-group v-model="payMethod" size="small">
            <el-radio :label="1" border>现金</el-radio>
            <el-radio :label="2" border>银行卡</el-radio>
            <el-radio :label="3" border>微信支付</el-radio>
            <el-radio :label="4" border>支付宝支付</el-radio>
          </el-radio-group>
        </p>
        <p>
          <strong style="color: #f00;">实收金额: </strong>
          <el-input :class="{'red-border': showRedBorder}" v-model="payObj.realPay" 
            @keyup.native="numberLimit('realPay')" size="small" style="width: 460px;">
          </el-input>
          <span style="margin-left: 10px;">元</span>
        </p>
         <p>找零: ￥<strong> {{ change }}</strong>元</p> 
      </div>
      <div class="footer">
        <!-- 非社保支付 -->
        <el-checkbox v-if="!socialSecurityPay.isChekced" v-model="isNormalChargePrint">收据打印</el-checkbox>
        <!-- 社保支付 -->
        <el-checkbox v-if="socialSecurityPay.isChekced && (sheBaoPrescriptList.length || sheBaoChargeItems.length)" v-model="sheBaoChargePrint">社保项打印</el-checkbox>
        <el-checkbox v-if="socialSecurityPay.isChekced && (normalPrescriptList.length || normalChargeItems.length)" v-model="sheBaoChargeNormal">自费项打印</el-checkbox>
        <p class="action">
          <el-button type="primary" size="small" @click="submit" :disabled="chargeDisable" :loading="chargeDisable">收费</el-button>
          <el-button size="small" @click="cancelCharge">取消</el-button>
        </p>
      </div>
    </div>
    <div class="progress" v-if="sheBaoInput.show">
      <div class="close" @click="sheBaoInput.show = false">
        <i class="el-icon-close"></i>
      </div>
      <she-bao-loading class="loading" @getPersonDetailInfo="readCard" @readFailed="keepReading = false" :keepReading="keepReading"></she-bao-loading>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { floatLimit } from '@/utils/inputLimit'
import connection from '@/common/connection'
import { getClinicName, chargeForHIS, receiveTreatment, registrationTryChargeUrl, registrationChargeUrl, cfadd, cfcancel, fyshisuan, fyjiesuan, cfquery } from '@/serve/api'
import service from '@/utils/request'
import SheBaoLoading from '@/components/SheBaoLoading'
const UnloadConfirm = {}
export default {
  data() {
    return {
      isSocialSecuritySupport: false,
      socialSecurityPay: {
        label: '社保支付',
        isChekced: false,
        price: 0,
        readCardStatus: 0  // 0未读卡 1读卡中 2读卡完成
      },
      cashPay: 0,  // 自费部分
      sheBaoInput: {  // 社保卡密码
        show: false,
        password: '000000'
      },
      baseInfo: {  // 社保个人信息
        aac003: '',  // 持卡人姓名
        aae240: ''  // 个人账户余额
      },
      theCode: '',  // 定点协议机构编码
      aka130: '11',  // 医疗类别 '11'=普通门诊
      aka030: '12',  // 结算类别 '12'=个人医疗费本地联网结算
      ckc601: '0',  // 医保费用先行支付记账资格 '1'=已申请先行支付 '0'=非先行支付
      // 社保收费项
      sheBaoRegist: {},  // 社保挂号项
      normalRegist: {},  // 非社保挂号
      sheBaoPrescriptList: [],  // 社保处方
      normalPrescriptList: [],  // 自费处方
      sheBaoChargeItems: [],  // 社保收费项目
      normalChargeItems: [],  // 自费诊疗项目
      payObj: {
        discount: '',    // 减免金额
        realPay: ''    // 实收费用
      },
      payMethod: 1,   // 支付方式
      isNormalChargePrint: true,   // 非社保支付打印
      sheBaoChargePrint: true,     // 社保支付打印(社保部分)
      sheBaoChargeNormal: true,   // 社保支付打印(非社保部分)
      chargeDisable: false,   // 是否禁用收费按钮
      startToCompute: false,  // 计算余额是否可以支付
      showRedBorder: false,  // 余额不足以支付时，显示红色边框
      keepReading: false,
      printSbTotal: 0,
      printsbCash: 0,
      printSbAccount: 0,
      printSbJijin: 0,
      sheBaoItems: []
    }
  },
  methods: {
    // 获取诊所名
    getClinicName() {  
      service(getClinicName).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$set(this.printData, 'clinicName', res.clinic_name)
        }
      })
    },
    // 收费状态。cancel: 取消支付 success: 收费成功 error: 收费失败
    isCharge(status) {
      this.$emit('isCharge', status)
    },
    numberLimit(str) {  // 限制数字输入
      this.payObj[str] = floatLimit(this.payObj[str], 2)
    },
    submit() {
      // 点击收费后，需禁用收费按钮，防止再次发送收费请求
      this.chargeDisable = true
      if (this.socialSecurityPay.isChekced) {
        // 没有试算，无法结算
        if (this.socialSecurityPay.readCardStatus !== 2) {
          this.chargeDisable = false
          this.$message.error({ duration: 1500, message: '社保支付请先读卡' })
          return
        }
        if (this.change === '') {
          this.chargeDisable = false
          this.$message.error({ message: '支付金额不足, 请加收金额', duration: 2000, showClose: true })
          this.startToCompute = true
          this.showRedBorder = true
          return
        }
        if (this.cashPay < 0) {
          this.chargeDisable = false
          this.$message.error({ message: '费用错误', duration: 2000, showClose: true })
          return
        }
        if (this.sheBaoPrescriptList.length) {
          this.prescriptionCharge(this.sheBaoPrescriptList, 0)
        } else if (this.sheBaoChargeItems.length) {
          this.itemsCharge(this.sheBaoChargeItems, 0)
        } else {
          this.hisCharge()
        }
        return
      }
      if (this.change === '') {
        this.$message.error({
          message: '支付金额不足, 请加收金额或设置折扣',
          duration: 2000,
          showClose: true
        })
        this.chargeDisable = false
        this.startToCompute = true
        this.showRedBorder = true
        return
      }
      // 添加收费条目
      const list = []
      this.chargeList.items.forEach(element => {
        const obj = {}
        obj.chargetype = element.type
        if (element.type === 1) {
          obj.chargetypeid = element.data.registid
        } else if (element.type === 2) {
          obj.chargetypeid = element.data.prescript_id
        } else if (element.type === 3 || element.type === 4 || element.type === 6 || element.type === 7) {
          obj.chargetypeid = element.data.diagn_chargitem_id
        }
        if (!(this.socialSecurityPay.readCardStatus === 2 && element.type === 1)) {
          list.push(obj)
        }
      })
      this.sendChargeRequest(list)
    },
    // 取消收费
    cancelCharge() {
      this.isCharge('cancel')
      // 关闭窗口。如果有录入的处方，需取消
      if (this.socialSecurityPay.readCardStatus === 2) {
        // 状态为2代表读卡完成 录入工作已完成
        this.chargeFail()
        this.$emit('hisChargeRegist')  // 挂号项已收费
      }
    },
    // 发送收费请求
    sendChargeRequest(needChargeList) {
      const needPay = parseFloat(this.needPay)
      const discount = this.payObj.discount ? parseFloat(this.payObj.discount) : 0
      service(chargeForHIS, {
        clinicid: this.clinic,
        patientid: this.chargeList.patientid,
        registid: this.chargeList.registid,
        totalprice: parseFloat(this.chargeList.total_price.toFixed(2)),
        realprice: needPay,  // 实际支付金额(所有支付方式支付总和)
        reduceprice: discount,
        paymethod: this.payMethod,
        payprice: needPay,    // 实际付款金额
        items: [...needChargeList]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 收费成功
          this.$message.success({ message: '收费成功!', duration: 1000, showClose: true })
          if (this.isNormalChargePrint) {
            this.normalPayPrint(res.chargeid)
          }
          this.isCharge('success')
        } else {
          // 收费响应后，需解除收费按钮的禁用
          this.chargeDisable = false
        }
      }).catch(res => {
        this.$message.error({
          message: res,
          duration: 1000,
          showClose: true
        })
        this.chargeDisable = false
      })
    },
    normalPayPrint(danju) {
      const list = this.chargeList.items
      const data = {}
      this.$set(data, 'type', 1)
      this.$set(data, 'isSb', false)  // 是否是社保
      this.$set(data, 'deptname', this.chargeList.deptname)
      this.$set(data, 'name', this.chargeList.name)
      this.$set(data, 'liushui', this.chargeList.registid)
      this.$set(data, 'danju', danju)
      let printSbTotal = 0
      let reduce = this.payObj.discount || 0
      reduce = parseFloat(reduce)
      // 药品
      let checkTotalPrice = 0
      let westTotalPrice = 0
      let zhongchengTotalPrice = 0
      let zhongcaoTotalPrice = 0
      let otherTotalPrice = 0
      list.forEach(item => {
        if (item.type === 1) {
          return
        }
        printSbTotal += item.data.total_price
        if (item.type === 3) {    // 检验检查
          checkTotalPrice += item.data.total_price
        } else if (item.type === 4 || item.type === 6 || item.type === 7) {   // 其他
          otherTotalPrice += item.data.total_price
        } else if (item.type === 2) {   // 处方
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
      this.$set(data, 'checkTotalPrice', checkTotalPrice)
      this.$set(data, 'westTotalPrice', westTotalPrice)
      this.$set(data, 'zhongchengTotalPrice', zhongchengTotalPrice)
      this.$set(data, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
      this.$set(data, 'otherTotalPrice', otherTotalPrice)
      this.$set(data, 'printSbTotal', printSbTotal)
      this.$set(data, 'reduce', reduce)
      this.$set(data, 'printsbCash', printSbTotal - reduce)
      this.$set(data, 'printSbAccount', 0)
      this.$set(data, 'printSbJijin', 0)
      this.$store.commit('user/SET_FEE_PRINT', [data])
      window.open('/print/bill-print')
    },
    sheBaoPrint(danju) {
      const sbPrintData = {}
      const normalPrintData = {}
      const printList = []
      if (this.sheBaoChargePrint && (this.sheBaoPrescriptList.length || this.sheBaoChargeItems.length)) {
        this.$set(sbPrintData, 'type', 1)  // 1 收费 2 退费
        this.$set(sbPrintData, 'isSb', true)  // 是否社保
        this.$set(sbPrintData, 'deptname', this.chargeList.deptname)
        const sbItemAfterPay = this.sheBaoItems[this.sheBaoItems.length - 1]
        this.$set(sbPrintData, 'name', this.baseInfo.aac003)
        this.$set(sbPrintData, 'liushui', this.chargeList.registid)
        this.$set(sbPrintData, 'danju', danju)
        this.$set(sbPrintData, 'yiliaoCard', this.baseInfo.aaz500)
        this.$set(sbPrintData, 'computerCard', this.baseInfo.aac999)
        this.$set(sbPrintData, 'personleft', sbItemAfterPay.szsbrecord.personleft)
        this.$set(sbPrintData, 'personleftbp', this.sheBaoItems[0].szsbrecord.personleftbp)
        // 检查治疗 type = 3
        let checkTotalPrice = 0
        this.chargeList.items.forEach(item => {
          if (item.type === 3 && item.data.item.szsbcode && item.data.item.szsbstatus === 1) {
            checkTotalPrice += item.data.szsbtotalprice
          }
        })
        this.$set(sbPrintData, 'checkTotalPrice', checkTotalPrice)
        // 处方 type = 2
        let westTotalPrice = 0
        let zhongchengTotalPrice = 0
        let zhongcaoTotalPrice = 0
        const prescripts = this.chargeList.items.filter(item => item.type === 2) || []
        prescripts.forEach(prescript => {
          prescript.data.drug_list.forEach(drug => {
            if (drug.druginfo.ake001 && drug.druginfo.szsbstatus === 1) {
              // 社保药
              if (drug.druginfo.drugclass === '1') {  // 西药
                westTotalPrice += drug.druginfo.shebao_price * drug.total
              } else if (drug.druginfo.drugclass === '2') {  // 中成药
                zhongchengTotalPrice += drug.druginfo.shebao_price * drug.total
              } else if (drug.druginfo.drugclass === '3' || drug.druginfo.drugclass === '4') {
                zhongcaoTotalPrice += drug.druginfo.shebao_price * drug.total * drug.dosage
              }
            }
          })
        })
        this.$set(sbPrintData, 'westTotalPrice', westTotalPrice)
        this.$set(sbPrintData, 'zhongchengTotalPrice', zhongchengTotalPrice)
        this.$set(sbPrintData, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
        // 其他收费
        let otherTotalPrice = 0
        this.chargeList.items.forEach(item => {
          if ((item.type === 4 || item.type === 6 || item.type === 7) && item.data.item.szsbcode && item.data.item.szsbstatus === 1) {
            otherTotalPrice += item.data.szsbtotalprice
          }
        })
        this.$set(sbPrintData, 'otherTotalPrice', otherTotalPrice)
        this.$set(sbPrintData, 'printSbTotal', this.printSbTotal)
        this.$set(sbPrintData, 'printsbCash', this.printsbCash)
        this.$set(sbPrintData, 'printSbAccount', this.printSbAccount)
        this.$set(sbPrintData, 'printSbJijin', this.printSbJijin)
        printList.push(sbPrintData)
      }
      if (this.sheBaoChargeNormal && (this.normalPrescriptList.length || this.normalChargeItems.length)) {
        this.$set(normalPrintData, 'type', 1)
        this.$set(normalPrintData, 'isSb', false)  // 是否社保
        this.$set(normalPrintData, 'deptname', this.chargeList.deptname)
        this.$set(normalPrintData, 'name', this.chargeList.name)
        this.$set(normalPrintData, 'liushui', this.chargeList.registid)
        this.$set(normalPrintData, 'danju', danju)
        let totalPrice = 0
        // 检查治疗 type = 3
        let checkTotalPrice = 0
        this.normalChargeItems.forEach(item => {
          if (item.type === 3) {
            totalPrice += item.data.total_price
            checkTotalPrice += item.data.total_price
          }
        })
        this.$set(normalPrintData, 'checkTotalPrice', checkTotalPrice)
        // 处方 type = 2
        let westTotalPrice = 0
        let zhongchengTotalPrice = 0
        let zhongcaoTotalPrice = 0
        this.normalPrescriptList.forEach(prescript => {
          totalPrice += prescript.total_price
          prescript.data.drug_list.forEach(drug => {
            if (drug.druginfo.drugclass === '1') {  // 西药
              westTotalPrice += drug.total_price
            } else if (drug.druginfo.drugclass === '2') {  // 中成药
              zhongchengTotalPrice += drug.total_price
            } else if (drug.druginfo.drugclass === '3' || drug.druginfo.drugclass === '4') {
              zhongcaoTotalPrice += drug.total_price
            }
          })
        })
        this.$set(normalPrintData, 'westTotalPrice', westTotalPrice)
        this.$set(normalPrintData, 'zhongchengTotalPrice', zhongchengTotalPrice)
        this.$set(normalPrintData, 'zhongcaoTotalPrice', zhongcaoTotalPrice)
        // 其他收费
        let otherTotalPrice = 0
        this.normalChargeItems.forEach(item => {
          if (item.type === 4 || item.type === 6 || item.type === 7) {
            totalPrice += item.data.total_price
            otherTotalPrice += item.data.total_price
          }
        })
        this.$set(normalPrintData, 'otherTotalPrice', otherTotalPrice)
        this.$set(normalPrintData, 'printSbTotal', totalPrice)
        this.$set(normalPrintData, 'printsbCash', totalPrice)
        printList.push(normalPrintData)
      }
      if (printList.length) {
        this.$store.commit('user/SET_FEE_PRINT', printList)
        window.open('/print/bill-print')
      }
    },
    // 社保处理。 读卡->挂号试算->处方录入->处方试算->收费项录入->收费项试算->处方取消(如需要)->收费项取消(如需要)->挂号结算->处方结算->收费项结算
    // 勾选社保支付后，需连接测试
    async selectSheBao(isSelected) {
      if (isSelected) {
        const flag = await connection().catch(() => {
          this.socialSecurityPay.isChekced = false
        })
        if (flag !== '1') {
          this.socialSecurityPay.isChekced = false
        }
      }
    },
    // 分类
    classify() {
      // 收费项
      const items = this.chargeList.items || []
      // 社保是否包含挂号
      this.sheBaoRegist = items.find(item => item.type === 1) || {}
      // 处方分类
      const prescripts = items.filter(item => item.type === 2)
      prescripts.forEach(prescript => {
        const isContainSbDrug = prescript.data.drug_list.some(drug => drug.druginfo.ake001 && drug.druginfo.szsbstatus === 1)
        if (isContainSbDrug) {
          this.sheBaoPrescriptList.push(prescript)  // 社保处方
        } else {
          this.normalPrescriptList.push(prescript)  // 非社保处方
        }
      })
      // 社保收费项目
      this.sheBaoChargeItems = items.filter(item => {
        return (item.type === 3 || item.type === 4 || item.type === 6 || item.type === 7) &&
        (item.data.item && item.data.item.szsbcode && item.data.item.szsbstatus === 1) && 
        item.data.item.szsbprice > 0
      })
      this.normalChargeItems = items.filter(item => {
        return (item.type === 3 || item.type === 4 || item.type === 6 || item.type === 7) &&
        !(item.data.item && item.data.item.szsbcode && item.data.item.szsbstatus === 1) && 
        item.data.item.szsbprice > 0
      })
    },
    // 读卡
    readCard(info) {
      this.socialSecurityPay.readCardStatus = 1
      this.baseInfo = info
      this.keepReading = true
      if (this.sheBaoRegist.data) {
        this.registrationTryCharge()
      } else {
        // 无挂号项
        this.afterRegistCharge()
      }
    },
    // 挂号结算之后的处理
    afterRegistCharge() {
      if (this.sheBaoPrescriptList.length) {
        this.prescriptionRead(this.sheBaoPrescriptList, 0)
      } else if (this.sheBaoChargeItems.length) {
        this.chargeItemsRead(this.sheBaoChargeItems, 0)
      } else {
        this.afterTryCharge()
      }
    },
    // 挂号试算
    registrationTryCharge() {
      // 挂号item
      const registItem = this.sheBaoRegist.data
      const data = {
        akc190: registItem.registid,
        aka130: this.aka130,
        akf001: this.chargeList.szsbdeptcode,
        bkc368: registItem.bkc368,
        akc264: 0,
        listsize: 0,
        inputlist: []
      }
      service(registrationTryChargeUrl, {
        transBody: data
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 正确的处理
          this.$set(this.sheBaoRegist, 'tryChargeData', res.transBody)
          this.registrationCharge()
        } else {
          this.reset()
        }
      })
    },
    // 挂号结算
    async registrationCharge() {
      const regist = this.sheBaoRegist.data
      let seriesCode = this.theCode + new Date().format('yyyyMMddhhmmssS')
      if (this.seriesCode === seriesCode) {
        await this.delay(200)
        seriesCode = this.theCode + new Date().format('yyyyMMddhhmmssS')
      }
      this.$store.commit('user/SET_SERIES_CODE', seriesCode)
      this.$set(this.sheBaoRegist, 'bke384', seriesCode)
      const data = {
        akc190: regist.registid,
        bzz269: this.sheBaoInput.password,
        aka130: this.aka130,
        akf001: this.chargeList.szsbdeptcode,
        bkc368: regist.bkc368,
        bke384: seriesCode,
        akc264: 0,
        listsize: 0,
        inputlist: []
      }
      if (!regist.szsbprice) {
        delete data.listsize
        delete data.inputlist
      }
      service(registrationChargeUrl, {
        transBody: data
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 正确的处理
          this.$set(this.sheBaoRegist, 'chargeData', res.transBody)
          this.$set(this.sheBaoRegist, 'transTime', res.transTime)
          this.savePaientRecord()
          // 客户端结算之后his单独收费挂号
          this.hisChargeRegist()
        } else {
          this.reset()
        }
      })
    },
    // 接诊
    savePaientRecord() {
      service(receiveTreatment, {
        transBody: {
          akc190: this.chargeList.registid,
          czy201: parseInt(new Date(new Date().getTime() - (1000 * 60 * 10)).format('yyyyMMddhhmmss'), 10),
          akf001: this.chargeList.szsbdeptcode,
          bkc320: this.chargeList.szsbdoctorcode,
          bkc275: this.chargeList.szsbdoctorname
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 接诊完之后调处方录入
          this.afterRegistCharge()
        } else {
          this.reset()
        }
      })
    },
    // 试算完成之后的处理
    afterTryCharge() {
      this.sheBaoInput.show = false
      this.socialSecurityPay.readCardStatus = 2
      this.keepReading = false
      // 社保处方计算
      this.sheBaoPrescriptList.forEach(prescript => {
        const sbPay = prescript.tryChargeData.akc264 - prescript.tryChargeData.akb067
        const cashPay = prescript.data.szsbtotalprice - sbPay
        this.socialSecurityPay.price += sbPay
        this.cashPay += cashPay
        // 处理打印数据
        this.printSbTotal += prescript.tryChargeData.akc264
        this.printsbCash += prescript.tryChargeData.akb067
        this.printSbAccount += prescript.tryChargeData.akb066
        this.printSbJijin += prescript.tryChargeData.akb068
      })
      // 自费处方计算
      this.normalPrescriptList.forEach(prescript => this.cashPay += prescript.data.total_price)
      // 社保诊疗项目计算
      this.sheBaoChargeItems.forEach(item => {
        const sbPay = item.tryChargeData.akc264 - item.tryChargeData.akb067
        const cashPay = item.data.szsbtotalprice - sbPay
        this.socialSecurityPay.price += sbPay
        this.cashPay += cashPay
        // 处理打印数据
        this.printSbTotal += item.tryChargeData.akc264
        this.printsbCash += item.tryChargeData.akb067
        this.printSbAccount += item.tryChargeData.akb066
        this.printSbJijin += item.tryChargeData.akb068
      })
      // 非社保诊疗项计算
      this.normalChargeItems.forEach(item => this.cashPay += item.data.total_price)
      this.cashPay = this.cashPay.toFixed(2)
    },
    // 延时工具函数
    delay(timeout) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, timeout)
      })
    },
    // 处方录入(收费项目)
    async prescriptionRead(list, index) {
      let seriesCode = this.theCode + new Date().format('yyyyMMddhhmmssS')
      if (this.seriesCode === seriesCode) {
        await this.delay(200)
        seriesCode = this.theCode + new Date().format('yyyyMMddhhmmssS')
      }
      this.$store.commit('user/SET_SERIES_CODE', seriesCode)
      this.$set(list[index], 'bke384', seriesCode)
      const prescript = list[index].data
      const sbDrugList = []
      prescript.drug_list.forEach((drug, drugIndex) => {
        const createTime = `20${drug.druginfo.create_time}`
        if (drug.druginfo.ake001 && drug.druginfo.szsbstatus === 1) {
          const total = prescript.prescript_type === 2 ? drug.total * drug.dosage / drug.druginfo.specs.unit_primary.specs_unit : drug.total
          const drugItem = {
            aae072: prescript.danju,
            bkc369: '1',
            bkf500: `yb${drugIndex}`,
            ake001: drug.druginfo.ake001,
            ake002: drug.druginfo.product_name,
            bkm017: drug.druginfo.standard_number,
            ake005: drug.druginfo.ake001,
            ake006: drug.druginfo.product_name,
            aka070: drug.druginfo.dosage_type,
            aka074: drug.druginfo.aka074,
            akc225: drug.druginfo.shebao_price,
            akc226: total,
            akc264: parseFloat((drug.druginfo.shebao_price * total).toFixed(2)),
            aka067: drug.druginfo.specs.unit_large.specs_name,
            akc271: parseInt(createTime.substr(0, 4) + createTime.substr(4, 2) + createTime.substr(6, 2), 10),
            bkc320: prescript.doctorszsbid
          }
          sbDrugList.push(drugItem)
        }
      })
      const cfAddData = {
        akc190: prescript.regist_id,
        bke384: seriesCode,
        listsize: sbDrugList.length,
        inputlist: sbDrugList
      }
      service(cfadd, {
        transBody: cfAddData
      }).then(res => {
        if (typeof res === 'string' && res.include('ERRORCODE')) {
          // 处方录入失败(需要取消已经录入成功的处方)
          this.reset()
          if (index > 0) {  // 前面有录入成功的处方
            this.prescriptionCanael(list, index - 1)
          }
        } else if (index < list.length - 1) {
          // 当前处方录入成功 并且还有处方需要录入
          setTimeout(() => {
            this.prescriptionRead(list, index + 1)
          }, 200)
        } else {
          // 所有处方录入成功,调处方试算
          this.prescriptionTryChage(list, 0)
        }
      })
    },
    // 处方取消
    prescriptionCanael(list, index) {
      const prescript = list[index].data
      const data = {
        akc190: prescript.regist_id,
        bke384: list[index].bke384,
        listsize: 0,
        inputlist: []
      }
      service(cfcancel, {
        transBody: data
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 处方取消失败
          this.prescriptionCanael(list, index)
        } else if (index > 0) {  // 处方取消成功 并且还有需要取消的处方
          this.prescriptionCanael(list, index - 1)
        } else {
          // 处方全部取消
          this.reset()
        }
      })
    },
    // 收费项目录入
    async chargeItemsRead(list, index) {
      const chargeItem = list[index].data
      let seriesCode = this.theCode + new Date().format('yyyyMMddhhmmssS')
      if (this.seriesCode === seriesCode) {
        await this.delay(200)
        seriesCode = this.theCode + new Date().format('yyyyMMddhhmmssS')
      }
      this.$store.commit('user/SET_SERIES_CODE', seriesCode)
      this.$set(list[index], 'bke384', seriesCode)
      const createTime = `20${chargeItem.item.create_time}`
      const cfAddData = {
        akc190: chargeItem.regist_id,
        bke384: seriesCode,
        listsize: 1,
        inputlist: [
          {
            aae072: chargeItem.danju,
            bkc369: '1',
            bkf500: `sf${index}`,
            ake001: chargeItem.item.szsbcode,
            ake002: chargeItem.item.szsbname,
            ake005: chargeItem.item.szsbcode,
            ake006: chargeItem.item.szsbname,
            aka067: chargeItem.total_unit,
            akc225: chargeItem.item.szsbprice,
            akc226: chargeItem.total,
            akc264: parseFloat((chargeItem.item.szsbprice * chargeItem.total).toFixed(2)),
            akc271: parseInt(createTime.substr(0, 4) + createTime.substr(4, 2) + createTime.substr(6, 2), 10),
            bkc320: this.chargeList.szsbdoctorcode
          }
        ]
      }
      service(cfadd, {
        transBody: cfAddData
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 收费项目录入失败(需要取消已经录入成功的收费项目)
          this.reset()
          if (index > 0) {  // 前面有录入成功的收费项目
            this.chargeItemsCancel(list, index - 1)
          }
        } else if (index < list.length - 1) {
          // 当前收费项目录入成功 并且还有收费项目需要录入
          setTimeout(() => {
            this.chargeItemsRead(list, index + 1)
          }, 200)
        } else {
          // 所有收费项目录入成功,调收费项目试算
          this.chargeItemsTryChage(list, 0)
        }
      })
    },
    // 收费项目取消
    chargeItemsCancel(list, index) {
      const item = list[index].data
      const data = {
        akc190: item.regist_id,
        bke384: list[index].bke384,
        listsize: 0,
        inputlist: []
      }
      service(cfcancel, {
        transBody: data
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 收费项目取消失败
          this.chargeItemsCancel(list, index)
        } else if (index > 0) {  // 收费项目取消成功 并且还有需要取消的收费项目
          this.chargeItemsCancel(list, index - 1)
        } else {
          // 收费项目全部取消
          this.reset()
        }
      })
    },
    // 处方试算
    prescriptionTryChage(list, index) {
      const prescript = list[index].data
      let totalprice = 0
      prescript.drug_list.forEach(drug => {
        if (drug.druginfo.ake001 && drug.druginfo.szsbstatus === 1) {
          const total = prescript.prescript_type === 2 ? drug.total * drug.dosage / drug.druginfo.specs.unit_primary.specs_unit : drug.total
          totalprice += total * drug.druginfo.shebao_price
        }
      })
      const data = {
        akc190: prescript.regist_id,
        aka130: this.aka130,
        bkc320: prescript.doctorszsbid,
        ckc350: prescript.doctorszsbname,
        aka030: this.aka030,
        akc264: parseFloat(totalprice.toFixed(2)),
        ckc601: this.ckc601,
        bke384: list[index].bke384
      }
      service(fyshisuan, {
        transBody: data
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 处方试算失败
          this.reset()
          this.prescriptionCanael(list, list.length - 1)  // 取消全部处方
        } else {
          // 当前处方试算成功
          this.$set(list[index], 'tryChargeData', res.transBody)
          if (index < list.length - 1) {
            // 试算下一条
            this.prescriptionTryChage(list, index + 1)
          } else if (this.sheBaoChargeItems.length) {
            // 所有处方试算完成// 有收费项目需要录入
            this.chargeItemsRead(this.sheBaoChargeItems, 0)
          } else {
            this.afterTryCharge()
          }
        }
      })
    },
    // 收费项试算
    chargeItemsTryChage(list, index) {
      const item = list[index].data
      const data = {
        akc190: item.regist_id,
        aka130: this.aka130,
        bkc320: this.chargeList.szsbdoctorcode,
        ckc350: this.chargeList.szsbdoctorname,
        aka030: this.aka030,
        akc264: parseFloat((item.item.szsbprice * item.total).toFixed(2)),
        ckc601: this.ckc601,
        bke384: list[index].bke384
      }
      service(fyshisuan, {
        transBody: data
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 处方试算失败
          this.reset()
          this.chargeItemsCancel(list, list.length - 1)
        } else {
          // 当前收费项试算成功
          this.$set(list[index], 'tryChargeData', res.transBody)
          if (index < list.length - 1) {
            // 试算下一条
            this.chargeItemsTryChage(list, index + 1)
          } else {
            this.afterTryCharge()
          }
        }
      })
    },
    // 处方结算
    prescriptionCharge(list, index) {
      const prescript = list[index].data
      let totalprice = 0
      prescript.drug_list.forEach(drug => {
        if (drug.druginfo.ake001 && drug.druginfo.szsbstatus === 1) {
          const total = prescript.prescript_type === 2 ? drug.total * drug.dosage / drug.druginfo.specs.unit_primary.specs_unit : drug.total
          totalprice += total * drug.druginfo.shebao_price
        }
      })
      const data = {
        akc190: prescript.regist_id,
        aka130: this.aka130,
        bkc320: prescript.doctorszsbid,
        ckc350: prescript.doctorszsbname,
        aka030: this.aka030,
        akc264: parseFloat(totalprice.toFixed(2)),
        ckc601: this.ckc601,
        bke384: list[index].bke384
      }
      service(fyjiesuan, {
        transBody: data
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 处方结算失败
          this.chargeFail()
        } else {
          // 当前处方结算成功
          this.$set(list[index], 'chargeData', res.transBody)
          this.$set(list[index], 'transTime', res.transTime)
          if (index < list.length - 1) {  // 还有处方需要结算
            this.prescriptionCharge(list, index + 1)
          } else {
            if (this.sheBaoChargeItems.length) {
              // 所有处方结算成功。包含诊疗项目，需进行诊疗项目结算
              this.itemsCharge(this.sheBaoChargeItems, 0)
            } else {
              this.hisCharge()
            }
          }
        }
      })
    },
    // 收费项结算
    itemsCharge(list, index) {
      const item = list[index].data
      const data = {
        akc190: item.regist_id,
        aka130: this.aka130,
        bkc320: this.chargeList.szsbdoctorcode,
        ckc350: this.chargeList.szsbdoctorname,
        aka030: this.aka030,
        akc264: parseFloat((item.item.szsbprice * item.total).toFixed(2)),
        ckc601: this.ckc601,
        bke384: list[index].bke384
      }
      service(fyjiesuan, {
        transBody: data
      }).then(res => {
        if (typeof res === 'string' && res.includes('ERRORCODE')) {
          // 诊疗项结算失败
          this.chargeFail()
        } else {
          // 当前收费项结算成功
          this.$set(list[index], 'chargeData', res.transBody)
          this.$set(list[index], 'transTime', res.transTime)
          if (index < list.length - 1) {
            // 结算成功，结算下一条
            this.itemsCharge(list, index + 1)
          } else {
            this.hisCharge()
          }
        }
      })
    },
    // his系统后台结算
    hisCharge() {
      this.detailQuery()
      // 添加收费条目
      const list = []
      this.chargeList.items.forEach(element => {
        if (element.type === 1) {
          return
        }
        const obj = {}
        obj.chargetype = element.type
        if (element.type === 2) {
          obj.chargetypeid = element.data.prescript_id
        } else if (element.type === 3 || element.type === 4 || element.type === 6 || element.type === 7) {
          obj.chargetypeid = element.data.diagn_chargitem_id
        }
        obj.total_price = element.data.szsbtotalprice
        obj.paymethod = element.bke384 ? 5 : this.payMethod
        const outputlist = {}
        let szsbtime = ''
        if (element.bke384) {
          szsbtime = element.transTime.split(':')[0]
          if (element.chargeData.outputlist) {
            this.$set(outputlist, 'outputlist', element.chargeData.outputlist)
          }
          if (element.chargeData.outputlist1) {
            this.$set(outputlist, 'outputlist1', element.chargeData.outputlist1)
          }
          if (element.chargeData.outputlist2) {
            this.$set(outputlist, 'outputlist2', element.chargeData.outputlist2)
          }
          if (element.chargeData.outputlist3) {
            this.$set(outputlist, 'outputlist3', element.chargeData.outputlist3)
          }
        }
        obj.szsbrecord = element.bke384 ? {
          shebaosn: element.chargeData.ckc618,
          liushui: obj.chargetypeid,
          jigousn: element.bke384,
          chargetype: element.type,
          aka130: this.aka130,
          aka030: this.aka030,
          total: element.chargeData.akc264,
          jijinpay: element.chargeData.akb068,
          personaccount: element.chargeData.akb066,
          personpay: element.chargeData.akb067,
          personleft: element.chargeData.aae240,
          personleftbp: this.baseInfo.aae240,
          szsbtime: parseFloat(szsbtime),
          chargestatus: 1,
          outputlist: outputlist,
          clinicid: this.clinic,
          patientname: this.baseInfo.aac003,
          yiliaohao: this.baseInfo.aaz500,
          diannaohao: this.baseInfo.aac999,
        } : {}
        list.push(obj)
      })
      this.sheBaoItems = list
      const data = {
        cashierid: this.user.userid,
        cashier: this.user.truename,
        PatientName: this.chargeList.name,
        paymethod: 5,
        clinicid: this.clinic,
        patientid: this.chargeList.patientid,
        registid: this.chargeList.registid,
        totalprice: parseFloat(this.sheBaoTotalPrice),
        realprice: parseFloat(this.sheBaoTotalPrice),  // 实际支付金额(所有支付方式支付总和)
        reduceprice: 0,
        payprice: parseFloat(this.sheBaoTotalPrice),    // 实际付款金额
        items: list
      }
      service(chargeForHIS, data).then(res => {
        this.chargeDisable = false
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 收费成功
          this.$message.success({ message: '收费成功!', duration: 1000, showClose: true })
          if (this.sheBaoChargePrint || this.sheBaoChargeNormal) {
            this.sheBaoPrint(res.chargeid)
          }
          this.isCharge('success')
        }
      }).catch(res => {
        this.$message.error({ message: res, duration: 1000, showClose: true })
        this.chargeDisable = false
      })
    },
    // 客户端结算之后his单独收费挂号
    hisChargeRegist() {
      const list = []
      const obj = {}
      obj.chargetype = this.sheBaoRegist.type
      obj.chargetypeid = this.sheBaoRegist.data.registid
      obj.total_price = this.sheBaoRegist.data.szsbprice
      obj.paymethod = 5
      const outputlist = {}
      if (this.sheBaoRegist.chargeData.outputlist) {
        this.$set(outputlist, 'outputlist', this.sheBaoRegist.chargeData.outputlist)
      }
      if (this.sheBaoRegist.chargeData.outputlist2) {
        this.$set(outputlist, 'outputlist2', this.sheBaoRegist.chargeData.outputlist2)
      }
      obj.szsbrecord = {}
      list.push(obj)
      const data = {
        cashierid: this.user.userid,
        cashier: this.user.truename,
        PatientName: this.chargeList.name,
        paymethod: 5,
        clinicid: this.clinic,
        patientid: this.chargeList.patientid,
        registid: this.chargeList.registid,
        totalprice: this.sheBaoRegist.data.szsbprice,
        realprice: this.sheBaoRegist.data.szsbprice,  // 实际支付金额(所有支付方式支付总和)
        reduceprice: 0,
        payprice: this.sheBaoRegist.data.szsbprice,   // 实际付款金额
        items: list
      }
      service(chargeForHIS, data)
    },
    // 交易明细查询
    detailQuery() {
      service(cfquery, {
        transBody: {
          akc190: this.chargeList.registid
        }
      })
    },
    // 录入、试算、结算失败的重置
    reset() {
      this.sheBaoInput.show = false
      this.socialSecurityPay.price = 0
      this.socialSecurityPay.readCardStatus = 0
    },
    // 结算失败
    chargeFail() {
      if (this.sheBaoPrescriptList.length) {
        this.prescriptionCanael(this.sheBaoPrescriptList, this.sheBaoPrescriptList.length - 1)
      }
      if (this.sheBaoChargeItems.length) {
        this.chargeItemsCancel(this.sheBaoChargeItems, this.sheBaoChargeItems.length - 1)
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'user', 'shebao', 'seriesCode']),
    needPay() {
      const discount = this.payObj.discount ? parseFloat(this.payObj.discount) : 0
      const total = parseFloat(this.chargeList.total_price)
      const needPay = total - discount
      return needPay < 0 ? 0 : needPay.toFixed(2)
    },
    change() {
      let exchange = ''
      const realPay = this.payObj.realPay ? parseFloat(this.payObj.realPay) : 0
      if (this.socialSecurityPay.isChekced) {
        exchange = realPay - this.cashPay
      } else {
        const needPay = this.needPay
        exchange = realPay - needPay
      }
      return exchange < 0 ? '' : exchange.toFixed(2)
    },
    // 社保总价
    sheBaoTotalPrice() {
      const items = this.chargeList.items || []
      let price = 0
      items.forEach(obj => {
        if (obj.type === 1) {
          price += obj.data.szsbprice
        } else {
          price += obj.data.szsbtotalprice
        }
      })
      return price.toFixed(2)
    }
  },
  props: {
    chargeList: {
      type: Object
    }
  },
  watch: {
    payObj: {
      handler() {
        // 折扣不能大于总价
        const total = parseFloat(this.chargeList.total_price)
        const discount = this.payObj.discount ? parseFloat(this.payObj.discount) : 0
        if (discount > total) {
          this.$message({
            type: 'error',
            message: '减免金额不能大于总金额',
            duration: 1000,
            showClose: true
          })
          this.payObj.discount = ''
          return
        }
        if (this.change !== '' && this.startToCompute) {
          this.showRedBorder = false
        }
      },
      deep: true
    }
  },
  components: { SheBaoLoading },
  created() {
    UnloadConfirm.MessageUnload = '您确定要离开吗？'
    UnloadConfirm.set = a => {
      window.onbeforeunload = b => {
        this.cancelCharge()
        b = b || window.event;
        b.returnValue = a
        return a
      }
    }
    UnloadConfirm.clear = () => {
      window.onbeforeunload = () => {}
    }
  },
  mounted() {
    UnloadConfirm.set(UnloadConfirm.MessageUnload)
    // 判断是否对接医保
    if (this.shebao && this.shebao.hospitalCode) {
      this.isSocialSecuritySupport = true
      this.theCode = this.shebao.hospitalCode
      this.classify()
    }
  },
  destroyed() {
    UnloadConfirm.clear()
  }
}
</script>

<style lang="scss" scoped>
// 支付模态框
.pay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: rgba(7, 17, 27, 0.7);
  overflow: auto;
  .container {
    position: absolute;
    padding: 30px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    min-width: 650px;
    .close {
      position: absolute;
      right: 20px;
      top: 20px;
      padding: 6px;
      font-size: 20px;
      cursor: pointer;
    }
  }
  .container {
    top: 100px;
    transform: translate(-50%, 0);
    padding: 30px 40px;
    min-height: 400px;
    .content {
      .red-border {
        border: 1px solid #f00;
        border-radius: 6px;
      }
    }
    .title {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
      color: #666;
    }
    .footer {
      margin-top: 20px;
      .action {
        text-align: center;
      }
    }
  }
  .progress {
    position: absolute;
    padding: 20px;
    background: #fff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .close {
      position: absolute;
      right: 20px;
      top: 20px;
      padding: 6px;
      font-size: 20px;
      cursor: pointer;
    }
    .loading {
      margin-top: 20px;
    }
  }
}
</style>
