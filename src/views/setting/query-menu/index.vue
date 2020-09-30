<template>
  <div class="query-menu">
    <div class="head">
      <el-button type="primary" size="small" @click="download">导出本页数据</el-button>
      <el-button type="warning" size="small" @click="batchCancelBooking">批量撤销</el-button>
    </div>
    <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="ake001" label="社保编码" align="center" min-width="100px" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="ake002" label="名称" align="center" mmin-width="120px" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="ake003" label="目录类别" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ake003 | ake003Filter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="bka506" label="价格" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.bka506 | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="aae030" label="备案日期" align="center" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="baa201" label="目录申请状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.baa201 | baa201Filter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="aae016" label="办结状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.aae016 | aae016Filter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="aae013" label="备注" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="cancelBooking(scope.row)" style="color: #f00;">撤销</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { bookingQuery, bookingCancel, sbzbinfoupdate, batchmodifychargitem } from '@/serve/api'
import service from '@/utils/request'
import { menuCode } from '@/common/code'
import connectionTest from '@/common/connection'
export default {
  props: {
    menuType: {  // 目录类别 1药品 2诊疗项目 3材料 5辅助器具项目 空时查询所有
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tableData: [],
      selectList: []
    }
  },
  methods: {
    handleSelectionChange(data) {
      this.selectList = data
    },
    // 批量撤销备案
    batchCancelBooking() {
      const inputlist = []
      const recordArr = []
      const itemArr = []
      this.$confirm(`是否批量撤销该${this.selectList.length}项备案?请谨慎操作`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 遍历生成传参数组
        this.selectList.forEach(item => {
          inputlist.push({
            ake003: item.ake003,   // 目录类别
            ake005: item.ake001   // 编码
          })
          recordArr.push({
            ake001: item.ake001,
            szsbstatus: -1,  // 默认0， 备案成功1
            shebao_price: -1  // -1时不修改价格
          })
          itemArr.push({
            szsbcode: item.ake001,
            items: [
              {
                name: 'szsbstatus',
                newVal: -1,
              }, {
                name: 'szsbprice',
                newVal: -1
              }
            ]
          })
        })
        // 调医保撤销接口
        service(bookingCancel, {
          transBody: {
            listsize: this.selectList.length,
            inputlist
          }
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            if (this.menuType === '1') {
              // 更新his药品状态
              service(sbzbinfoupdate, { recordArr }).then(res => {
                if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
                  this.$message({ message: '药品备案撤销成功', type: 'success', showClose: true, duration: 1500 })
                  this.tableData = []
                  this.getApplyMenu(1)
                }
              })
            } else if (this.menuType === '2') {
              // 更新his诊疗项目的状态
              service(batchmodifychargitem, { itemArr }).then(res => {
                if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
                  this.$message({ message: '诊疗项备案成功', type: 'success', showClose: true, duration: 1000 })
                  this.tableData = []
                  this.getApplyMenu(1)
                }
              })
            }
          }
        })
      }).catch(() => {
        this.selectList = []
      })
    },
    getApplyMenu(pageNo) {
      service(bookingQuery, {
        transBody: {
          pageno: pageNo,
          ake003: this.menuType  // 目录类别 1药品 2诊疗项目 3材料 5辅助器具项目 空时查询所有
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.tableData = res.transBody && res.transBody.outputlist ? this.tableData.concat(res.transBody.outputlist) : this.tableData
          if (res.transBody.endpage === '0') {
            this.getApplyMenu(pageNo + 1)
          }
        }
      })
    },
    cancelBooking(item) {
      this.$confirm(`是否撤销 ${item.ake002} 备案?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        service(bookingCancel, {
          transBody: {
            listsize: 1,
            inputlist: [
              {
                ake003: item.ake003,   // 目录类别
                ake005: item.ake001   // 编码
              }
            ]
          }
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            if (this.menuType === '1') {
              this.changeDrugStatus(item)
            } else if (this.menuType === '2') {
              this.changeSheBaoChargeItemStatus(item)
            }
          }
        })
      }).catch()
    },
    changeDrugStatus(item) {
      service(sbzbinfoupdate, {
        recordArr: [
          {
            ake001: item.ake001,
            szsbstatus: -1,  // 默认0，备案成功1
            shebao_price: -1  // -1时不修改价格
          }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '药品备案撤销成功', type: 'success', showClose: true, duration: 1500 })
          this.tableData = []
          this.getApplyMenu(1)
        }
      })
    },
    changeSheBaoChargeItemStatus(item) {  // 修改his诊疗项备案状态
      const contents = {
        szsbcode: item.ake001,
        items: [
          {
            name: 'szsbstatus',
            newVal: -1
          },
          {
            name: 'szsbprice',
            newVal: -1
          }
        ]
      }
      service(batchmodifychargitem, {
        itemArr: [contents]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '诊疗项备案成功', type: 'success', showClose: true, duration: 1000 })
          this.tableData = []
          this.getApplyMenu(1)
        }
      })
    },
    download() {  // 导出csv
      if (!this.tableData.length) return
      const obj = document.querySelector('#download')
      let str = '社保编码, 名称, 价格, 备案日期, 目录申请状态, 办结状态\n'
      this.tableData.forEach(val => {
        let baa201 = ''
        switch (val.baa201) {
          case '0':
            baa201 = '审批中'
            break
          case '1':
            baa201 = '审批通过'
            break
          case '2':
            baa201 = '审批不通过'
            break
          default:
            break
        }
        str += `${val.ake001},${val.ake002},${val.bka506},${val.aae030},${baa201},${val.aae016}\n`
      })
      str = encodeURIComponent(str)
      obj.href = `data:text/csv;charset=utf-8,\ufeff${str}`
      obj.download = '诊所申请目录.csv'
    }
  },
  async created() {
    const connectionStatus = await connectionTest()
    if (connectionStatus === '1') {
      this.getApplyMenu(1)
    }
  },
  filters: {
    ake003Filter(val) {  // 目录类别
      return menuCode.ake003[val]
    },
    baa201Filter(val) {  // 目录申请状态
      return menuCode.baa201[val]
    },
    aae016Filter(val) {  // 办结状态
      return menuCode.aae016[val]
    }
  }
}
</script>

<style lang="scss" scoped>
.query-menu {
  margin-top: 20px;
  margin-left: 30px;
  .el-table {
    margin-top: 20px;
    width: 100%;
  }
}
</style>
