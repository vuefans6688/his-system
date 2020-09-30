<template>
  <div class="seen-inventory">
    <div class="back">
      <el-button type="primary" @click="goBack" size="small">返回</el-button>
    </div>
    <div class="header">
      <span class="order-number">盘点单号: {{ single_num }}</span>
      <span class="voucher">盘点人: {{ voucher }}</span>
      <span class="create-date">创建日期: {{ creationDate | timeFilter }}</span>
      <span class="drug-classify">药品分类: </span>
      <el-select v-model="userData.classification" placeholder="请选择" size="small">
        <el-option v-for="item in optionss" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" width="70" label="序号" align="center"></el-table-column>
      <el-table-column prop="push_id" label="入库批号" align="center"></el-table-column>
      <el-table-column prop="drugname" label="药品名称" align="center"></el-table-column>
      <el-table-column prop="med_class" label="药品分类" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.drugtype | drugType }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="drugspec" label="药品规格" align="center"></el-table-column>
      <el-table-column prop="producer" label="生产厂家" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column label="盘点前" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.count_ulunit }}</span>
          <span>{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="盘点后" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.new_count_ulunit }}</span>
          <span>{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="盈亏量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.modification_value }}</span>
          <span>{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="costprice" label="批发价(元)" align="center"></el-table-column>
      <el-table-column label="盈亏批发额" align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.new_count_ulunit - scope.row.count_ulunit) * scope.row.costprice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="modification_note" label="备注" align="center"></el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="10"
      layout="total, prev, pager, next, jumper" :total="total" @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getcheckitemlist, drugDeleteStore } from '@/serve/api'
import service from '@/utils/request'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      single_num: '',
      voucher: '',
      creationDate: '',
      optionss: [
        { value: '', label: '全部' }, 
        { value: '中药', label: '中药' }, 
        { value: '西药', label: '西药' }
      ],
      tableData: [],
      recordkey: '',
      // 分页
      currentPage: 1,
      total: 0,
      pageIndex: 0,
      // 输入的数据
      userData: {
        bigunit: '',
        smallunit: '',
        classification: ''
      },
      bindSheBao: false
    }
  },
  methods: {
    // 判断是否绑定社保
    judgeBindSheBao() {
      if (this.shebao && this.shebao.hospitalCode) {
        this.bindSheBao = true
      }
    },
    goBack() {
      this.$router.back()
    },
    // 分页
    handleCurrentChange(index) {
      this.pageIndex = index - 1
      this.getCheckItemList()
    },
    getCheckItemList() {
      service(getcheckitemlist, {
        pageid: this.pageIndex,
        pagesize: 10,
        clinic_id: this.clinic,
        recordkey: this.recordkey
      }).then(res => {
        this.tableData = res.record_arr
        this.total = res.pagecount
      })
    },
    // 点击撤销社保
    async removeSheBao() {
      // 是否绑定社保 是否打开客户端
      const a = await connectionTest()
      if (a === '1') {
        const inputList = []
        this.tableData.forEach(val => {
          if (val.ake001 && val.ake001 !== '') {
            const obj = {
              revoke_type: '1',  // 撤销类型
              push_id: Number(val.push_id),  // 批号
              inventory_record_id: val.purchase_sn  // 库存明细流水号
            }
            inputList.push(obj)
            this.inputList = inputList
          }
        })
        // 开始撤销医保库存
        if (this.inputList.length > 50) {
          const arrInside = this.inputList.slice(0, 49)
          const arr2Inside = this.inputList.slice(50)
          this.arr2 = arr2Inside
          this.deleteShebao(arrInside)
        } else {
          this.deleteShebao(this.inputList)
          this.arr2 = []
        }
      }
    },
    // 调撤销社保库存清点
    deleteShebao(arr) {
      service(drugDeleteStore, {
        transBody: {
          listsize: arr.length,
          inputList: arr
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (this.arr2.length > 0) {
            this.makeListDelete(this.arr2)
          } else {
            this.deleteStock()
          }
        }
      })
    },
    // 撤销分割药品数组并调社保客户端
    makeListDelete(arr) {
      if (arr.length > 50) {
        const arrInside = arr.slice(0, 49)
        const arr2Inside = arr.slice(50)
        this.arr2 = arr2Inside
        this.deleteShebao(arrInside)
      } else {
        this.deleteShebao(arr)
        this.arr2 = []
      }
    }
  },
  filters: {
    drugType(type) {
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
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'shebao'])
  },
  created() {
    this.recordkey = JSON.parse(this.$route.query.inventoryData).recordkey
    this.getCheckItemList()
    this.single_num = JSON.parse(this.$route.query.inventoryData).serialnum
    this.voucher = JSON.parse(this.$route.query.inventoryData).creatorname
    this.creationDate = JSON.parse(this.$route.query.inventoryData).createtime
    this.judgeBindSheBao()
  }
}
</script>

<style lang="scss" scoped>
.seen-inventory {
  margin-top: 20px;
  margin-left: 30px;
  .back {
    margin-top: 20px;
  }
  .header {
    margin-top: 20px;
    color: #666;
    .voucher, .create-date, .drug-classify {
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
