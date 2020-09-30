<template>
  <div class="material">
    <div class="add-material">
      <el-button size="small" type="primary" @click="modifyMaterial(-1)">新增耗材项</el-button>
    </div>
    <el-table :data="showData" type="index" stripe>
      <el-table-column align="center" prop="seq_num" label="编号"></el-table-column>
      <el-table-column align="center" prop="name" label="名称"></el-table-column>
      <el-table-column prop="cost" label="成本价" align="center"></el-table-column>
      <el-table-column prop="price" label="销售价" align="center"></el-table-column>
      <el-table-column prop="unit" label="单位" align="center"></el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | clinicDateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="社保备案状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.szsbstatus | sheBaoStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.disabled | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="modifyMaterial(scope.$index)" type="text">编辑</el-button>
          <el-button @click="forbidMaterial(scope.$index)" v-show="scope.row.disabled === 0" type="text" style="color: #f00;">禁用</el-button>
          <el-button @click="startMaterial(scope.$index)" v-show="scope.row.disabled !== 0" type="text" style="color: #42b983;">启用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :page-size="pagesize" layout="total, prev, pager, next, jumper" :total="total"
      @current-change="pageChange">
    </el-pagination>
    <el-dialog :title="oparation + '耗材'" :visible.sync="modifyMaterialShow" :before-close="handleClose" align="center">
      <el-form :model="material" :rules="materialRules" ref="material" label-width="100px" size="small">
        <el-form-item label="编号:" prop="seq_num">
          <el-input v-model="material.seq_num" :disabled="false"></el-input>
        </el-form-item>
        <el-form-item label="名称:" prop="name">
          <el-autocomplete popper-class="my-autocomplete" v-model="material.name" value-key="name"
            :disabled="canEditName" :fetch-suggestions="querySearch" placeholder="请选择耗材名称" 
            :trigger-on-focus="false" @select="handleSelect" style="width: 100%;">  
            <template slot-scope="props">
              <div class="think">
                <p>
                  <span>{{ props.item.name }}</span>
                  <span style="color: #8492a6;font-size: 12px;margin-left: 10px;">社保</span>
                </p>
                <p>
                  <span>社保编号: </span>
                  <span class="code">{{ props.item.code }}</span>
                </p>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="成本价:" prop="cost">
          <el-input v-model="material.cost" ref="cost" @keyup.native="myPriceLimit('cost')" @blur="paddingZero('cost', 2)"></el-input>
        </el-form-item>
        <el-form-item label="销售价:" prop="price">
          <el-input v-model="material.price" ref="price" @keyup.native="myPriceLimit('price')" @blur="paddingZero('price', 2)"></el-input>
        </el-form-item>
        <el-form-item label="单位:" prop="unit">
          <el-input v-model="material.unit"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyMaterialConfirm('material')">确定</el-button>
          <el-button @click="modifyMaterialCancel('material')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { floatLimit } from '@/utils/inputLimit'
import { paddingEndZero } from '@/utils/filters'
import service from '@/utils/request'
import { fuzzysearchcailiao, getcailiaoByKey, createChargitem, getChargitemInfo, modifyChargitem, getChargitemList } from '@/serve/api'
export default {
  data() {
    return {
      materials: [],
      modifyMaterialShow: false,
      material: {
        type: 4,
        seq_num: '',
        name: '',
        cost: '',
        price: '',
        unit: '',
        szsbcode: '',
        szsbname: '',
        szsbprice: 0,
        szsbzhenliaokey: ''
      },
      canEditName: false,
      selectedItem: {},  // 点击联想选中的信息
      materialRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入成本价', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入销售价', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位', trigger: 'blur' }
        ]
      },
      action: '',  // 记录是新增还是编辑
      index: -1,  // 记录编辑的行号
      // 分页
      pageindex: 0,
      pagesize: 10,
      total: 0
    }
  },
  methods: {
    querySearch(queryString, callback) {  // 联想
      clearTimeout(this.timeout)
      service(fuzzysearchcailiao, {
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
      this.material.seq_num = item.code
      this.material.szsbzhenliaokey = item.key
      service(getcailiaoByKey, {
        key: item.key
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.selectedItem = res.cailiao
          this.material.name = res.cailiao.ake002
          this.material.szsbprice = res.cailiao.bkm055 || 0
        }
      })
    },
    modifyMaterial(index) {
      this.index = index
      this.action = index > -1 ? 'edit' : 'new'
      if (index > -1) {
        this.getCurrentItem()
      }
      this.modifyMaterialShow = true
    },
    modifyMaterialCancel(ruleForm) {
      this.modifyMaterialShow = false
      this.$refs[ruleForm].resetFields()
    },
    handleClose() {
      this.reset()
    },
    modifyMaterialConfirm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
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
    startMaterial(index) {
      this.changeStatus(index, 0)
    },
    forbidMaterial(index) {
      this.$confirm('禁用后将无法使用, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.changeStatus(index, 1)
      })
    },
    myPriceLimit(th) {
      this.material[th] = floatLimit(this.material[th], 2)
    },
    // 末尾补零
    paddingZero(label, len) {
      this.material[label] = paddingEndZero(this.material[label], len)
    },
    reset() {
      // 重置表单
      this.material = {
        seq_num: '',
        type: 4,
        name: '',
        cost: '',
        price: '',
        unit: '',
        szsbcode: '',
        szsbname: '',
        szsbprice: 0,
        szsbzhenliaokey: ''
      }
      this.selectedItem = {}
      this.$refs.material.resetFields()
      this.modifyMaterialShow = false
    },
    updateView() {
      this.showData[this.index].seq_num = this.material.seq_num
      this.showData[this.index].name = this.material.name
      this.showData[this.index].cost = this.material.cost
      this.showData[this.index].price = this.material.price
      this.showData[this.index].unit = this.material.unit
    },
    // 分页
    pageChange(index) {
      this.pageindex = index - 1
    },
    getItemList() {  // 全部获取
      service(getChargitemList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          res = res && res.length ? res : []
          this.materials = res.filter(obj => obj.type === 4).sort((a, b) => b.create_time - a.create_time)
          this.total = this.materials.length
        }
      })
    },
    addItem() {
      this.material.type = parseInt(this.material.type, 10)
      this.material.cost = parseFloat(this.material.cost)
      this.material.price = parseFloat(this.material.price)
      service(createChargitem, {
        ...this.material,
        szsbcode: this.material.seq_num,
        szsbname: this.material.name,
        szsbprice: this.material.szsbprice,
        szsbpricelevel: '4',
        szsbzhenliaokey: this.material.szsbzhenliaokey
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.materials.unshift(res)
          this.reset()
        }
      })
    },
    // 获取当前编辑的信息
    getCurrentItem() {
      service(getChargitemInfo, {
        item_id: this.showData[this.index].item_id
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.material = res
        }
      })
    },
    // 修改当前项
    updateItem() {
      this.material.cost = parseFloat(this.material.cost)
      this.material.price = parseFloat(this.material.price)
      service(modifyChargitem, {
        item_id: this.material.item_id,
        items: [
          { name: 'seq_num', newVal: this.material.seq_num },
          { name: 'name', newVal: this.material.name },
          { name: 'price', newVal: this.material.price },
          { name: 'cost', newVal: this.material.cost },
          { name: 'unit', newVal: this.material.unit },
          { name: 'szsbcode', newVal: this.material.seq_num },
          { name: 'szsbname', newVal: this.material.name },
          { name: 'szsbprice', newVal: this.material.szsbprice },
          { name: 'szsbzhenliaokey', newVal: this.material.szsbzhenliaokey }
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
        item_id: this.showData[index].item_id,
        items: [
          { name: 'disabled', newVal: status + '' }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.showData[index].disabled = status
        }
      })
    }
  },
  computed: {
    oparation() {
      return this.action === 'edit' ? '编辑' : '新增'
    },
    showData() {
      const pagecount = Math.ceil(this.materials.length / this.pagesize)
      if (this.pageindex === pagecount - 1) {
        return this.materials.slice(this.pageindex * this.pagesize)
      }
      return this.materials.slice(this.pageindex * this.pagesize, (this.pageindex + 1) * this.pagesize)
    }
  },
  filters: {
    statusFilter(status) {
      return status === 0 ? '已启用' : '已禁用'
    },
    clinicDateFilter(date) {
      const str = date + ''
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    },
    sheBaoStatusFilter(status) {
      if (status <= 0) {
        return '未备案'
      } else if (status === 1) {
        return '已备案'
      }
    }
  },
  created() {
    this.getItemList()
  }
}
</script>

<style lang="scss" scoped>
.material {
  margin-top: 20px;
  margin-left: 30px;
  .add-material {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
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
