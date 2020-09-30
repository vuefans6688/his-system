<template>
  <div class="project-apply">
    <div class="submit">
      <el-button size="small" type="primary" @click="submit">提交申请</el-button>
      <span style="color: #f00;">（没有社保编码的诊疗项无法进行社保备案）</span>
    </div>
    <el-form :model="ruleForm" ref="ruleForm" :inline-message="true" :show-message="false" size="small">
      <el-table :data="ruleForm.tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="szsbcode" label="诊疗项目统一编码" align="center"></el-table-column>
        <el-table-column prop="name" label="名称" align="center"></el-table-column>
        <el-table-column prop="unit" label="单位" align="center"></el-table-column>
        <el-table-column prop="price" label="销售价(元)" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.price | priceFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="szsbprice" label="社保价格" align="center" width="140">
          <template slot-scope="scope">
            <el-form-item :prop="'tableData.' + scope.$index +'.szsbprice'" :rules="[{ required: scope.row.needRules, trigger: 'change' }]">
              <el-input v-model="scope.row.szsbprice" @keyup.native="myPriceLimit('szsbprice', scope.$index)" style="width: 90px;margin-top: 20px;"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column  label="机构项目类别" align="center" width="150">
          <template slot-scope="scope">
            <el-select v-model="scope.row.bkf131" placeholder="请选择机构项目类别">
              <el-option label="常规诊疗项目" value="1"></el-option>
              <el-option label="辅助器具项目" value="4"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column  label="门诊特检项目标识" align="center" width="140">
          <template slot-scope="scope">
            <el-select v-model="scope.row.bkm062" placeholder="请选择门诊特检项目标识">
              <el-option label="否" value="0"></el-option>
              <el-option label="是" value="1"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" width="200">
          <template slot-scope="scope">
            <el-input v-model="scope.row.aae013" :maxlength="200" type="textarea" autosize></el-input>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import service from '@/utils/request'
import { getChargitemList, bookingProject, batchmodifychargitem } from '@/serve/api'
import { floatLimit } from '@/utils/inputLimit'
import { dateFilter } from '@/utils/filters'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      ruleForm: {
        tableData: []
      },
      selectList: [],
      errInfoList: ''
    }
  },
  methods: {
    handleSelectionChange(data) {
      this.selectList = data
      this.ruleForm.tableData.forEach(val => {
        this.$set(val, 'needRules', false)
        this.selectList.forEach(val2 => {
          if (val.item_id === val2.item_id) {
            this.$set(val, 'needRules', true)
          }
        })
      })
    },
    myPriceLimit(val, index) {
      this.ruleForm.tableData[index][val] = floatLimit(this.ruleForm.tableData[index][val], 2)
    },
    getPayList() {  // 获取收费项目
      service(getChargitemList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res = res && res.length ? res : []
          const arr = []
          res.forEach(val => {
            if (val.disabled === 0 && val.szsbcode && val.szsbstatus <= 0 && val.type !== 4 && val.type !== 6) {
              val.szsbprice = val.szsbprice || ''
              val.bkf131 = '1'
              val.bkm062 = '0'
              val.needRules = false
              arr.push(val)
            }
          })
          arr.sort((a, b) => b.create_time - a.create_time)
          this.ruleForm.tableData = arr
        }
      })
    },
    submit() {
      this.$refs.ruleForm.validate(async valid => {
        if (valid) {
          if (!this.selectList.length) {
            this.$message({ message: '请勾选需要申请的诊疗项', type: 'error', showClose: true, duration: 1000 })
            return
          }
          const connectionStatus = await connectionTest()
          if (connectionStatus !== '1') {
            return
          }
          const arr = []
          this.selectList.forEach((val, index) => {
            arr.push({
              ake001: val.szsbcode,  // 社保编码
              ake005: val.szsbcode,  // 机构编码
              ake006: val.szsbname,  // 名称
              bka506: parseFloat(val.szsbprice),  // 价格
              bkf131: val.bkf131,   // 机构项目类别
              bkm062: val.bkm062,   // 门诊特检项目标识
              aae030: parseFloat(dateFilter(new Date().getTime(), 'yyyyMMdd'))  // 备案日期(取当天)
            })
            if (val.aae013) {  // 备注
              arr[index].aae013 = val.aae013
            }
          })
          // 处理大于五十条
          const sum = Math.ceil(arr.length / 50)
          if (sum > 1) {
            for (let i = 0; i < sum; i++) {
              const arr2 = arr.slice(i * 50, 50 * (i + 1))
              this.orderProjectMenu(arr2, sum - 1 === i)
            }
          } else {
            this.orderProjectMenu(arr, true)
          }
         // 处理大于五十条结束
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    orderProjectMenu(arr, flag) {
      service(bookingProject, {
        transBody: {
          listsize: arr.length,
          inputlist: arr
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          // 处理his保存
          const contents = []
          res.transBody.outputlist.forEach(val2 => {
            const filterData = this.selectList.filter(v => v.szsbcode === val2.ake005)
            if (!filterData.length) {
              return
            }
            const val = filterData[0]
            const obj = {
              item_id: val.item_id,
              items: [
                {
                  name: 'szsbstatus',
                  newVal: parseFloat(val2.baz700)
                },
                {
                  name: 'szsbprice',
                  newVal: parseFloat(val.szsbprice)
                }
              ]
            }
            contents.push(obj)
            if (val2.baz700 === '0') {
              this.errInfoList += `<strong>${val.szsbname}</strong>备案失败，原因：${val2.bce574} \n`
            }
          })
          if (!contents.length) {   // 若无返回则不调用保存
            return
          } 
          this.saveSheBaoChargeItemStatus(contents, flag)  // 调用修改his诊疗项备案状态
        }
      })
    },
    saveSheBaoChargeItemStatus(contents, flag) {  // 修改his诊疗项备案状态
      service(batchmodifychargitem, {
        itemarr: contents
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          if (flag) {
            if (this.errInfoList.length) {  // 存在备案失败
              this.$alert(this.errInfoList, '备案完成确认信息', {
                dangerouslyUseHTMLString: true,
                callback: () => {
                  this.errInfoList = ''
                  this.getPayList()
                }
              })
            } else {
              this.$message({ message: '诊疗项备案成功', type: 'success', showClose: true, duration: 1500 })
              this.errInfoList = ''
              this.getPayList()
            }
          }
        }
      })
    }
  },
  created() {
    this.getPayList()
  }
}
</script>

<style lang="scss" scoped>
.project-apply {
  margin-top: 20px;
  .el-form {
    margin-top: 20px;
    .el-table {
      width: 100%;
    }
  }
}
</style>
