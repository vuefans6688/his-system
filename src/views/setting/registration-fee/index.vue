<template>
  <div class="registration-fee">
    <div class="add-registration">
      <el-button size="small" type="primary" @click="modifyRegistration(-1)">新增挂号项</el-button>
    </div>
    <el-table :data="registrations" type="index" stripe>
      <el-table-column align="center" prop="seq_num" label="编号"></el-table-column>
      <el-table-column align="center" prop="name" label="名称"></el-table-column>
      <el-table-column prop="cost" label="成本价" align="center"></el-table-column>
      <el-table-column prop="price" label="销售价" align="center"></el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | clinicDateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.disabled | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="modifyRegistration(scope.$index)">编辑</el-button>
          <el-button type="text" @click="forbidRegistration(scope.$index)" v-show="scope.row.disabled === 0" style="color: #f00;">禁用</el-button>
          <el-button type="text" @click="startRegistration(scope.$index)" v-show="scope.row.disabled !== 0" style="color: #42b983;">启用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :page-size="pagesize" layout="total, prev, pager, next, jumper" 
      :total="total" @current-change="pageChange">
    </el-pagination>
    <el-dialog :title="oparation + '挂号项'" :visible.sync="modifyRegistrationShow" :before-close="handleClose" align="center">
      <el-form :model="registration" :rules="registrationRules" ref="registration" label-width="100px" size="small">
        <el-form-item label="社保编号:" prop="seq_num">
          <el-input v-model="registration.seq_num" :disabled="false"></el-input>
        </el-form-item>
        <el-form-item label="名称:" prop="name">
          <el-autocomplete popper-class="my-autocomplete" v-model="registration.name" 
            :disabled="canEditName" @blur="checkName" :fetch-suggestions="querySearch" value-key="name"
            placeholder="请选择名称" :trigger-on-focus="false" @select="handleSelect" style="width: 100%;">  
            <template slot-scope="props">
              <div class="think">
                <p>姓名: {{ props.item.name }} 社保</p>
                <p>社保编号: {{ props.item.code }}</p>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="成本价:" prop="cost">
          <el-input v-model="registration.cost" ref="cost" @keyup.native="myPriceLimit('cost')" @blur="paddingZero('cost', 2)"></el-input>
        </el-form-item>
        <el-form-item label="销售价:" prop="price">
          <el-input v-model="registration.price" ref="price" @keyup.native="myPriceLimit('price')" @blur="paddingZero('price', 2)"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyRegistrationConfirm('registration')">确定</el-button>
          <el-button @click="modifyRegistrationCancel('registration')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { floatLimit } from '@/utils/inputLimit'
import { paddingEndZero } from '@/utils/filters'
import service from '@/utils/request'
import { fuzzysearchzhenliao, getzhenliaoByKey, createChargitem, getChargitemInfo, modifyChargitem, getChargitemList } from '@/serve/api'
export default {
  data() {
    return {
      registrations: [],
      modifyRegistrationShow: false,
      registration: {
        name: '',
        seq_num: '',
        type: 1,
        cost: '',
        price: '',
        szsbcode: '',
        szsbname: '',
        szsbprice: 0,
        szsbzhenliaokey: '',
      },
      canEditName: false,
      selectedItem: {}, // 点击联想选中的信息
      registrationRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入成本价', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入销售价', trigger: 'blur' }
        ]
      },
      action: '', // 记录是新增还是编辑
      index: -1,  // 记录编辑的行号
      // 分页
      pageindex: 0,
      pagesize: 3,
      total: 0
    }
  },
  methods: {
    checkName() {  // 检验名字
      if (this.registration.name !== this.selectedItem.ake002) {
        this.registration.seq_num = ''
        this.registration.szsbzhenliaokey = ''
        this.selectedItem = {}
      }
    },
    querySearch(queryString, callback) {  // 联想
      clearTimeout(this.timeout)
      service(fuzzysearchzhenliao, {
        name: queryString
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          if (!res) {  // 联想无则返回空
            callback([])
          } else {
            callback(res.outputlist)
          }
        } else {  // code错误需要进行的操作
          callback([])
        }
      })
    },
    handleSelect(item) {  // 联想选择事件
      this.registration.seq_num = item.code
      this.registration.szsbzhenliaokey = item.key
      service(getzhenliaoByKey, {
        key: item.key
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.selectedItem = res.zhenliao
          this.registration.name = res.zhenliao.ake002
          this.registration.szsbprice = res.zhenliao.bkm055 || 0
        }
      })
    },
    modifyRegistration(index) {
      this.index = index
      this.action = index > -1 ? 'edit' : 'new'
      if (index > -1) {
        this.getCurrentItem()
      }
      this.modifyRegistrationShow = true
    },
    modifyRegistrationCancel(ruleForm) {
      this.modifyRegistrationShow = false
      this.$refs[ruleForm].resetFields()
    },
    handleClose() {
      this.reset()
    },
    modifyRegistrationConfirm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          // 重新设置数据
          if (this.action === 'new') {
            this.addItem()
          } else {
            this.updateItem()
          }
        } else {
          return false
        }
      })
    },
    startRegistration(index) {
      this.changeStatus(index, 0)
    },
    forbidRegistration(index) {
      this.$confirm('禁用后将无法使用, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.changeStatus(index, 1)
      })
    },
    myPriceLimit(value) {
      this.registration[value] = floatLimit(this.registration[value], 2)
    },
    // 末尾补零
    paddingZero(label, len) {
      this.registration[label] = paddingEndZero(this.registration[label], len)
    },
    reset() {
      this.registration = {
        seq_num: '',
        type: 1,
        name: '',
        cost: '',
        price: '',
        szsbcode: '',
        szsbname: '',
        szsbprice: 0,
        szsbzhenliaokey: ''
      }
      this.selectedItem = {}
      this.$refs.registration.resetFields()
      this.modifyRegistrationShow = false
    },
    updateView() {
      this.registrations[this.index].seq_num = this.registration.seq_num
      this.registrations[this.index].name = this.registration.name
      this.registrations[this.index].cost = this.registration.cost
      this.registrations[this.index].price = this.registration.price
    },
    // 分页
    pageChange(index) {
      this.pageindex = index - 1
      this.getItemList()
    },
    getItemList() {  // 全部获取
      service(getChargitemList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          res = res && res.length ? res : []
          this.registrations = res.filter(obj => obj.type === 1)
        }
      })
    },
    addItem() {
      this.registration.type = parseInt(this.registration.type, 10)
      this.registration.cost = parseFloat(this.registration.cost)
      this.registration.price = parseFloat(this.registration.price)
      service(createChargitem, {
        ...this.registration,
        szsbcode: this.registration.seq_num,
        szsbname: this.registration.name,
        szsbprice: this.registration.szsbprice,
        szsbzhenliaokey: this.registration.szsbzhenliaokey,
        szsbpricelevel: '4'
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.registrations.push(res)
          this.reset()
        }
      })
    },
    // 获取当前编辑的信息
    getCurrentItem() {
      service(getChargitemInfo, {
        item_id: this.registrations[this.index].item_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.registration = res
        }
      })
    },
    // 修改当前项
    updateItem() {
      this.registration.cost = parseFloat(this.registration.cost)
      this.registration.price = parseFloat(this.registration.price)
      service(modifyChargitem, {
        item_id: this.registration.item_id,
        items: [
          { name: 'seq_num', newVal: this.registration.seq_num },
          { name: 'name', newVal: this.registration.name },
          { name: 'price', newVal: this.registration.price },
          { name: 'cost', newVal: this.registration.cost },
          { name: 'szsbcode', newVal: this.registration.seq_num },
          { name: 'szsbname', newVal: this.registration.name },
          { name: 'szsbprice', newVal: this.registration.szsbprice },
          { name: 'szsbzhenliaokey', newVal: this.registration.szsbzhenliaokey }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.updateView()
          this.reset()
        }
      })
    },
    // 修改状态
    changeStatus(index, status) {
      service(modifyChargitem, {
        item_id: this.registrations[index].item_id,
        items: [
          { name: 'disabled', newVal: status + '' }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.registrations[index].disabled = status
        }
      })
    }
  },
  computed: {
    oparation() {
      return this.action === 'edit' ? '编辑' : '新增'
    }
  },
  filters: {
    statusFilter(status) {
      return status === 0 ? '已启用' : '已禁用'
    },
    clinicDateFilter(date) {
      const str = date + ''
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    }
  },
  created() {
    this.getItemList()
  }
}
</script>

<style lang="scss" scoped>
.registration-fee {
  margin-top: 20px;
  margin-left: 30px;
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
