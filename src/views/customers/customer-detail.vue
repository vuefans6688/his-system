<template>
  <div class="customer-detail">
    <div class="back">
      <router-link class="item" v-show="!isFromDoctorStation" to="/customers/customer-list">返回</router-link>
      <router-link class="item" v-show="isFromDoctorStation" to="/doctor-station/doctors">返回</router-link>
    </div>
    <div class="message">
      <span class="name">{{ customer.name }}</span>
      <span class="gender" v-if="customer.gender">-{{ customer.gender | sexFilter }}</span>
      <span class="age" v-if="customer.birthdate">-{{ age }}</span>
      <span class="phone" v-if="customer.phone">-{{ customer.phone }}</span>
    </div>
    <div class="control">
      <router-link class="wrapper" to="customer-info">客户信息</router-link>
      <router-link class="wrapper" to="visit-record">就诊记录</router-link>
      <router-link class="wrapper" to="follow-up-record">随访记录</router-link>
      <router-link class="wrapper" to="charge-record">收费记录</router-link>
    </div>
    <router-view :customer-id="customerId" @customerInfoUpdated="getCustomerInfo"></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { calculateFromBirth } from '@/utils/ageTransfer'
import { customerInfo } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      customer: {},
      isFromDoctorStation: false   // 若从医生工作站查看客户信息，需要先返回到医生工作站
    }
  },
  methods: {
    // 获取患者信息
    getCustomerInfo() {
      service(customerInfo, {
        patientid: this.customerId
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.customer = res.patient
        }
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'customerId']),
    age() {
      return calculateFromBirth(this.customer.birthdate)
    }
  },
  beforeDestroy() {
    this.$store.commit('user/SET_CUSTOMER_ID', '')
  },
  created() {
    this.isFromDoctorStation = this.$route.params.patientid
    this.getCustomerInfo()
  }
}
</script>

<style lang="scss" scoped>
.message {
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.back, .message, .control {
  width: 1200px;
  margin-top: 20px;
  margin-left: 30px;
  .item {
    width: 60px;
    display: inline-block;
    padding: 4px 6px;
    margin-right: 10px;
    border: 1px solid #09f;
    text-align: center;
    color: #fff;
    background: #09f;
  }
  span {
    font-size: 16px;
    color: #666;
  }
  .wrapper {
    padding: 4px 6px;
    margin-right: 10px;
    display: inline-block;
    border: 1px solid #09f;
    color: #09f;
    &.router-link-active, &:hover {
      background: #09f;
      color: #fff;
    }
  }
}
</style>

