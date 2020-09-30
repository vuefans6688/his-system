<template>
  <div class="common-medicine">
    <div class="add">
      <el-button type="primary" size="small" @click="addMedicine">添加药品</el-button>
    </div>
    <!-- 外层表格 -->
    <el-table class="outer-table" :data="tableData" stripe>
      <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
      <el-table-column prop="product_name" label="药品名称" align="center" width="160"></el-table-column>
      <el-table-column prop="specs_txt" label="药品规格" align="center" width="140"></el-table-column>
      <el-table-column prop="producer" label="生产厂家" width="230" align="center" tooltip-effect="light"></el-table-column>
      <el-table-column label="数量" align="center" width="160">
        <template slot-scope="scope">
          <el-input v-model="scope.row.count_ulunit" size="small" @blur="saveLine(scope.row)" 
            @keyup.native="limit(scope.$index, 'count_ulunit')" style="width: 120px;"></el-input>
          <span>{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批发价" align="center" width="160">
        <template slot-scope="scope">
          <el-input v-model="scope.row.costprice" size="small" @blur="saveLine(scope.row)" 
            @keyup.native="limit(scope.$index, 'costprice')" style="width: 100px;">
          </el-input>
          <span>元/{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处方价" align="center" width="160">
        <template slot-scope="scope">
          <el-input v-model="scope.row.cf_price" size="small" @blur="saveLine(scope.row)" 
            @keyup.native="limit(scope.$index, 'cf_price')" style="width: 100px;">
          </el-input>
          <span>元/{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="零售价" align="center" width="160">
        <template slot-scope="scope">
          <el-input v-model="scope.row.saleprice" size="small" @blur="saveLine(scope.row)" 
            @keyup.native="limit(scope.$index, 'saleprice')" style="width: 100px;">
          </el-input>
          <span>元/{{ scope.row.count_ulname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批号" align="center" width="200">
        <template slot-scope="scope">
          <el-input v-model="scope.row.push_id" size="small" @blur="saveLine(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="到期日" align="center" width="190">
        <template slot-scope="scope">
          <el-date-picker v-model="scope.row.validtime" type="date" :editable="false" 
            placeholder="选择日期" size="small" @blur="saveLine(scope.row)" 
            :picker-options="pickerOptions1" style="width: 160px;">
          </el-date-picker>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="small" @click="del(scope.row.purchasekey)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增药品的模态框 -->
    <el-dialog title="添加药品" :visible.sync="addMedicineShow" :before-close="handleClose" align="center">
      <el-form :model="mt" ref="addForm" size="small" label-width="80px" class="inner-form">
        <el-form-item label="药品名称:">
          <el-input v-model="mt.search" placeholder="请输入药品名称" style="width: 280px;"></el-input>
        </el-form-item>
        <el-form-item label="药品类型:" style="margin-left: 10px;">
          <el-select v-model="mt.med_class">
            <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <div class="allow">
          <el-button type="primary" size="small" @click="confirm">确定</el-button>
        </div>
      </el-form>
      <!-- 内层表格 -->
      <el-table class="inner-table" :data="tableData" @selection-change="handleSelectionChange2" stripe>
        <el-table-column type="selection" align="center" width="70"></el-table-column>
        <el-table-column prop="product_name" label="药品名称" align="center">
        </el-table-column>
        <el-table-column label="处方类型" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.drugtype | drugTypeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="specs_txt" label="规格" show-overflow-tooltip align="center" width="160"></el-table-column>
        <el-table-column prop="producer" label="生产厂家" show-overflow-tooltip align="center"></el-table-column>
      </el-table>
      <!-- 内层分页模态框 -->
      <el-pagination class="inner-pagination" :current-page="currentPage2" :page-size="10" @current-change="handleCurrentChange2"
        layout="total, prev, pager, next, jumper" :total= "total2">
      </el-pagination>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { floatLimit } from '@/utils/inputLimit'
import { purchasequeryitems } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      tableData: [],  // 入库药品数据
      currentPage: 1,  // 分页
      currentPage2: 1,
      total: 0,
      total2: 0,
      pageindex1: 0,
      pageindex2: 0,
      addMedicineShow: false,  // 模态框
      multipleSelection2: [],
      options1: [
        { value: '', label: '全部' },
        { value: '0', label: '西/中成药' },
        { value: '1', label: '中药' }
      ],
      tableData: [],  // 添加药品列表数据（里层模态框）
      mt: {  // 搜索条件
        search: '',
        med_class: ''
      },
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  methods: {
    // 将字段等于0的值置成空
    makeEmpty() {
      this.tableData.forEach((item, index) => {
        if (item.count_ulunit === 0) {
          this.tableData[index].count_ulunit = ''
        }
        if (item.costprice === 0) {
          this.tableData[index].costprice = ''
        }
        if (item.cf_price === 0) {
          this.tableData[index].cf_price = ''
        }
        if (item.saleprice === 0) {
          this.tableData[index].saleprice = ''
        }
        if (item.validtime === 0) {
          this.tableData[index].validtime = ''
        }
      })
    },
    // 查询该单入库药品列表（外面列表），并向父组件传的药品数组
    purchQueryItemsAll() {
      service(purchasequeryitems, {
        purchase_sn: this.purchRecode.purchaseSn,
        pagesize: 9999999,
        pageid: 0
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          res.context.forEach(i => {
            i.saleprice = i.shebao_price || 0
            i.costprice = i.shebao_price || 0
            i.cf_price = i.shebao_price || 0
            i.saleprice = i.shebao_price || 0
          })
          this.tableData = res.context || []
          this.total = res.pagecount || 0
          this.makeEmpty()
          this.$emit('send', this.tableData)
        }
      })
    },
    // 删除该行药品
    del(purchasekey) {
      this.$http.post('/service/drug/purchasedelitem', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic,
          purchasekey
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.purchQueryItemsAll()  // 把全部数组传到父组件
          setTimeout(() => {         // 当删除到药品为空时，向父组件传0
            if (this.tableData.length === 0) {
              this.$emit('listenToChildEvent', '0')
            }
          }, 100)
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
    // 换行提交保存
    saveLine(val) {
      if (val.count_ulname !== '' & val.count_ulname !== 0 & val.count_ulunit !== '' & val.count_ulunit !== 0 & val.validtime !== ''
      & val.validtime !== 0 & val.costprice !== '' & val.costprice !== 0 & val.saleprice !== '' & val.saleprice !== 0 & val.cf_price !== ''
      & val.cf_price !== 0 & val.push_id !== '') {
        this.$http.post('/service/drug/purchaseupdateitem', {
          head: {
            accessToken: this.token,
            lastnotice: 0
          },
          body: {
            clinic_id: this.clinic,
            purchasekey: val.purchasekey,
            count_ulname: val.count_ulname,
            count_ulunit: Number(val.count_ulunit),
            validtime: Number(val.validtime),
            costprice: Number(val.costprice),
            saleprice: Number(val.saleprice),
            cf_price: Number(val.cf_price),
            push_id: val.push_id
          }
        }).then(() => {
          this.purchQueryItemsAll()
        }).catch()
      }
    },
    // 添加药品请求查询药品信息（模态框里列表）
    infoListQuery() {
      this.$http.post('/service/drug/infolistquery', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          pageid: this.pageindex2,
          pagesize: 10,
          clinic_id: this.clinic,
          drugname: this.mt.search,
          drugtype: this.mt.med_class
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          if (!res.data.data) {  // 如果没有则返回空
            this.tableData = []
          } else {
            this.total2 = res.data.data.pagecount
            this.tableData = res.data.data.diarr.filter(val => val.use_enable === 1)  // 过滤掉禁用的
          }
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: res.data.errmsg
          })
          this.tableData = []
        }
      }).catch()
    },
    // 添加药品按钮
    addMedicine() {
      this.addMedicineShow = true
      // 添加药品请求查询药品信息
      this.infoListQuery()
    },
    // 模态框分页
    handleCurrentChange2(index) {
      this.pageindex2 = index - 1
      this.infoListQuery()
    },
    // 添加药品的勾选
    handleSelectionChange2(value) {
      this.multipleSelection2 = value
    },
    // 添加药品确认键
    confirm() {
      const arr = []  // 用作传递给后台
      const date = new Date()
      date.setFullYear(date.getFullYear() + 1)  // 药品过期时间
      this.multipleSelection2.forEach(val => {
        arr.push({
          drugkey: val.drug_key,
          count_ulname: val.specs.unit_large.specs_name,
          count_ulunit: 0,
          validtime: Date.parse(date),
          product_time: 0,
          costprice: 0,
          saleprice: 0,
          cf_price: 0
        })
      })
      // 增加采购药品
      this.$http.post('/service/drug/purchaseadditem', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          purchase_sn: this.purchRecode.purchaseSn,
          context: arr
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'success',
            message: '添加成功!'
          })
          this.addMedicineShow = false
          this.$emit('listenToChildEvent', '1')  // 添加成功后，向父组件传1的信息
          this.purchQueryItemsAll()  // 把全部数组传到父组件
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            type: 'error',
            message: '添加失败!'
          })
        }
      }).catch()
    },
    handleClose() {
      this.addMedicineShow = false
      this.$refs.addForm.resetFields()
    },
    // 只能输入数字，后三位小数
    limit(index, str) {
      this.tableData[index][str] = floatLimit(this.tableData[index][str], 3)
    }
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'purchRecode'])
  },
  watch: {
    mt: {
      handler() {
        this.infoListQuery()
      },
      deep: true
    }
  },
  filters: {
    drugTypeFilter(val) {
      if (val === '0') {
        return '西/中成药'
      } else if (val === '1') {
        return '中药'
      }
    }
  },
  created() {
    if (this.purchRecode.edit) {
      this.purchQueryItemsAll()  // 把全部药品传到父组件
    } else {
      this.tableData = []
    }
    // 创建时，如果tableData的长度为0，则传给父组件0
    setTimeout(() => {
      if (this.tableData.length === 0) {
        this.$emit('listenToChildEvent', '0')
      }
    }, 200)
  },
  beforeDestroy() {
    this.$store.commit('user/SET_PURCH_RECODE', '')
    this.tableData = []
  }
}
</script>

<style lang="scss" scoped>
.add {
  margin-top: 20px;
}
.outer-table {
  width: 100%;
}
.inner-form {
  display: flex;
  .allow {
    .el-button {
      margin-left: 10px;
    }
  }
}
.inner-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>

