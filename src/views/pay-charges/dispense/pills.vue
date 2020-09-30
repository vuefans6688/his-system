<template>
  <div class="pills">
    <el-row>
      <el-col :span="12">
        <p>客户姓名: {{ mes.name }}</p>
        <p>客户手机: {{ mes.phone }}</p>
      </el-col>
      <el-col :span="12">
        <p>性别: {{ mes.gender | sexFilter }}</p>
        <p>年龄: {{ mes.birthdate | birthFilter }}</p>
      </el-col>
    </el-row>
    <el-table :data="tableData" @selection-change="handleSelectionChange" ref="multipleTable" :default-expand-all="true">
      <el-table-column type="selection" width="60"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form class="demo-table-expand">
            <el-form-item>
              <el-col :span="2">组合</el-col>
              <el-col :span="5">药品名称</el-col>
              <el-col :span="3">药品规格</el-col>
              <el-col :span="5">生产厂家</el-col>
              <el-col :span="2">用法</el-col>
              <el-col :span="2">单次剂量</el-col>
              <el-col :span="3">用药频次</el-col>
              <el-col :span="2">开药数量</el-col>
            </el-form-item>
            <el-form-item v-for="(item, index) in scope.row.drug_list" :key="index">
              <el-col :span="2">{{ item.group_index_str }}</el-col>
              <el-col :span="5">{{ item.name }}</el-col>
              <el-col :span="3">{{ item.spec_text }}</el-col>
              <el-col :span="5">{{ item.producer }}</el-col>
              <el-col :span="2">{{ item.use_method }}</el-col>
              <el-col :span="2">{{ item.dosage }}{{ item.dose_unit }}</el-col>
              <el-col :span="3">{{ item.frequency }}</el-col>
              <el-col :span="2">{{ item.total }}{{ item.total_unit }}</el-col>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <strong>{{ prescription }}</strong>
          <strong v-if="scope.row.item_type !== 5">( 科室: {{ scope.row.dept_name | department }}, 医生: {{ scope.row.doctor }} )</strong>
        </template>
      </el-table-column>
    </el-table>
    <div class="footer">
      <el-button type="primary" size="small" @click="deliver">发药</el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { drugDeliver } from '@/serve/api'
export default {
  data() {
    return {
      mes: {
        num: '0001',   // 就诊号
        name: '',    // 姓名
        phone: '',  // 手机
        gender: 1,     // 性别
        birthdate: ''   // 年龄
      },
      infoList: [],
      tableData: [],
      // 是否打印发药明细
      checked: true,
      // 请求发药信息列表传给后台的items
      items: [],
      // 处方名字
      prescription: '处方',
      // 钩选的处方所需要传给后台的数组
      multipleSelection: [],
       // 传到社保的数组
      inputList: [],
      arr2: [],  // 分割的药品数组
      patient_id: '',
      BindSheBao: false
    }
  },
  methods: {
    // 判断是否绑定社保
    judgeBindSheBao() {
      if (this.shebao && this.shebao.hospitalCode) {
        this.BindSheBao = true
      }
    },
    // 点击发药按钮
    deliver() {
      if (this.multipleSelection.length !== 0) {
        this.$confirm('是否确认发药?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.sendMedical2()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消发药',
            showClose: true,
            duration: 1000
          })
        })
      } else {
        this.$message({
          showClose: true,
          duration: 1000,
          message: '请勾选药品',
          type: 'error'
        })
      }
    },
    // 创建传到社保的发药数组
    makeSheBaoList(arr) {
      const inputList = []
      this.infoList.forEach(vali => {
        arr.forEach(vala => {
          if (vali.item_id === vala.item_id) {
            vali.drug_list.forEach(vali1 => {
              vala.drug_list.forEach(vala1 => {
                if (vali1.druginfo && vali1.druginfo.ake001 && vali1.druginfo.ake001 !== '' && vali1.druginfo.szsbstatus === 1) {
                  const str1 = vali1.druginfo.drug_key
                  const str2 = vala1.drugkey
                  if (str1 === str2) {
                    const obj = {
                      push_id: Number(vala1.push_id),  // 批号
                      business_type: '1',  // 业务类别
                      pres_sno: vali.danju,  // 处方号（单据号）
                      record_sno: vali.danju + vali1.druginfo.standard_number,  // 发药序列号
                      standard_code: vali1.druginfo.standard_number,  // 药品本位码
                      drug_code: vali1.druginfo.ake001,  // 药品编码
                      drug_name: vali1.druginfo.product_name,  // 药品名称
                      drug_std: vali1.druginfo.aka074,  // 药品规格
                      unit: vali1.total_unit,  // 发药单位
                      numbers: vali1.total,  // 数量
                      amount: vali1.druginfo.shebao_price,  // 金额
                      out_recordtime: Number(new Date().format('yyyyMMdd')),  // 发(退)药日期
                      last_editedtime: Number(new Date().format('yyyyMMddhhmmss'))  // POS最后编辑时间
                    }
                    inputList.push(obj)
                    this.inputList = inputList
                  }
                }
              })
            })
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
            this.$message({
              showClose: true,
              duration: 1000,
              message: '发药成功！',
              type: 'success'
            })
            setTimeout(() => {
              this.$router.back()
            }, 800)
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
    // 选中的发药处方
    handleSelectionChange(val) {
      this.multipleSelection = [];
      this.infoList = val
      val.forEach(tt => {
        this.multipleSelection.push({
          item_id: tt.item_id,
          item_type: tt.item_type,
          regist_id: tt.regist_id,
          paymethod: tt.paymethod
        })
      })
    },
    // 调自己系统的发药接口1
    sendMedical1() {
      this.$http.post('/service/drugdeliver/deliver', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic,  // 必填
          items: this.multipleSelection,  // 钩选的处方所需要传给后台的数组
          patient_id: this.patient_id,
          patient_name: this.mes.name  // 客户名字
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.makeSheBaoList(res.data.data.items)
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            message: res.data.errmsg,
            type: 'error'
          })
        }
      }).catch()
    },
    // 调自己系统的发药接口2
    sendMedical2() {
      this.$http.post('/service/drugdeliver/deliver', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic, // 必填
          items: this.multipleSelection,  // 钩选的处方所需要传给后台的数组
          patient_id: this.patient_id,
          patient_name: this.mes.name  // 客户名字
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            showClose: true,
            duration: 1000,
            message: '发药成功！',
            type: 'success'
          })
          setTimeout(() => {
            this.$router.back()
          }, 1000)
        } else {
          this.$message({
            showClose: true,
            duration: 1000,
            message: res.data.errmsg,
            type: 'error'
          })
        }
      }).catch()
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
    // 发药信息列表
    deliverInfo() {
      this.$http.post('/service/drugdeliver/info', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic,  // 必填
          items: this.items
        }
      }).then(res => {
        this.tableData = res.data.data.items
        this.patient_id = res.data.data.patient_id
        this.mes.gender = res.data.data.patient_gender
        this.mes.birthdate = res.data.data.patient_birthday
      }).catch()
    }
  },
  created() {
    this.purchRecode.val.forEach(tt => {
      this.items.push({
        item_id: tt.item_id,
        item_type: tt.item_type,
        regist_id: tt.regist_id
      })
    })
    this.mes.name = this.purchRecode.val[0].patient_name
    this.mes.phone = this.purchRecode.val[0].patient_phone
    this.deliverInfo()
    this.judgeBindSheBao()
  },
  computed: {
    ...mapGetters(['token', 'clinic', 'shebao', 'purchRecode'])
  },
  beforeDestroy() {
    this.$store.commit('user/SET_PURCH_RECODE', '')
  },
  filters: {
    birthFilter(birth) {
      if (birth !== '') {
        return new Date().format('yyyy') - birth.split('-')[0]
      }
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
        return '未指定'
      } else {
        return dept
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pills {
  margin-top: 20px;
  margin-left: 30px;
  .el-table {
    width: 100%;
    margin-top: 20px;
    .el-form-item {
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #ccc;
      .el-form-item__content {
        height: 40px;
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

