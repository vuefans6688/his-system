<template>
  <div class="patient-list">
    <div class="wrapper">
      <span class="date">日期: </span>
      <el-date-picker v-model="value9" type="daterange" start-placeholder="开始日期" 
        end-placeholder="结束日期" default-value="2010-10-01" size="small" style="margin-left: 10px;">
      </el-date-picker>
      <span style="margin-left: 10px;">患者姓名/电话: </span>
      <el-input v-model="condition1" size="small" style="width: 280px;margin-left: 10px;"></el-input>
      <span style="margin-left: 10px;" v-show="way !== 'send'">发送状态: </span>
      <el-select v-model="condition2" placeholder="请选择状态" size="small" style="margin-left: 10px;">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <div style="margin-left: 10px;">
        <el-button type="primary" size="small">查询</el-button>
        <el-button type="primary" size="small" v-show="way === 'send'">发送短信</el-button>
      </div>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column prop="name" label="姓名" align="center"></el-table-column>
      <el-table-column prop="gender" label="性别" align="center"></el-table-column>
      <el-table-column prop="age" label="年龄" align="center"></el-table-column>
      <el-table-column prop="mobile" label="手机" align="center"></el-table-column>
      <el-table-column prop="content" label="短信内容" align="center"></el-table-column>
      <el-table-column prop="status" label="发送状态" align="center"></el-table-column>
      <el-table-column label="操作人" align="center"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value9: '',
      condition1: '',
      condition2: '',
      options: [
        {
          value: '选项1',
          label: '黄金糕'
        },
        {
          value: '选项2',
          label: '双皮奶'
        }
      ]
    }
  },
  props: {
    tableData: {
      type: Array,
      default() {
        return [
          {
            name: '',
            gender: 0,
            age: 0,
            mobile: '',
            content: '',
            date: '',
            status: '',
            oparator: ''
          }
        ]
      }
    },
    way: {
      type: String,
      default: 'send'
    }
  }
}
</script>

<style lang="scss" scoped>
.patient-list {
  margin-top: 20px;
  margin-left: 30px;
  .wrapper {
    display: flex;
    align-items: center;
    color: #666;
  }
  .el-table {
    margin-top: 20px;
    width: 100%;
  }
}
</style>
