<template>
  <div class="medicine-suppliers">
    <div class="add-suppliers">
      <el-button type="primary" size="small" @click="modifyAddMedicine">新增供应商</el-button>
    </div>
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
      <el-table-column prop="name" label="供应商名称" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="contact" label="联系人" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="tel" label="联系人电话" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="phone" label="联系人手机" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="bank" label="银行账号" width="180" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="addr" label="地址" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column label="创建日期" show-overflow-tooltip align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createtime | createTimeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="modifyEditMedicine(scope.$index)">编辑</el-button>
          <el-button type="text" @click="del(scope.row.supplierkey)" style="color: #f00;">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="15"
      @current-change="handleCurrentChange" layout="total, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <!-- 模态框 -->
    <el-dialog title="供应商维护" :visible.sync="modifyAddMedicineShow" :before-close="handleClose" align="center">
      <el-form :model="form" :rules="rules" ref="formRef" size="small" label-width="100px">
        <el-form-item label="供应商名称:" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="联系人手机:" prop="mobphone">
          <el-input v-model="form.mobphone" @keyup.native="limitMobile" :maxlength="11">
          </el-input>
        </el-form-item>
        <el-form-item label="联系人:">
          <el-input v-model="form.man"></el-input>
        </el-form-item>
        <el-form-item label="联系电话:">
          <el-input v-model="form.tel" :maxlength="13"></el-input>
        </el-form-item>
        <el-form-item label="创建日期:">
          <el-date-picker type="date" style="width: 100%;" v-model="form.makingtime" readonly></el-date-picker>
        </el-form-item>
        <el-form-item label="银行账号:">
          <el-input v-model="form.bank_account" @keyup.native="limitChinese" :maxlength="19">
          </el-input>
        </el-form-item>
        <el-form-item label="供应商地址:">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="备注:">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="confirmAdd('formRef')">确定</el-button>
          <el-button @click="closeModify('formRef')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intLimit } from '@/utils/inputLimit'
export default {
  data() {
    const mobileValidate = (rule, value, callback) => {
      const valid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (this.form.mobphone && !valid.test(this.form.mobphone)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    const telValidate = (rule, value, callback) => {
      const valid = /^1[3|4|5|8][0-9]\d{4,8}$/
      if (this.form.tel && !valid.test(this.form.tel)) {
        callback(new Error('请输入合法的电话号'))
      } else {
        callback()
      }
    }
    return {
      tableData: [],
      currentPage: 1,  // 分页
      total: 0,
      pageindex: 0,
      modifyAddMedicineShow: false,  // 是否显示模态框
      form: {
        name: '',  // 供应商名字
        mobphone: '',  // 联系人手机
        man: '',  // 联系人
        tel: '',  // 联系电话
        bank_account: '',  // 银行账号
        address: '',  // 供应商地址
        remark: '',  // 备注
        makingtime: '',  // 创建日期
        addedit: '',  // 新增与编辑的标识
        doNot: false
      },
      // 供应商key标识
      supplierkey: '',
      userData: {
        suppliers: '',
        contactPerson: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' }
        ],
        mobphone: [
          { validator: mobileValidate, trigger: 'blur' }
        ],
        tel: [
          { validator: telValidate, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 请求供应商列表
    supplierQueryList() {
      this.$http.post('/service/drug/supplierquerylist', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          pageid: this.pageindex,
          pagesize: 15,
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
    // 分页
    handleCurrentChange(index) {
      this.pageindex = index - 1
      this.supplierQueryList()
    },
    // 删除供应商
    del(supplierkey) {
      this.$confirm('是否确认删除该供应商信息', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.$http.post('/service/drug/supplierdel', {
          head: {
            accessToken: this.token,
            lastnotice: 0
          },
          body: {
            supplierkey: supplierkey,
            clinic_id: this.clinic
          }
        }).then(res => {
          if (res.data.errcode === 0) {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'success',
              message: '删除成功!'
            })
            this.supplierQueryList()
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              type: 'error',
              message: res.data.errmsg
            })
          }
        }).catch()
      }).catch()
    },
    // 新增供应商
    modifyAddMedicine() {
      this.modifyAddMedicineShow = true
      this.form.makingtime = new Date()
      this.form.name = ''
      this.form.mobphone = ''
      this.form.man = ''
      this.form.tel = ''
      this.form.bank_account = ''
      this.form.remark = ''
      this.form.address = ''
      this.form.addedit = 0
    },
    // 编辑供应商
    modifyEditMedicine(index) {
      this.modifyAddMedicineShow = true
      this.form.name = this.tableData[index].name
      this.form.mobphone = this.tableData[index].phone
      this.form.man = this.tableData[index].contact
      this.form.tel = this.tableData[index].tel
      this.form.bank_account = this.tableData[index].bank
      this.form.remark = this.tableData[index].note
      this.form.address = this.tableData[index].addr
      this.supplierkey = this.tableData[index].supplierkey
      this.form.addedit = 1
      const time1 = '20' + this.tableData[index].createtime.toString() + ''
      const year = time1.substring(0, 4)
      const mouth = (Number(time1.substr(4, 2)) - 1).toString()
      const day = time1.substr(6, 2)
      const time2 = new Date(year, mouth, day)
      this.form.makingtime = time2
    },
    closeModify(ruleForm) {
      this.modifyAddMedicineShow = false
      this.$refs[ruleForm].resetFields()
    },
    handleClose() {
      this.modifyAddMedicineShow = false
      this.$refs.formRef.resetFields()
    },
    // 确认添加供应商
    confirmAdd(formName) {
      if (this.form.addedit === 0) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$http.post('/service/drug/supplieradd', {
              head: {
                accessToken: this.token,
                lastnotice: 0
              },
              body: {
                name: this.form.name,
                contact: this.form.man,
                tel: this.form.tel,
                phone: this.form.mobphone,
                bank: this.form.bank_account,
                addr: this.form.address,
                note: this.form.remark,
                status: 1,
                clinic_id: this.clinic
              }
            }).then(res => {
              if (res.data.errcode === 0) {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  message: '添加成功！',
                  type: 'success'
                })
                this.supplierQueryList()  // 新增成功重新请求列表
                this.closeModify()
              } else if (res.data.errmsg === '已存在') {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  message: '该供应商已存在',
                  type: 'warning'
                })
              } else {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  type: 'error',
                  message: res.data.errmsg
                })
              }
            }).catch()
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              message: '请填写未填写的信息',
              type: 'error'
            })
            return false
          }
        })
      } else {
        // 编辑
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$http.post('/service/drug/supplierupdate', {
              head: {
                accessToken: this.token,
                lastnotice: 0
              },
              body: {
                supplierkey: this.supplierkey,
                name: this.form.name,
                contact: this.form.man,
                tel: this.form.tel,
                phone: this.form.mobphone,
                bank: this.form.bank_account,
                addr: this.form.address,
                note: this.form.remark,
                status: 1,
                clinic_id: this.clinic
              }
            }).then(() => {
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存成功！',
                type: 'success'
              })
              this.supplierQueryList()  // 编辑成功重新请求列表
              this.closeModify()
            }).catch()
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              message: '请填写未填写的信息',
              type: 'error'
            })
            return false
          }
        })
      }
    },
    // 只能输入数字
    limitMobile() {
      this.form.mobphone = intLimit(this.form.mobphone)
    },
    // 限制输入中文
    limitChinese() {
      this.form.bank_account = intLimit(this.form.bank_account)
    }
  },
  filters: {
    createTimeFilter(time) {
      const str = time + ''
      return '20' + str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2)
    }
  },
  created() {
    this.supplierQueryList()
  },
  computed: {
    ...mapGetters(['token', 'clinic'])
  }
}
</script>

<style lang="scss" scoped>
.add-suppliers {
  margin-top: 20px;
  margin-left: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
  width: 90%;
}
.el-table {
  margin-top: 20px;
  margin-left: 30px;
  width: 90%;
}
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>

