<template>
  <div class="pay-detail">
    <el-row class="header">
      <el-col :span="6">
        <p>客户姓名: {{ feeMsg.name }}</p>
        <p>客户手机: {{ feeMsg.phone }}</p>
      </el-col>
      <el-col :span="6">
        <p>性别: {{ feeMsg.gender | sexFilter }}</p>
        <p v-if="feeMsg.birthdate">年龄: {{ feeMsg.birthdate | dateFilter }}</p>
      </el-col>
      <el-col :span="6">
        <p>就诊编号: {{ feeMsg.registid }}</p>
        <p>就诊科室: {{ feeMsg.deptname }}</p>
      </el-col>
      <el-col :span="6">
        <p>就诊医师: {{ feeMsg.doctorname }}</p>
      </el-col>
    </el-row>
    <div class="content">
      <el-row class="title">
        <el-col :span="1">
          <el-checkbox v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
        </el-col>
        <el-col :span="5">收费项目</el-col>
        <el-col :span="6">单价</el-col>
        <el-col :span="6">数量</el-col>
        <el-col :span="6">金额（元）</el-col>
      </el-row>
      <div class="fee-list" v-for="(item, index) in feeMsg.items" :key="index">
        <el-row v-if="item.type === 1" v-show="false">
          <el-col :span="1">
            <el-checkbox v-model="item.isChecked" disabled></el-checkbox>
          </el-col>
          <el-col :span="5">{{ item.data.feename }}</el-col>
          <el-col :span="6">{{ item.data.feeprice | priceFilter }}元</el-col>
          <el-col :span="6">1{{ item.data.feeunit }}</el-col>
          <el-col :span="6">{{ item.data.feeprice | priceFilter }}元</el-col>
        </el-row>
        <div v-if="item.type === 2">
          <el-row>
            <el-col :span="1">
              <el-checkbox v-model="item.isChecked" @change="selectOneItem($event, index)"></el-checkbox>
            </el-col>
            <el-col :span="23">
              <span v-if="item.data.prescript_type === 1">西药处方{{ item.data.prescript_id | indexFilter(1, feeMsg.items) }}</span>
              <span v-if="item.data.prescript_type === 2">中药处方{{ item.data.prescript_id | indexFilter(2, feeMsg.items) }}</span>
              <span v-if="item.data.prescript_type === 3">输液处方{{ item.data.prescript_id | indexFilter(3, feeMsg.items) }}</span>
            </el-col>
          </el-row>
          <el-row v-for="(drug_item, index2) in item.data.drug_list" :key="index2">
            <el-col :span="4">{{ drug_item.name }}</el-col>
            <el-col :span="5">{{ drug_item.price | priceFilter }}元
              <span v-if="item.data.prescript_type === 1">/{{ drug_item.total_unit }}</span>
              <span v-if="item.data.prescript_type === 2">/{{ drug_item.price_unit }}</span>
              <span v-if="item.data.prescript_type === 3">/{{ drug_item.total_unit }}</span>
              <span v-if="item.data.prescript_type === 2">({{ drug_item.spec_text }})</span>
            </el-col>
            <el-col :span="5">
              <span v-show="item.data.prescript_type === 2">
                {{ drug_item.dosage }}{{ drug_item.dose_unit }} *
              </span>
              <span>{{ drug_item.total }}{{ drug_item.total_unit }}</span>
            </el-col>
            <el-col :span="5">{{ drug_item.total_price | priceFilter }}元</el-col>
          </el-row>
          <el-row>
            <el-col :span="5">合计: {{ item.data.total_price | priceFilter }} 元</el-col>
          </el-row> 
        </div> 
        <div v-else>
          <el-row>
            <el-col :span="1">
              <el-checkbox v-model="item.isChecked" @change="selectOneItem($event, index)"></el-checkbox>
            </el-col>
            <el-col :span="5">{{ item.data.name }}</el-col>
            <el-col :span="6">{{ item.data.price | priceFilter }}元</el-col>
            <el-col :span="6">{{ item.data.total }} {{ item.data.total_unit }}</el-col>
            <el-col :span="6">{{ item.data.total_price | priceFilter }}元</el-col>
          </el-row>
        </div> 
      </div>
    </div>
    <div class="footer">
      <span class="total">累计消费金额: </span>
      <span class="money">￥{{ totalPrice | priceFilter }}元</span>
      <p class="right">
        <el-button type="primary" size="small" @click="showCharge">收费</el-button>
        <el-button type="warning" size="small" @click="back">返回</el-button> 
      </p>
    </div>
    <pay v-if="isShowCharge" :chargeList="selectedChargeItems" @isCharge="isCharge" @hisChargeRegist="getFeeDetail"></pay>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pay from '@/components/Pay'
import deepClone from '@/utils/deepClone'
import { calculateFromBirth } from '@/utils/ageTransfer'
import { feeDetail } from '@/serve/api'
import service from '@/utils/request'
export default {
  components: { Pay },
  data() {
    return {
      feeMsg: {},
      isShowCharge: false,    // 收费窗口
      selectedChargeItems: {}
    }
  },
  methods: {
    // 返回待收费列表
    back() {
      this.$router.replace({ path: '/pay-charges/child/pay-charges-list' })
    },
    // 弹出收费
    showCharge() {
      this.$set(this.feeMsg, 'total_price', this.totalPrice)
      // 剔除没有选中的条目
      this.deleteNoSelect()
      this.isShowCharge = true
    },
    // 剔除没有勾选的
    deleteNoSelect() {
      if (!this.feeMsg.items) {
        return
      }
      const list = deepClone(this.feeMsg.items)
      const targetArr = list.filter(obj => obj.isChecked)
      this.selectedChargeItems = deepClone(this.feeMsg)
      this.selectedChargeItems.items = targetArr
    },
    isCharge(flag) {
      // 取消收费
      if (flag === 'cancel') {
        this.isShowCharge = false
      } else if (flag === 'success') {  // 收费成功
        this.$message.success({
          message: '收费成功',
          duration: 1000,
          showClose: true
        })
        this.isShowCharge = false
        setTimeout(() => {
          this.back()
        }, 1000)
      }
    },
    // 是否选中所有
    handleCheckAllChange(isCheckAll) {
      if (!this.feeMsg.items) {
        return isCheckAll
      }
      this.feeMsg.items.forEach((elem, index) => {
        if (this.feeMsg.items[index].type !== 1) {
          this.feeMsg.items[index].isChecked = isCheckAll
        }
      })
    },
    // 选中或取消单个
    selectOneItem(check, index) {
      this.feeMsg.items[index].isChecked = check
    },
    // 获取收费详情
    getFeeDetail() {
      const registid = this.$route.params.registid
      service(feeDetail, {
        registid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.feeMsg = res
          // 为每条记录设置选中状态，方便后面勾选
          if (!this.feeMsg.items) {
            return
          }
          this.feeMsg.items.forEach((elem, index) => {
            this.$set(this.feeMsg.items[index], 'isChecked', true)
          })
        }
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic']),
    checkAll: {
      get() {
        if (!this.feeMsg.items) {
          return true
        }
        return this.feeMsg.items.filter(obj => obj.isChecked === false).length === 0
      }
    },
    totalPrice() {
      if (!this.feeMsg.items) {
        return 0
      }
      const selectItems = this.feeMsg.items.filter(obj => obj.isChecked)
      let price = 0
      selectItems.forEach(obj => {
        if (obj.data.feeprice || obj.data.feeprice === 0) {
          price += obj.data.feeprice
        } else {
          price += obj.data.total_price
        }
      })
      return price
    }
  },
  created() {
    this.getFeeDetail()
  },
  filters: {
    indexFilter(id, type, list) {
      // 设置处方下标
      if (!list) {
        return
      }
      // 筛选出处方
      const preceptionList = list.filter(obj => obj.type === 2) || []
      // 找出对应类型的处方
      const curTypePreceptionList = preceptionList.filter(obj => obj.data.prescript_type === type) || []
      // 找出该类型处方的下标
      const index = curTypePreceptionList.findIndex(obj => obj.data.prescript_id === id) || 0
      return index + 1
    }
  }
}
</script>

<style lang="scss" scoped>
.pay-detail {
  margin-left: 30px;
  .header {
    width: 1130px;
    padding-bottom: 8px;
    color: #666;
    border-bottom: 1px dashed #ddd;
  }
  .content {
    margin-top: 30px;
    width: 1130px;
    .title {
      height: 40px;
      line-height: 40px;
      background: #eee;
      .el-col:first-of-type {
        text-align: center;
      }
    }
    .fee-list {
      .el-row {
        padding: 15px 0;
        border-bottom: 1px dashed #ddd;
        .el-col:first-of-type {
          text-align: center; 
        }
      }
    }
  }
  .footer {
    margin-top: 30px;
    .total {
      color: #666;
      margin-left: 20px;
    }
    .money {
      color: red;
      font-size: 18px;
      font-weight: bold;
    }
    .right {
      display: flex;
      justify-content: center;
    }
  }
}
</style>

