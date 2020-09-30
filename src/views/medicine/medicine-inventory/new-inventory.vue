<template>
  <div class="new-inventory">
    <div class="header">
      <el-button type="primary" @click="goBack" size="small">返回</el-button>
      <el-button type="success" @click="complete" size="small">完成盘点</el-button>
    </div>
    <div class="note"> 
      <i class="el-icon-warning" style="color: #eb9e05;"></i> 
      <span style="color: #f00;">在盘点完成之前请勿进行药品销售或进出库</span>
    </div>
    <div class="content">
      <span class="order-number">盘点单号: {{ single_num }}</span>
      <span class="voucher">盘点人: {{ voucher }}</span>
      <span class="create-date">创建日期: {{ creationDate | timeFilter }}</span>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" width="70" label="序号" align="center"></el-table-column>
      <el-table-column prop="drugname" label="药品名称" width="160" align="center"></el-table-column>
      <el-table-column prop="med_class" label="药品分类" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.drugtype | drugTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="drugspec" label="药品规格" width="140" align="center"></el-table-column>
      <el-table-column prop="producer" label="生产厂家" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="push_id" label="批号" align="center" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="盘点前" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.count_ulunit }}</span>
          <span>{{ scope.row.bigunit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="盘点后" width="140" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.new_count_ulunit" size="small" @blur="updateSave(scope.row)"
            @keyup.native="limit(scope.$index, 'count_ulunit')" @change="calculate(scope.row)" style="width: 90px;">
          </el-input>
          <span style="margin-left: 10px;">{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="盈亏量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.modification_value }}</span>
          <span>{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="costprice" label="批发价(元)" align="center">
      </el-table-column>
      <el-table-column label="盈亏批发额(元)" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.new_count_ulunit - scope.row.count_ulunit) * scope.row.costprice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="150">
        <template slot-scope="scope">
          <el-input v-model="scope.row.modification_note" size="small" @blur="updateSave(scope.row)" type="textarea" autosize></el-input>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="10" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getcheckitemlist, updatecheckeditem, finishstockcheck, drugPandian } from '@/serve/api'
import service from '@/utils/request'
import { floatLimit } from '@/utils/inputLimit'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      inventoryData: '',
      single_num: '',
      voucher: '',
      creationDate: '',
      optionss: [
        { value: '', label: '全部' }, 
        { value: '中药', label: '中药' }, 
        { value: '西药', label: '西药' }
      ],
      tableData: [],
      inputList: [],  // 药品数组
      arr2: [],  // 用作存剩下的药品数组
      bindSheBao: false,  // 是否绑定社保
      // 分页
      currentPage: 1,
      total: 0,
      pageIndex: 0,
      // 用户数据
      userData: {
        classification: ''
      }
    }
  },
  methods: {
    goBack() {
      this.$router.back()
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
    // 分割与调社保之间的中间函数
    middleTransIt() {
      if (this.arr2.length > 0) {
        this.makeList(this.arr2)
      } else {
        this.ToSocialSecurity(this.arr2)
      }
    },
    // 调社保客户端
    ToSocialSecurity(arr) {
      service(drugPandian, {
        transBody: {
          listsize: arr.length,
          inputList: arr
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (this.arr2.length === 0) {
            this.finishStockCheck()
          } else {
            this.middleTransIt()
          }
        }
      })
    },
    // 调自己系统的完成接口
    finishStockCheck() {
      const queryObj = JSON.parse(this.$route.query.inventoryData)
      service(finishstockcheck, {
        clinic_id: this.clinic,
        recordkey: queryObj.recordkey
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({
            message: '盘点成功',
            type: 'success',
            showClose: true,
            duration: 1000
          })
          setTimeout(() => {
            this.$router.back()
          }, 1000)
        }
      })
    },
    // 点击完成盘点
    complete() {
      this.$confirm('完成盘点后将不能对盘点单进行编辑, 是否完成?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(async () => {
        // 是否绑定社保 是否打开客户端
        const a = await connectionTest()
        if (a === '1') {
          this.getCheckItemListAll()
        } else {
          this.finishStockCheck()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消',
          showClose: true,
          duration: 1000
        })
      })
    },
    // 请求盘点条目
    getCheckItemList(val) {
      const queryObj = JSON.parse(this.$route.query.inventoryData)
      service(getcheckitemlist, {
        pageid: val,
        pagesize: 10,
        clinic_id: this.clinic,
        recordkey: queryObj.recordkey
      }).then(res => {
        this.tableData = []
        this.tableData = res.record_arr
        this.total = res.pagecount
      })
    },
    // 请求全部盘点条目
    getCheckItemListAll() {
      const queryObj = JSON.parse(this.$route.query.inventoryData)
      service(getcheckitemlist, {
        pageid: 0,
        pagesize: 9999999,
        clinic_id: this.clinic,
        recordkey: queryObj.recordkey
      }).then(res => {
        const inputList = []
        const today = new Date()
        const queryObj = JSON.parse(this.$route.query.inventoryData)
        res.record_arr.forEach(val => {
          if (val.ake001 && val.ake001 !== '' && val.szsbstatus === 1) {
            const obj = {
              push_id: Number(val.push_id),  // 批号
              inventory_record_id: queryObj.serialnum,  // 盘点明细流水号
              standard_code: val.standardnumber,  // 药品本位码
              drug_code: val.ake001,  // 药品编码
              drug_name: val.drugname,  // 药品名称
              std: val.aka074,  // 规格
              unit: val.count_ulname,  // 药库单位
              inventory_number: Number(val.count_ulunit),  // 药库单位数量（盘点时）
              bid: Number(val.shebao_price),  // 进价
              retail_price: Number(val.shebao_price),  // 零售价
              bid_amount: val.shebao_price * val.count_ulunit,  // 进价金额
              retail_amount: val.shebao_price * val.count_ulunit,  // 零价金额
              inventorytime: Number('20' + queryObj.createtime.toString().substr(0, 12)),  // 盘点时间
              acceptime: Number(today.format('yyyyMMddhhmmss')),  // 验收时间
              last_editedtime: Number(val.last_edit_time),  // pos最后编辑时间
              validtime: Number(new Date(val.validtime).format('yyyyMMdd'))
            }
            inputList.push(obj)
            this.inputList = inputList
          }
        })
        if (this.inputList.length > 50) {
          const arrInside = this.inputList.slice(0, 49)
          const arr2Inside = this.inputList.slice(50)
          this.arr2 = arr2Inside
          this.ToSocialSecurity(arrInside)
        } else {
          this.ToSocialSecurity(this.inputList)
          this.arr2 = []
        }
      })
    },
    // 只能输入数字，后三位小数
    limit(index, str) {
      this.tableData[index][str] = floatLimit(this.tableData[index][str], 3)
    },
    // 取消焦点保存
    updateSave(val) {
      if (val.new_count_ulunit !== '' & val.modification_value !== '') {
        service(updatecheckeditem, {
          stockcheckkey: val.stockcheckkey,
          new_count_ulunit: Number(val.new_count_ulunit),
          modification_value: Number(val.modification_value),
          modification_note: val.modification_note,
          clinic_id: this.clinic,
        }).then()
      }
    },
    calculate(val) {
      val.modification_value = val.new_count_ulunit - val.count_ulunit
      val.profit_loss = val.modification_value * val.costprice
    },
    // 分页
    handleCurrentChange(index) {
      this.getCheckItemList(index - 1)
    },
    // 判断是否绑定社保
    judgeBindSheBao() {
      if (this.shebao && this.shebao.hospitalCode) {
        this.bindSheBao = true
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'shebao'])
  },
  created() {
    this.getCheckItemList(0)
    const jsonData = JSON.parse(this.$route.query.inventoryData)
    this.single_num = jsonData.serialnum
    this.voucher = jsonData.creatorname
    this.creationDate = jsonData.createtime
    this.judgeBindSheBao()
  },
  filters: {
    drugTypeFilter(type) {
      if (type === '0') {
        return '西/中成药'
      }
      if (type === '1') {
        return '中药'
      }
    },
    timeFilter(time) {
      const str = '' + time
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
.new-inventory {
  margin-top: 20px;
  margin-left: 30px;
  .header, .note {
    margin-top: 20px;
  }
  .content {
    margin-top: 20px;
    color: #666;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    .voucher, .create-date {
      margin-left: 20px;
    }
  }
  .el-table {
    margin-top: 20px;
    width: 100%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
