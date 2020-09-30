<template>
  <div class="drug-apply">
    <div class="submit">
      <el-button size="small" type="primary" @click="submit">提交申请</el-button>
      <span style="color: #f00;">（没有社保编码的药品无法进行社保备案）</span>
    </div>
    <el-form :model="ruleForm" ref="ruleForm" :show-message="false" size="small">
      <el-table :data="ruleForm.tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center"></el-table-column>
        <el-table-column prop="ake001" label="社保编码" align="center"></el-table-column>
        <el-table-column prop="product_name" label="名称" align="center"></el-table-column>
        <el-table-column prop="aka031" label="药品类别" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.aka031 | aka031Filter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dosage_type" label="剂型" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.dosage_type | dosageFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="aka074" label="规格" align="center"></el-table-column>
        <el-table-column prop="shebao_price" label="社保价格" align="center" width="160">
          <template slot-scope="scope">
            <el-form-item :prop="'tableData.' + scope.$index + '.shebao_price'" :rules="[{ required: scope.row.needRules, trigger: 'change' }]">
              <el-input v-model="scope.row.shebao_price" style="width: 100px;margin-top: 20px;"
                @keyup.native="myPriceLimit('shebao_price', scope.$index)"></el-input>
              <!-- 单位 -->
              <span style="font-size: 12px;">元/{{ scope.row.drug_specs_name }}</span>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column  label="备注" align="center" width="300">
          <template slot-scope="scope">
            <el-input v-model="scope.row.aae013" :maxlength="200" type="textarea" :autosize="{ maxRows: 3 }"></el-input>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import service from '@/utils/request'
import { getDrugList, bookingDrug, sbzbinfoupdate } from '@/serve/api'
import { menuCode } from '@/common/code'
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
          if (val.drug_key === val2.drug_key) {
            this.$set(val, 'needRules', true)
          }
        })
      })
    },
    myPriceLimit(val, index) {
      this.ruleForm.tableData[index][val] = floatLimit(this.ruleForm.tableData[index][val], 2)
    },
    getDrugList() {  // 获取药品
      service(getDrugList, {
        pageid: 0,
        pagesize: 0
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res.diarr = res.diarr && res.diarr.length ? res.diarr : []
          const arr = []
          res.diarr.forEach(val => {
            if (val.szsbstatus <= 0 && val.ake001 && val.use_enable === 1) {
              val.shebao_price = val.shebao_price === 0 ? '' : val.shebao_price
              val.drug_specs_name = val.specs.unit_large.specs_name  //  中西药取大单位
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
            this.$message({ message: '请勾选需要申请的药品', type: 'error', showClose: true, duration: 1000 })
            return false
          }
          const connectionStatus = await connectionTest()
          if (connectionStatus !== '1') {
            return
          }
          const arr = []
          this.selectList.forEach(val => {
            arr.push({
              ake001: val.ake001,  // 社保编码
              bkm017: val.standard_number,  // 药品本位码
              ake005: val.ake001,  // 机构编码
              ake006: val.product_name,   // 名称
              aka074: val.aka074,   // 规格
              aka070: val.dosage_type,  // 剂型
              aka067: val.drug_specs_name,   // 计价单位
              bka053: val.producer,   // 厂家
              bka505: parseFloat(val.shebao_price),   // 药品进货价格
              bka506: parseFloat(val.shebao_price),   // 药品收费价格
              aae030: parseFloat(dateFilter(new Date().getTime(), 'yyyyMMdd')),   // 备案日期
              aae013: val.aae013    // 药品备注
            })
          })
          // 处理大于五十条
          const sum = Math.ceil(arr.length / 50)
          if (sum > 1) {
            for (let i = 0; i < sum; i++) {
              const arr2 = arr.slice(i * 50, 50 * (i + 1))
              this.orderDrugMenu(arr2, sum - 1 === i)
            }
          } else {
            this.orderDrugMenu(arr, true)
          }
         // 处理大于五十条结束
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    orderDrugMenu(arr, flag) {  // 1-处理数据，2-是否为最后一条，最后一条需刷新列表
      service(bookingDrug, {
        transBody: {
          listsize: arr.length,
          inputlist: arr
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          // 处理his保存
          const contents = []
          res.transBody.outputlist.forEach((val2) => {
            const filterData = this.selectList.filter(v => v.ake001 === val2.ake005)
            if (!filterData.length) {
              return
            }
            const val = filterData[0]
            contents.push({
              drug_key: val.drug_key,
              szsbstatus: parseFloat(val2.baz700),  // 默认0，备案成功1
              shebao_price: parseFloat(val.shebao_price)
            })
            if (val2.baz700 === '0') {
              this.errInfoList += `<strong>${val.product_name}</strong>备案失败，原因：${val2.bce574} \n`
            }
          })
          if (!contents.length) {  // 若无返回则不调用保存
            return
          }  
          this.saveSheBaoDrugStatus(contents, flag)   // 修改his备案状态
        }
      })
    },
    saveSheBaoDrugStatus(contents, flag) {  // 修改his备案状态
      service(sbzbinfoupdate, {
        diarr: contents
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // flag为true代表全部更新完备案状态
          if (flag) {
            if (this.errInfoList.length) {  // 存在备案失败
              this.$alert(this.errInfoList, '备案完成确认信息', {
                dangerouslyUseHTMLString: true,
                callback: () => {
                  this.errInfoList = ''
                  this.getDrugList()
                }
              })
            } else {
              this.$message({ message: '药品备案成功', type: 'success', showClose: true, duration: 1500 })
              this.errInfoList = ''
              this.getDrugList()
            }
          }
        }
      })
    }
  },
  created() {
    this.getDrugList()
  },
  filters: {
    aka031Filter(val) {
      return menuCode.aka031[val]  // 按需导出使用
    },
    dosageFilter(val) {
      return menuCode.aka070[val]  // 按需导出使用
    }
  }
}
</script>

<style lang="scss" scoped>
.drug-apply {
  margin-top: 20px;
  .el-form {
    margin-top: 20px;
    .el-table {
      width: 100%;
    }
  }
}
</style>
