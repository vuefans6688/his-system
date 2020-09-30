<template>
  <div class="print-setting">
    <div class="prescription">
      <h3 class="title">处方设置</h3>
      <p class="detail">
        <span class="label">抬头: </span>
        <span>{{ printSetting.header_prescription | isSetHeader(clinic.name) }}</span>
      </p>
      <p class="detail">
        <span class="label">是否打印医生姓名: </span>
        <span>{{ printSetting.isPrintDocotr | yesOrNoFilter }}</span>
      </p>
      <div class="footer">
        <el-button type="text" @click="modifyPrescription">修改</el-button>
      </div>
    </div>
    <div class="receipt">
      <h3 class="title">小票设置</h3>
      <p class="detail">
        <span class="label">抬头: </span>
        <span>{{ printSetting.header_receipt | isSetHeader(clinic.name) }}</span>
      </p>
      <p class="detail">
        <span class="label">落款: </span>
        <span>{{ printSetting.footer }}</span>
      </p>
      <p class="detail">
        <span class="label">是否打印明细: </span>
        <span>{{ printSetting.isPrintDetail | yesOrNoFilter }}</span>
      </p>
      <div class="footer">
        <el-button type="text" @click="modifyReceipt">修改</el-button>
      </div>
    </div>
    <el-dialog title="处方设置" :visible.sync="modifyPrescriptionShow" :before-close="handleClosePrescript" align="center">
      <el-form :model="modifyPrint" ref="printPrescription" label-width="140px" size="small">
        <el-form-item label="抬头:" prop="header_prescription" :rules="{ required: true, message: '请输入处方抬头', trigger: 'blur' }">
          <el-input v-model="modifyPrint.header_prescription"></el-input>
        </el-form-item>
        <el-form-item label="是否打印医生姓名:" prop="isPrintDocotr">
          <el-radio-group v-model="modifyPrint.isPrintDocotr">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item align="right">
          <el-button type="primary" @click="modifyPrescriptionConfirm('printPrescription')">确定</el-button>
          <el-button @click="modifyPrescriptionCancel('printPrescription')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="小票设置" :visible.sync="modifyReceiptShow" :before-close="handleCloseReceipt" align="center">
      <el-form :model="modifyPrint" ref="printReceipt" label-width="140px" size="small">
        <el-form-item label="抬头:" prop="header_receipt" :rules="{ required: true, message: '请输入小票抬头', trigger: 'blur' }">
          <el-input v-model="modifyPrint.header_receipt"></el-input>
        </el-form-item>
        <el-form-item label="落款:" prop="footer" :rules="{ required: true, message: '请输入小票落款', trigger: 'blur' }">
          <el-input v-model="modifyPrint.footer"></el-input>
        </el-form-item>
        <el-form-item label="是否打印明细:" prop="isPrintDetail">
          <el-radio-group v-model="modifyPrint.isPrintDetail">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item align="right">
          <el-button type="primary" @click="modifyReceiptConfirm('printReceipt')">确定</el-button>
          <el-button @click="modifyReceiptCancel('printReceipt')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      modifyPrint: {
        header_receipt: '',   // 小票抬头
        header_prescription: '',      // 处方抬头
        footer: '谢谢惠顾！祝您健康！',     // 落款
        isPrintDocotr: false,         // 是否打印医生
        isPrintDetail: false,        // 是否打印明细
      },
      modifyPrescriptionShow: false,
      modifyReceiptShow: false
    }
  },
  methods: {
    // 处方设置
    modifyPrescription() {
      this.modifyPrint.header_prescription = this.printSetting.header_prescription || this.clinic.name   // 若没有设置抬头，默认显示诊所名
      this.modifyPrint.isPrintDocotr = this.printSetting.isPrintDocotr || false
      this.modifyPrescriptionShow = true
    },
    modifyPrescriptionCancel(ruleForm) {
      this.modifyPrescriptionShow = false
      this.$refs[ruleForm].resetFields()
    },
    handleClosePrescript() {
      this.modifyPrescriptionShow = false
      this.$refs.printPrescription.resetFields()
    },
    modifyPrescriptionConfirm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          this.modifyPrescriptionShow = false
          // 修改成功的处理
          this.printSetting.header_prescription = this.modifyPrint.header_prescription
          this.printSetting.isPrintDocotr = this.modifyPrint.isPrintDocotr
          // 重置表单
          this.$refs[ruleForm].resetFields()
          // 更新缓存的消息
          this.$store.commit('user/SET_PRINT_SETTING', this.printSetting)
          // 加载
          const loading = this.$loading({
            lock: true,
            text: '修改处方打印设置成功',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          setTimeout(() => {
            loading.close()
          }, 500)
        } else {
          return false
        }
      })
    },
    // 小票设置
    modifyReceipt() {
      this.modifyPrint.header_receipt = this.printSetting.header_receipt || this.clinic.name   // 若没有设置抬头，默认显示诊所名
      this.modifyPrint.footer = this.printSetting.footer
      this.modifyPrint.isPrintDetail = this.printSetting.isPrintDetail || false
      this.modifyReceiptShow = true
    },
    modifyReceiptCancel(ruleForm) {
      this.modifyReceiptShow = false
      // 重置表单
      this.$refs[ruleForm].resetFields()
    },
    handleCloseReceipt() {
      this.modifyReceiptShow = false
      // 重置表单
      this.$refs.printReceipt.resetFields()
    },
    modifyReceiptConfirm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          this.modifyReceiptShow = false
          // 修改成功的处理
          this.printSetting.header_receipt = this.modifyPrint.header_receipt
          this.printSetting.footer = this.modifyPrint.footer
          this.printSetting.isPrintDetail = this.modifyPrint.isPrintDetail
          // 重置表单
          this.$refs[ruleForm].resetFields()
          this.$store.commit('user/SET_PRINT_SETTING', this.printSetting)
          const loading = this.$loading({
            lock: true,
            text: '修改小票打印设置成功',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          setTimeout(() => {
            loading.close()
          }, 500)
        } else {
          return false
        }
      })
    }
  },
  computed: {
    ...mapGetters(['clinic', 'printSetting'])
  },
  filters: {
    yesOrNoFilter(flag) {
      return flag ? '是' : '否'
    },
    isSetHeader(header, name) {  // 若没有设置抬头，则默认显示诊所名
      return header || name
    }
  }
}
</script>

<style lang="scss" scoped>
.print-setting {
  margin-top: 20px;
  margin-left: 30px;
  .prescription, .receipt {
    .title, .detail {
      color: #666;
    }
    .detail, .footer {
      margin-left: 40px;
    }
  }
}
</style>
