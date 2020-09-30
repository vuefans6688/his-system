<template>
  <div class="material-apply">
    <div class="submit">
      <el-button size="small" type="primary" @click="submit">提交申请</el-button>
      <span style="color: #f00;">（没有社保编码的耗材项无法进行社保备案）</span>
    </div>
    <el-form :model="ruleForm" ref="ruleForm" :inline-message="true" :show-message="false" size="small">
      <el-table :data="ruleForm.tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="szsbcode" label="耗材统一编码"></el-table-column>
        <el-table-column prop="name" label="名称" align="center" width="140"></el-table-column>
        <el-table-column prop="unit" label="单位" align="center" width="100"></el-table-column>
        <el-table-column prop="price" label="销售价(元)" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.price | priceFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="szsbprice" label="社保价格" align="center" width="140">
          <template slot-scope="scope">
            <el-form-item :prop="'tableData.' + scope.$index +'.szsbprice'" :rules="[{ required: scope.row.needRules, trigger: 'change' }]">
              <el-input v-model="scope.row.szsbprice" @keyup.native="myPriceLimit('szsbprice', scope.$index)"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="aka074" label="规格" align="center" width="140">
          <template slot-scope="scope">
            <el-form-item :prop="'tableData.' + scope.$index +'.aka074'" :rules="[{ required: scope.row.needRules, trigger: 'change' }]">
              <el-input v-model="scope.row.aka074"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column  label="生产地类别" align="center" width="100">
          <template slot-scope="scope">
            <el-form-item :prop="'tableData.' + scope.$index + '.ake004'" :rules="[{ required: scope.row.needRules, trigger: 'change' }]">
              <el-select v-model="scope.row.ake004" placeholder="请选择耗材生产地">
                <el-option label="国内" value="1"></el-option>
                <el-option label="国外" value="2"></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column  label="特殊医用材料标识" align="center" width="140">
          <template slot-scope="scope">
            <el-select v-model="scope.row.ckf261" placeholder="请选择医用材料标识">
              <el-option label="否" value="0"></el-option>
              <el-option label="是" value="1"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="bka053" label="生产厂家" align="center" width="180">
          <template slot-scope="scope">
            <el-form-item :prop="'tableData.' + scope.$index + '.bka053'" :rules="[{ required: scope.row.needRules, trigger: 'change' }]">
              <el-input v-model="scope.row.bka053" :maxlength="180" type="textarea" autosize></el-input>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import service from '@/utils/request'
import { getChargitemList, bookingMaterial, batchmodifychargitem } from '@/serve/api'
import { floatLimit } from '@/utils/inputLimit'
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
            if (val.disabled === 0 && val.szsbcode && val.szsbstatus <= 0 && val.type === 4) {
              val.szsbprice = val.szsbprice === 0 ? '' : val.szsbprice
              val.ckf261 = '0'   // 特殊医用材料标识
              val.bka053 = ''    // 生产厂家
              if (val.name.indexOf('进口') > -1) {
                val.ake004 = '2'
              } else if (val.name.indexOf('国产') > -1) {
                val.ake004 = '1'
              } else {
                val.ake004 = ''
              }                   // 生产地类别
              val.aka074 = ''     // 规格
              val.needRules = false
              arr.push(val)
            }
          })
          this.ruleForm.tableData = arr
        }
      })
    },
    submit() {
      this.$refs.ruleForm.validate(async valid => {
        if (valid) {
          if (!this.selectList.length) {
            this.$message({ message: '请勾选需要申请的耗材项', type: 'error', showClose: true, duration: 1000 })
            return
          }
          const connectionStatus = await connectionTest()
          if (connectionStatus !== '1') {
            return
          }
          const arr = []
          this.selectList.forEach(val => {
            arr.push({
              ake001: val.szsbcode,  // 社保编码
              ake005: val.szsbcode,  // 机构编码
              ake006: val.szsbname,  // 名称
              bka053: val.bka053,    // 生产厂家
              ake004: val.ake004,    // 生产地类别
              ckf261: val.ckf261,    // 特殊医用材料标识
              aka067: val.unit,      // 计价单位
              aka074: val.aka074,    // 规格
              bka505: parseFloat(val.cost),   // 进货价格
              bka506: parseFloat(val.price),  // 进货价格
              aae013: ''
            })
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
      service(bookingMaterial, {
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
          if (!contents.length) {  // 若无返回则不调用保存
            return
          } 
          this.saveSheBaoChargeItemStatus(contents, flag)  // 调用修改his耗材项备案状态
        }
      })
    },
    saveSheBaoChargeItemStatus(contents, flag) {  // 修改his耗材项备案状态
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
              this.$message({ message: '耗材项备案成功', type: 'success', showClose: true, duration: 1500 })
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
.material-apply {
  margin-top: 20px;
  .el-form {
    width: 100%;
    .el-table {
      margin-top: 20px;
    }
  }
}
</style>
