<template>
  <div class="return-medical">
    <el-row>
      <el-col :span="12">
        <p>客户姓名: {{ message.name }}</p>
        <p>客户手机: {{ message.phone }}</p>
      </el-col>
      <el-col :span="12">
        <p>性别: {{ message.gender | sexFilter }}</p>
        <p>年龄: {{ message.birthdate | birthFilter }}</p>
      </el-col>
    </el-row>
    <el-table :data="tableData" @selection-change="handleSelectionChange" :default-expand-all="true">
      <el-table-column type="selection" width="60" v-if="!doNot" :selectable="selectable"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form class="demo-table-expand">
            <el-form-item>
              <strong>组合</strong>
              <strong>药品名称</strong>
              <strong>药品规格</strong>
              <strong>生产厂家</strong>
              <strong>用法</strong>
              <strong>单次剂量</strong>
              <strong>用药频次</strong>
              <strong>开药数量</strong>
            </el-form-item>
            <el-form-item v-for="(item, index) in scope.row.drug_list" :key="index">
              <span>{{ item.group_index_str }}</span>
              <span>{{ item.name }}</span>
              <span>{{ item.spec_text }}</span>
              <span>{{ item.producer }}</span>
              <span>{{ item.use_method }}</span>
              <span>{{ item.dosage }}{{ item.dose_unit }}</span>
              <span>{{ item.frequency }}</span>
              <span>{{ item.total }}{{ item.total_unit }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <strong>{{ prescription }}</strong>
          <strong>( 科室: {{ scope.row.dept_name | department }}, 医生: {{ scope.row.doctor }} )</strong>
          <span class="drug-return" v-if="scope.row.status === 3">已退药</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="footer">
      <el-button type="primary" size="small" :disabled="doNot" @click="deliverBack">退药</el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { drugDeliver, drugDeleteStore } from '@/serve/api'
export default{
  data() {
    return {
      message: {
        num: '',   // 就诊号
        name: '',    // 姓名
        phone: '',  // 手机
        gender: '',     // 性别
        birthdate: ''   // 年龄
      },
      tableData: [],
      // 是否打印退药明细
      checked: true,
      // 请求发药信息列表传给后台的items
      items: [],
      // 处方名字
      prescription: '处方',
      // 钩选的处方所需要传给后台的数组
      multipleSelection: [],
      // 传到社保的数组
      inputList: [],
      arr2: [], // 分割的药品数组
      // 传到后台的创建时间
      create_time: '',
      patient_id: '',
      // 根据drug_opstype设置可用不可用
      doNot: true,
      // 发药单号
      deliver_sn: '',
      BindSheBao: false
    }
  },
  methods: {
    // 勾选需要的药品
    handleSelectionChange(value) {
      this.multipleSelection = []
      this.infoList = value
      value.forEach(select => {
        this.multipleSelection.push({
          item_id: select.item_id,
          item_type: select.item_type,
          regist_id: select.regist_id,
          paymethod: select.paymethod
        })
      })
    },
    // 判断是否绑定社保
    judgeBindSheBao() {
      if (this.shebao && this.shebao.hospitalCode) {
        this.BindSheBao = true
      }
    },
    selectable(row) {
      return row.status !== 3
    },
    // 点击退药操作
    deliverBack() {
      if (this.multipleSelection.length !== 0) {
        this.$confirm('是否确认退药?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 是否绑定社保 是否打开客户端
          this.returnDrugBack()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退药'
          })
        })
      } else {
        this.$message.error('请勾选药品')
      }
    },
    // 请求已发药的药品信息
    recordInfo() {
      this.$http.post('/service/drugdeliver/recordinfo', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic, // 必填
          create_time: this.create_time
        }
      }).then(res => {
        this.tableData = res.data.data.items
        this.patient_id = res.data.data.items[0].patient_id
        this.message.gender = res.data.data.items[0].patient_gender
        this.message.birthdate = res.data.data.items[0].patient_birthday
        // 默认禁用，只要一个处方的状态为2，就解除禁用（2是已发药 3已退药 4是已退费）
        for (let i = 0; i < res.data.data.items.length; i++) {
          if (res.data.data.items[i].status === 2) {
            this.doNot = false  //  解除禁用
          }
        }
      }).catch()
    },
    // 退药接口函数
    returnDrugBack() {
      this.$http.post('/service/drugdeliver/dback', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic, // 必填
          items: this.multipleSelection,  // 钩选的处方所需要传给后台的数组
          patient_id: this.patient_id,
          patient_name: this.message.name,
          deliver_sn: this.deliver_sn
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            message: '退药成功',
            type: 'success'
          })
          setTimeout(() => {
            this.$router.back()
          }, 800)
        } else {
          this.$message.error('该药品已退')
        }
      }).catch()
    },
    // 创建传到社保的发药数组
    makeSheBaoList() {
      const inputList = []
      this.infoList.forEach(val => {
        val.drug_list.forEach(valin => {
          if (valin.druginfo && valin.druginfo.ake001 && valin.druginfo.ake001 !== '') {
            const obj = {
              push_id: Number(valin.push_id),  // 批号
              business_type: '1',  // 业务类别
              pres_sno: val.danju,  // 处方号（单据号）
              record_sno: valin.danju + valin.druginfo.standard_number,  // 发药序列号
              standard_code: valin.druginfo.standard_number,  // 药品本位码
              drug_code: valin.druginfo.ake001,  // 药品编码
              drug_name: valin.druginfo.product_name,  // 药品名称
              drug_std: valin.druginfo.aka074,  // 药品规格
              unit: valin.total_unit,  // 发药单位
              numbers: -valin.total,  // 数量
              amount: valin.druginfo.shebao_price, // 金额
              out_recordtime: Number(new Date().format('yyyyMMdd')),  // 发(退)药日期
              last_editedtime: Number(new Date().format('yyyyMMddhhmmss'))  // POS最后编辑时间
            }
            inputList.push(obj)
            this.inputList = inputList
          }
        })
      })
      this.runSheBao()
    },
    // 调社保客户端
    ToSocialSecurity(arr) {
      service(drugDeliver, {
        transBody: {
          listsize: arr.length,
          inputList: arr
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (this.arr2.length === 0) {
            this.returnDrugBack()
          } else {
            this.midTransIt()
          }
        }
      })
    },
    // 分割与调社保之间的中间函数
    midTransIt() {
      if (this.arr2.length > 0) {
        this.makeList(this.arr2)
      } else {
        this.ToSocialSecurity()
      }
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
    // 执行调社保的函数
    runSheBao() {
      if (this.inputList.length > 50) {
        const arrInside = this.inputList.slice(0, 49)
        const arr2Inside = this.inputList.slice(50)
        this.arr2 = arr2Inside
        this.ToSocialSecurity(arrInside)
      } else {
        this.ToSocialSecurity(this.inputList)
        this.arr2 = []
      }
    },
    // 点击撤销社保
    revokeSheBao() {
      if (this.multipleSelection.length !== 0) {
        const inputList = []
        this.infoList.forEach(val => {
          val.drug_list.forEach(valin => {
            if (valin.druginfo && valin.druginfo.ake001 && valin.druginfo.ake001 !== '') {
              const obj = {
                revoke_type: '3',  // 撤销类型
                push_id: Number(valin.push_id),  // 批号
                pres_sno: val.danju  // 单据号
              }
              inputList.push(obj)
              this.inputList = inputList
            }
          })
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
      } else {
        this.$message.error('请勾选药品')
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
  created() {
    this.create_time = this.purchRecode.val.create_time.toString()
    this.message.name = this.purchRecode.val.name
    this.message.phone = this.purchRecode.val.phone
    this.deliver_sn = this.purchRecode.val.deliver_sn
    this.recordInfo()
    this.judgeBindSheBao()
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'shebao', 'purchRecode'])
  },
  filters: {
    birthFilter(birth) {
      return new Date().format('yyyy') - birth.split('-')[0]
    },
    prescription(type) {
      if (type === 0) {
        return '西药处方'
      } else if (type === 1) {
        return '中药处方'
      }
    },
    department(dept) {
      if (dept === '') {
        return '没有指定科室'
      } else {
        return dept
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.return-medical {
  margin-top: 20px;
  margin-left: 30px;
  .el-table {
    width: 100%;
    margin-top: 20px;
    .el-form-item {
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-bottom: 1px dashed #ccc;
      .el-form-item__content {
        height: 40px;
      }
      strong, span {
        display: inline-block;
        width: 100px;
        margin-right: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &:nth-of-type(2) {
          width: 180px;
        }
        &:nth-of-type(3) {
          width: 180px;
        }
        &:nth-of-type(4) {
          width: 180px;
        }
      }
      .drug-return {
        color: #f00;
      }
    }
  }
}
.el-table__row.expanded {
  background-color: #ccc;
}
.footer {
  margin-top: 20px;
  text-align: center;
}
</style>
