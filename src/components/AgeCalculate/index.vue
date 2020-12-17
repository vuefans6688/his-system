<template>
  <div class="age-calculate">
    <el-form :model="old" size="small">
      <el-form-item prop="age">
        <el-input placeholder="请输入您的岁数" v-model="old.age" @keyup.native="intLimitAge('age')" @blur="calculateBirth" :maxlength="3"></el-input>
      </el-form-item>
      <el-form-item prop="month">
        <el-input placeholder="请输入您的出生月份" v-model="old.month" @keyup.native="intLimitAge('month', 12)" @blur="calculateBirth" :maxlength="2"></el-input>
      </el-form-item>
      <el-form-item prop="birth">
        <el-date-picker style="width: 100%;" placeholder="请选择出生日期" v-model="old.birth" type="date" @change="handleBirth" :editable="false" :clearable="false" :picker-options="pickerOptions"></el-date-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { intLimit } from '@/utils/inputLimit'
import { getCurrentMonthDays } from '@/utils/ageTransfer'
export default {
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          const date = new Date()
          return time.getTime() > new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        }
      }
    }
  },
  props: {
    old: {
      type: Object,
      default() {
        return {
          age: 0,
          month: 0,
          birth: ''
        }
      }
    }
  },
  methods: {
    getAge() {
      return this.old.age || null
    },
    getMonthes() {
      return this.old.month || null
    },
    getBirth() {
      return this.old.birth || new Date()
    },
    // 计算生日
    calculateBirth() {  
      const date = new Date()
      const year = date.getFullYear() - this.getAge()
      const month = date.getMonth() - this.getMonthes()
      if (month < 0) {
        month += 12
        year -= 1
      }
      this.old.birth = new Date(year, month, date.getDate())
    },
    // 根据生日计算岁数
    handleBirth() {  
      if (this.getBirth() > new Date()) {
        this.old.birth = ''
        return
      }
      this.old.age = new Date().getFullYear() - this.getBirth().getFullYear()
      this.old.month = new Date().getMonth() - this.getBirth().getMonth()
      const totalDay = new Date().getDate() - this.getBirth().getDate()
      // 获取当前月天数
      const currentYear = parseInt(this.getBirth().getFullYear(), 10)
      const currentMonth = parseInt(this.getBirth().getMonth() + 1, 10)
      const currentDay = getCurrentMonthDays(currentMonth, currentYear)
      if (totalDay < 0) {
        totalDay += currentDay
        this.old.month -= 1
      }
      if (this.old.month < 0) {
        this.old.month += 12
        this.old.age -= 1
      }
    },
    intLimitAge(value, limit) {
      this.old[value] = intLimit(this.old[value], limit)
    }
  }
}
</script>



