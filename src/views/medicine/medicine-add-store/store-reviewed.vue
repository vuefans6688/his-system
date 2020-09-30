<template>
  <div class="store-reviewed">
    <div class="back">
      <el-button type="primary" @click="goBack" size="small">返回</el-button>
    </div>
    <div class="header">
      <span class="order-num">入库单号: {{ single_num }}</span>
      <span class="voucher">制单人: {{ voucher }}</span>
      <span class="make-date">制单日期: {{ making_date | makeDateFilter }}</span>
      <span class="suppliers">供应商: {{ suppliers }}</span>
    </div>
    <div class="total">入库总金额: {{ money }} 元</div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" width="70" label="序号" align="center"></el-table-column>
      <el-table-column prop="product_name" label="药品名称" align="center" width="140"></el-table-column>
      <el-table-column prop="specs_txt" label="药品规格" align="center" width="160"></el-table-column>
      <el-table-column prop="producer" label="生产厂家" show-overflow-tooltip width="190" align="center"></el-table-column>
      <el-table-column prop="count_ulunit" label="数量" width="90" align="center"></el-table-column>
      <el-table-column prop="count_ulname" label="单位" width="90" align="center"></el-table-column>
      <el-table-column prop="costprice" label="批发价" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.costprice }}元/{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="cf_price" label="处方价" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cf_price }}元/{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="saleprice" label="零售价" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.saleprice }}元/{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="push_id" label="批号" align="center" width="170"></el-table-column>
      <el-table-column label="到期日" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.validtime | validTimeFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage4" :page-size="10" @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { drugDeleteStore } from '@/serve/api'
import service from '@/utils/request'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      total: 1,
      single_num: '',
      voucher: '',
      suppliers: '',
      money: '',
      making_date: '',
      // 分页
      currentPage4: 1,
      tableData: [],
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
    del(a) {
      this.tableData.splice(a, 1)
    },
    // 分页
    handleCurrentChange(val) {
      const msgid = new Date().getTime().toString()
      const page = val - 1
      this.$http.post('/service/drug/purchasequeryitems', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: msgid
        },
        body: {
          pageid: page,
          pagesize: 10,
          purchase_sn: this.purchRecode.row.purchase_sn,
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.tableData = res.data.data.context
          this.total = res.data.data.pagecount
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
        }
      }).catch()
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
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'success',
              message: '撤销成功'
            })
          }
        }
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
  created() {
    this.single_num = this.purchRecode.row.purchase_sn
    this.voucher = this.purchRecode.row.creatorname
    this.suppliers = this.purchRecode.row.supplier
    this.money = this.purchRecode.row.allcost
    this.making_date = this.purchRecode.row.createtime
    this.$http.post('/service/drug/purchasequeryitems', {
      head: {
        accessToken: this.token,
        lastnotice: 0
      },
      body: {
        clinic_id: this.clinic,
        purchase_sn: this.purchRecode.row.purchase_sn,
        pagesize: 10,
        pageid: 0
      }
    }).then(res => {
      if (res.data.errcode === 0) {
        this.tableData = res.data.data.context
        this.total = res.data.data.pagecount
      } else {
        this.$message({
          showClose: true,
          duration: 1000,
          type: 'error',
          message: res.data.errmsg
        })
      }
    }).catch()
    this.judgeBindSheBao()
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'shebao', 'purchRecode',])
  },
  filters: {
    validTimeFilter(time) {
      return new Date(time).format('yyyy-MM-dd')
    },
    makeDateFilter(time) {
      const str = '20' + time + ''
      return str.substring(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2)
    }
  },
  beforeDestroy() {
    this.$store.commit('user/SET_PURCH_RECODE', '')
    this.tableData = []
  }
}
</script>

<style lang="scss" scoped>
.store-reviewed {
  margin-top: 20px;
  margin-left: 30px;
  .header {
    width: 98%;
    margin-top: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    color: #666;
    .voucher, .make-date, .suppliers {
      margin-left: 20px;
    }
  }
  .back {
    margin-top: 20px;
  }
  .total {
    margin-top: 20px;
    color: #42b983;
    font-size: 19px;
    font-weight: bold;
  }
  .el-table {
    margin-top: 20px;
    width: 98%;
  }
  .el-pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
