<template>
  <div class="treament">
    <div class="add-treatment">
      <el-button size="small" type="primary" @click="modifyTrentment(-1)">添加</el-button>
      <el-upload class="upload-button" ref="upload" action="https://jsonplaceholder.typicode.com/posts/"
        :file-list="fileList" :before-upload="beforeFileUpload">
        <el-button class="import" slot="trigger" size="small" type="primary">一键导入</el-button>
      </el-upload>
      <router-link class="download" to="/static/诊疗项目批量导入.xlsx">下载模板</router-link>
    </div>
    <el-table :data="showData" type="index" stripe>
      <el-table-column prop="seq_num" label="社保编号" align="center"></el-table-column>
      <el-table-column prop="name" label="名称" align="center"></el-table-column>
      <el-table-column prop="cost" label="成本价" align="center"></el-table-column>
      <el-table-column prop="price" label="项目单价" align="center"></el-table-column>
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
          <el-button @click="modifyTrentment(scope.$index)" type="text">编辑</el-button>
          <el-button @click="forbidTreament(scope.$index)" v-show="scope.row.disabled === 0" type="text" style="color: #f00;">禁用</el-button>
          <el-button @click="startTreament(scope.$index)" v-show="scope.row.disabled !== 0" type="text" style="color: #42b983;">启用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :page-size="pagesize" layout="total, prev, pager, next, jumper" :total="total"
      @current-change="pageChange">
    </el-pagination>
    <!-- 修改诊疗项目弹窗 -->
    <el-dialog :title="oparation + '诊疗项目'" :visible.sync="modifyTreamentShow" :before-close="handleClose" align="center">
      <el-form :model="treament" :rules="treamentRules" ref="treanent" label-width="100px" size="small">
        <el-form-item label="社保编号:" prop="seq_num">
          <el-input v-model="treament.seq_num" :disabled="false"></el-input>
        </el-form-item>
        <el-form-item label="名称:" prop="name">
          <el-autocomplete popper-class="my-autocomplete" v-model="treament.name" value-key="name"
            :disabled="canEditName" :fetch-suggestions="querySearch" @select="handleSelect"
            placeholder="请选择诊疗项目名称" :trigger-on-focus="false" style="width: 100%;">  
            <template slot-scope="props">
              <div class="think">
                <p>
                  <span>{{ props.item.name }}</span>
                  <span style="color: #8492a6;font-size: 12px;margin-left: 10px;">社保</span>
                </p>
                <p>
                  <span class="code">社保编号: {{ props.item.code }}</span>
                </p>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="成本价:" prop="cost">
          <el-input v-model="treament.cost" @keyup.native="myPriceLimit('cost')" @blur="paddingZero('cost', 2)"></el-input>
        </el-form-item>
        <el-form-item label="销售价:" prop="price">
          <el-input v-model="treament.price" @keyup.native="myPriceLimit('price')" @blur="paddingZero('price', 2)"></el-input>
        </el-form-item>
        <el-form-item label="单位:" prop="unit">
          <el-input v-model="treament.unit"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyTrentmentConfirm('treanent')">确定</el-button>
          <el-button @click="modifyTrentmentCancel('treanent')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { floatLimit } from '@/utils/inputLimit'
import { paddingEndZero } from '@/utils/filters'
import XLSX from 'xlsx'
import service from '@/utils/request'
import { fuzzysearchzhenliao, getzhenliaoByKey, createChargitem, getChargitemInfo, modifyChargitem, getChargitemList } from '@/serve/api'
export default {
  data() {
    return {
      treaments: [],
      modifyTreamentShow: false,
      treament: {
        seq_num: '', // 社保编号
        type: 3,
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
      treamentRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' }
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
      total: 0,
      // 读取文件相关
      fileList: [],
      outputs: []
    }
  },
  methods: {
    querySearch(queryString, callback) { // 联想
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
      this.treament.seq_num = item.code
      this.treament.szsbzhenliaokey = item.key
      service(getzhenliaoByKey, {
        key: item.key
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.selectedItem = res.zhenliao
          this.treament.name = res.zhenliao.ake002
          this.treament.szsbprice = res.zhenliao.bkm055 || 0
        }
      })
    },
    modifyTrentment(index) {
      this.index = index
      this.action = index > -1 ? 'edit' : 'new'
      if (index > -1) {
        this.getCurrentItem()
      }
      this.modifyTreamentShow = true
    },
    modifyTrentmentCancel(ruleForm) {
      // 重置表单
      this.$refs[ruleForm].resetFields()
      this.modifyTreamentShow = false
    },
    handleClose() {
      this.reset()
    },
    modifyTrentmentConfirm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          // 修改成功的处理
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
    startTreament(index) {
      this.changeStatus(index, 0)
    },
    forbidTreament(index) {
      this.$confirm('禁用后将无法使用, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.changeStatus(index, 1)
      })
    },
    myPriceLimit(value) {
      this.treament[value] = floatLimit(this.treament[value], 2)
    },
    // 末尾补零
    paddingZero(label, len) {
      this.treament[label] = paddingEndZero(this.treament[label], len)
    },
    reset() {
      // 重置表单
      this.treament = {
        seq_num: '',
        type: 3,
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
      this.$refs.treanent.resetFields()
      this.modifyTreamentShow = false
    },
    updateView() {
      this.showData[this.index].seq_num = this.treament.seq_num
      this.showData[this.index].name = this.treament.name
      this.showData[this.index].cost = this.treament.cost
      this.showData[this.index].price = this.treament.price
      this.showData[this.index].unit = this.treament.unit
    },
    // 分页
    pageChange(index) {
      this.pageindex = index - 1
    },
    getItemList() { // http request 全部获取
      service(getChargitemList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          res = res && res.length ? res : []
          this.treaments = res.filter(obj => obj.type === 3).sort((a, b) => b.create_time - a.create_time)
          this.total = this.treaments.length
        }
      })
    },
    addItem() {
      this.treament.type = parseInt(this.treament.type, 10)
      this.treament.cost = parseFloat(this.treament.cost)
      this.treament.price = parseFloat(this.treament.price)
      service(createChargitem, {
        ...this.treament,
        szsbcode: this.treament.seq_num,
        szsbname: this.treament.name,
        szsbprice: this.treament.szsbprice,
        szsbzhenliaokey: this.treament.szsbzhenliaokey,
        szsbpricelevel: '4'
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.treaments.unshift(res)
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
          this.treament = res
        }
      })
    },
    // 修改当前项
    updateItem() {
      this.treament.cost = parseFloat(this.treament.cost)
      this.treament.price = parseFloat(this.treament.price)
      service(modifyChargitem, {
        item_id: this.treament.item_id,
        items: [
          { name: 'seq_num', newVal: this.treament.seq_num },
          { name: 'name', newVal: this.treament.name },
          { name: 'price', newVal: this.treament.price },
          { name: 'cost', newVal: this.treament.cost },
          { name: 'unit', newVal: this.treament.unit },
          { name: 'szsbcode', newVal: this.treament.seq_num },
          { name: 'szsbname', newVal: this.treament.name },
          { name: 'szsbprice', newVal: this.treament.szsbprice },
          { name: 'szsbzhenliaokey', newVal: this.treament.szsbzhenliaokey }
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
    },
    // 上传文件之前的钩子
    beforeFileUpload(file) {
      if (file.size <= 0) {  // 如果没有文件名
        return false
      } else if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
        this.$message.error('上传格式不正确，请上传xls或者xlsx格式')
        return false
      }
      const fileReader = new FileReader()
      fileReader.onload = ev => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0]  // 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])  // 生成json表格内容
          this.outputs = []  // 清空接收数据
          for (let i = 0; i < ws.length; i++) {
            const sheetData = {
              type: 3,
              szsbzhenliaokey: '',
              szsbcode: ws[i]['社保编号'] ? '' + ws[i]['社保编号'] : '',
              seq_num: ws[i]['社保编号'] ? '' + ws[i]['社保编号'] : '',
              szsbname: ws[i]['名称'],
              name: ws[i]['名称'],
              szsbprice: ws[i]['社保价'] ? +ws[i]['社保价'] : 0,
              price: +ws[i]['销售价'],
              cost: +ws[i]['成本价'],
              unit: ws[i]['单位'],
              szsbpricelevel: '4'
            }
            this.outputs.push(sheetData)
          }
          this.batchImport(this.outputs)
        } catch (e) {
          return false
        }
      }
      fileReader.readAsBinaryString(file)
    },
    // 批量获取szsbzhenliaokey，然后添加
    batchImport(arr) {
      arr.forEach(e => {
        if (e.seq_num && e.szsbcode) {
          service(fuzzysearchzhenliao, {
            name: e.szsbname
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              // 成功的回调，直接返回data
              if (res && res.outputlist && res.outputlist.length) {
                e.szsbzhenliaokey = res.outputlist[0].key
                if (e.szsbzhenliaokey) {
                  service(createChargitem, e).then(res => {
                    if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
                      this.treaments.unshift(res)
                      this.reset()
                    }
                  })
                }
              } else {
                this.$message.warning(`${e.szsbname}  库内没有`)
              }
            }
          })
        } else {
          service(createChargitem, e).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              this.treaments.unshift(res)
              this.reset()
            }
          })
        }
      })
      setTimeout(() => {
        this.$message.success('导入完成')
        this.getItemList()
      }, 4000)
    }
  },
  computed: {
    oparation() {
      return this.action === 'edit' ? '编辑' : '新增'
    },
    showData() {
      const pagecount = Math.ceil(this.treaments.length / this.pagesize)
      if (this.pageindex === pagecount - 1) {
        return this.treaments.slice(this.pageindex * this.pagesize)
      }
      return this.treaments.slice(this.pageindex * this.pagesize, (this.pageindex + 1) * this.pagesize)
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
.treament {
  margin-top: 20px;
  margin-left: 30px;
  .add-treatment {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    display: flex;
    align-items: center;
    .upload-button {
      margin-left: 20px;
    }
    .download {
      margin-left: 20px;
      background: #42b983;
      color: #fff;
      width: 100px;
      height: 34px;
      line-height: 34px;
      text-align: center;
      border-radius: 4px;
      font-size: 12px;
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
