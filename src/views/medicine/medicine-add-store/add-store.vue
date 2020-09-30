<template>
  <div class="add-store">
    <div class="header">
      <el-button type="primary" size="small" @click="goBack">返回</el-button>
      <el-button type="success" size="small" @click="putInStore">入库</el-button>
    </div>
    <div class="content">
      <span>开单日期: </span>
      <el-date-picker v-model="billingDate" type="date" size="small" readonly></el-date-picker>
      <span class="voucher">制单人: {{ voucher }}</span>
      <span class="supplier">供应商: </span>
      <el-select v-model="userData.suppliers" placeholder="请选择" size="small">
        <el-option v-for="item in suppliersList" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <span class="order-number">入库单号: {{ receiptNum }}</span>
      <common-medicine @listenToChildEvent="showChildMessage" @send="getSend"></common-medicine>
    </div>
  </div>
</template>

<script>
import service from '@/utils/request'
import { drugBuyin, supplierquerylist } from '@/serve/api'
import { mapGetters } from 'vuex'
import connectionTest from '@/common/connection'
import CommonMedicine from '../../common-medicine'
export default {
  components: { CommonMedicine },
  data() {
    return {
      receiptNum: '',  // 入库单号
      voucher: '',  // 制单人
      money: '',  // 总金额
      billingDate: new Date(),  // 开单日期
      // 供应商
      suppliersList: [],
      // 用户输入数据
      userData: {
        suppliers: '',
        ret: ''
      },
      // 子组件传过来判断药品列表是否为空的信息
      childMessage: '',
      dataList: '',  // 子组件传过来的药品数组
      arr2: [],  // 用作存剩下的药品数组
      inputList: [],  // 传到社保的药品数组
      sheBaoToday: new Date()  // 传到社保的时间
    }
  },
  methods: {
    getSend(data) {
      this.dataList = data
    },
    // 子组件的信息赋值
    showChildMessage(data) {
      this.childMessage = data
    },
    goBack() {
      this.$router.back()
    },
    // 点击入库
    putInStore() {
      if (this.childMessage === '0') {
        this.$alert('请添加药品！', '提示', {
          confirmButtonText: '确定',
          callback: () => {}
        })
      } else {
        this.$confirm('是否确认药品信息已审核，药品入库后将不能修改', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
          center: true
        }).then(async () => {
          let flag = false
          this.dataList.forEach(value => {
            if (value.ake001) {
              flag = true
            }
          })
          if (flag === true) {
            const a = await connectionTest()
            if (a === '1') {
              this.makeSheBaoList()
              if (this.inputList.length > 50) {
                const arrInside = this.inputList.slice(0, 49)
                const arr2Inside = this.inputList.slice(50)
                this.arr2 = arr2Inside
                this.ToSocialSecurity(arrInside)
              } else {
                this.ToSocialSecurity(this.inputList)
                this.arr2 = []
              }
            } else {
              this.addStore()
            }
          } else {
            this.addStore()
          }
        }).catch()
      }
    },
    // 创建社保需要的入库药品数组
    makeSheBaoList() {
      const inputList = []
      this.dataList.forEach(val => {
        if (val.ake001 && val.ake001 !== '' && val.szsbstatus === 1) {
          const obj = {
            push_id: Number(val.push_id),  // 批号
            shelves_record_id: val.purchase_sn,  // 进货单号或进货序列号
            standard_code: val.standardnumber,  // 药品本位码
            drug_code: val.ake001,  // 药品编码
            drug_name: val.product_name,  // 药品名称
            std: val.aka074,  // 规格
            unit: val.count_ulname,  // 药库单位
            numbers: val.count_ulunit,  // 药库单位数量
            bid: val.shebao_price,  // 进价
            retail_price: val.shebao_price,  // 零售价
            bid_amount: val.shebao_price * val.count_ulunit,  // 进价金额
            retail_amount: val.shebao_price * val.count_ulunit,  // 零价金额
            shelvestime: Number(this.sheBaoToday),  // 进药日期
            acceptime: Number(new Date().format('yyyyMMddhhmmss')),  // 验收时间
            proc_type: '2',  // 采购类型代码(1网上采购 2医院（药店）临购)
            last_editedtime: Number(val.last_edit_time)  // pos机最后编辑时间
          }
          inputList.push(obj)
          this.inputList = inputList
        }
      })
    },
     // 分割药品数组并调社保客户端
    makeList(arr) {
      if (arr.length > 50) {
        const arrInside = arr.slice(0, 49)
        const arr2Inside = arr.slice(50)
        this.arr2 = arr2Inside
        this.ToSocialSecurity(arrInside)
      } else {
        this.ToSocialSecurity(arr)
        this.arr2 = []
      }
    },
    // 调社保客户端
    ToSocialSecurity(arr) {
      service(drugBuyin, {
        transBody: {
          listsize: arr.length,
          inputList: arr
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (this.arr2.length !== 0) {
            this.makeList(this.arr2)
          } else {
            this.addStore()
          }
        }
      })
    },
    // 调自己系统的入库接口
    addStore() {
      this.$http.post('/service/drug/purchrecodeupdate', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          purchase_sn: this.purchRecode.purchaseSn,
          supplier: this.userData.suppliers,
          batchid: this.userData.ret,
          itemstatus: 3,
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '入库成功！',
            type: 'success'
          })
          this.$router.back()
        } else if (res.data.errcode === 19) {
          this.$alert('请确认所有信息都已填', '提示', {
            confirmButtonText: '确定'
          })
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '入库失败！',
            type: 'error'
          })
        }
      }).catch()
    },
    // 获取供应商列表
    supplierList() {
      service(supplierquerylist, {
        pageid: 0,
        pagesize: 50
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res.context) {
            res.context.forEach(val => {
              this.suppliersList.push({ value: val.name, label: val.name })
            })
          }
        }
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'shebao', 'purchRecode'])
  },
  created() {
    const purch = this.purchRecode
    this.receiptNum = purch.purchaseSn
    this.voucher = purch.itemcreator
    if (purch.createtime) {
      this.sheBaoToday = Number('20' + purch.createtime.toString().substr(0, 6))
    } else {
      this.sheBaoToday = Number(new Date().format('yyyyMMdd'))
    }
    this.supplierList()
  }
}
</script>

<style lang="scss" scoped>
.header {
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
  margin-top: 20px;
  margin-left: 30px;
}
.content {
  margin-top: 20px;
  margin-left: 30px;
  color: #666;
  .voucher, .supplier, .order-number {
    margin-left: 20px;
  }
}
</style>
