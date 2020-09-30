<template>
  <div class="all-accounts">
    <h3 class="title">HIS日对账</h3>
    <div class="header">
      <span class="month">选择对账月份: </span>
      <el-date-picker v-model="indexDate" type="month" placeholder="选择日期" size="small" @change="callHis"></el-date-picker>
    </div>
    <el-table :data="tableList" stripe>
      <el-table-column align="center" prop="bad766" label="对账日期">
        <template slot-scope="scope">
          <span>{{ scope.row.bad766 | bad766 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="akc264" label="费用(元)">
        <template slot-scope="scope">
          <span>{{ scope.row.akc264 | priceFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="对账情况">
        <template slot-scope="scope">
          <span :class="{'color-red': scope.row.dzstatus === 0}">{{ scope.row.dzstatus | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="getDayChargeItemList(scope.row.bad766, scope.$index)" :disabled="scope.row.dzstatus === 1">对账</el-button>
          <el-button type="text" @click="contrastDay(scope.row.bad766)" style="color: #f00;">流水对比</el-button>
          <el-button type="text" @click="getDrugData(scope.row.bad766)" style="color: #42b983;">上报</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import service from '@/utils/request'
import { getszsbmonthdata, sbDzdaily, getszsbdailydata, setduizhangstatus, getDrugUpData, drugDeliver } from '@/serve/api'
import connectionTest from '@/common/connection'
export default {
  data() {
    return {
      currentPage: 1,
      tableList: [],
      total: 0,
      indexDate: new Date()
    }
  },
  methods: {
    contrastDay(data) {
      this.$router.push(`/setting/bind/accounts/day-accounts/${data}`)
    },
    // 调his对账
    callHis() {
      service(getszsbmonthdata, {
        reqdate: parseFloat(new Date(this.indexDate).format('yyyyMM'))
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.tableList = res.data
        }
      })
    },
    getDayChargeItemList(bad766, index) {  // 获取单日账单详情
      this.$confirm('是否确认对账', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        service(getszsbdailydata, {
          reqdate: bad766
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            if (res.data && !res.data.length) {
              return
            }
            // 将字段替换
            const obj = JSON.parse(JSON.stringify(res.data[0]).replace(/itemlist/g, 'inputlist'))
            this.reconciliation(obj, index)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消',
          showClose: true,
          duration: 1000
        })
      })
    },
    // 调社保客户端对账
    async reconciliation(obj) {
      const connectionStatus = await connectionTest()
      if (connectionStatus !== '1') {
        return
      }
      service(sbDzdaily, {
        transBody: obj
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          let status = ''
          if (res.transBody.aae531 === '1') {
            status = '此次对帐通过'
            this.saveDayAccount(obj.bad766)
          } else if (res.transBody.aae531 === '2') {
            status = '帐目已通过，无需再次对帐'
          } else {
            status = '支付项目或金额不符'
          }
          this.$alert(`${status}`, '结账结果', {
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true,
            callback: () => {}
          })
        }
      })
    },
    // 保存对账结果
    saveDayAccount(bad766) {
      service(setduizhangstatus, {
        reqdate: bad766,
        dzstatus: 1,
        itemffect: 1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.callHis()
        }
      })
    },
    // 药品销售上报
    // 获取上报数据
    getDrugData(date) {
      service(getDrugUpData, {
        begin_time: date + '',
        end_time: date + '',
        page_index: 0,
        page_size: 1000000
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.ToSocialSecurity(res.result)
        }
      })
    },
    // 调社保客户端
    ToSocialSecurity(arr) {
      const list = arr.filter(drug => drug.ake001 && drug.standardnumber)
      if (!list.length) {
        this.$message({ message: '无药品需上报' })
        return
      }
      const inputList = list.map((drug, i) => {
        return {
          push_id: Number(drug.push_id),  // 批号
          business_type: '1',  // 业务类别
          pres_sno: drug.standardnumber,  // 处方号（单据号）
          record_sno: drug.standardnumber + i,  // 发药序列号
          standard_code: drug.standardnumber,  // 药品本位码
          drug_code: drug.ake001,  // 药品-编码
          drug_name: drug.productname,  // 药品-名称
          drug_std: drug.spectxt,  // 药品-规格
          unit: drug.xiaoshou_dw,  // 发药单位
          numbers: drug.xiaoshou_num,  // 数量
          amount: drug.shebao_price,  // 金额
          out_recordtime: Number(drug.date),  // 发(退)药日期
          last_editedtime: Number(new Date().format('yyyyMMddhhmmss'))  // POS机最后编辑时间
        }
      })
      service(drugDeliver, {
        transBody: {
          listsize: list.length,
          inputList: inputList
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '上报成功！',
            type: 'success'
          })
        }
      })
    }
  },
  created() {
    this.callHis()
  },
  filters: {
    bad766(date) {
      const string = date.toString()
      return string.substring(0, 4) + '-' + string.substring(4, 6) + '-' + string.substring(6, 8)
    },
    statusFilter(status) {
      if (status === 0) {
        return '未对账'
      } else if (status === 1 || status === 2) {
        return '对账成功'
      }
      return '对账失败'
    }
  }
}
</script>

<style lang="scss" scoped>
.all-accounts {
  margin-top: 20px;
  margin-left: 30px;
  .title {
    text-align: center;
    color: #666;
  }
  .header {
    .month {
      color: #666;
    }
    .el-date-picker {
      margin-left: 10px;
    }
  }
  .el-table {
    margin-top: 20px;
    width: 100%;
  }
}
</style>

