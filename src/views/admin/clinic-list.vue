<template>
  <div class="admin-clinic">
    <div class="clinic-list">
      <div class="clinic" @click="createClinic">
        <img class="icon" src="@/assets/404_images/add.png">
        <p class="name">创建诊所</p>
      </div>
      <div class="clinic" v-for="clinic in clinicList" :key="clinic.id" @click="selectClinic(clinic)">
        <img class="icon" src="@/assets/404_images/clinic_avatar.jpg" :title="clinic.name">
        <p class="name">{{ clinic.name }}</p>
      </div>
    </div>
    <el-dialog title="创建诊所" :visible.sync="createClinicShow" :before-close="handleClose" align="center">
      <el-form :model="clinic" ref="clinicRef" :rules="clinicRule" label-width="90px" size="small">
        <el-form-item label="诊所名称:" prop="name">
          <el-input v-model="clinic.name"></el-input>
        </el-form-item>
        <el-form-item label="诊所地址:" prop="address">
          <el-input v-model="clinic.address"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createClinicConfirm('clinicRef')">确定</el-button>
          <el-button @click="createClinicCancel('clinicRef')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
import { isRegistNameOrId } from '@/utils/uniqueLimit'
import { clinicList, clinicAdd, getChargitemList, clinicInfo } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    const validateName = (rule, value, callback) => {
      if (isRegistNameOrId(this.clinicList, -1, 'name', value)) {
        callback(new Error('此名称已被注册，请更换'))
      } else {
        callback()
      }
    }
    return {
      createClinicShow: false,
      clinic: {
        name: '',
        address: ''
      },
      clinicList: [],
      clinicRule: {
        name: [
          { required: true, message: '请输入诊所名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ]
      },
      chargeItems: []
    }
  },
  methods: {
    // 获取诊所列表
    getClinicList() {
      service(clinicList).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.clinicList = res || []
        }
      })
    },
    // 选择诊所
    selectClinic(clinic) {
      this.getItemList(clinic.clinic_id)  // 获取挂号项列表。若为空，提示完善信息
      this.$store.commit('user/SET_CLINIC', clinic.clinic_id)  // 存储所选诊所的id
      this.getClinicInfo()  // 获取诊所信息
    },
    createClinic() {
      this.createClinicShow = true
    },
    createClinicCancel(formName) {
      this.createClinicShow = false
      // 重置表单
      this.$refs[formName].resetFields()
    },
    handleClose() {
      this.createClinicShow = false
      // 重置表单
      this.$refs.clinicRef.resetFields()
    },
    createClinicConfirm(formName) {
      this.createClinicShow = false
      // 重置表单
      this.$refs[formName].resetFields()
      // 验证诊所成功的处理
      this.$refs[formName].validate(valid => {
        if (valid) {
          service(clinicAdd, {
            name: this.clinic.name,
            address: this.clinic.address
          }).then(res => {
            if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
              // 创建成功的回调
              const newClinic = deepClone(res)
              this.clinicList.push(newClinic)
            }
          })
        } else {
          return false
        }
      })
    },
    // 获取挂号项列表。若为空，提示完善信息
    getItemList(clinicId) {
      service(getChargitemList, {
        clinic_id: clinicId
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const allItems = res || []
          this.chargeItems = allItems.filter(obj => obj.type === 7)
          this.promptPerfectInfo()
        }
      })
    },
    // 获取诊所信息
    getClinicInfo() {
      service(clinicInfo).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res.clinic.hospitalcode) {
            const obj = {
              cardArea: res.clinic.areacode,
              hospitalCode: res.clinic.hospitalcode,
              operatorCode: res.clinic.operatorcode,
              operatorName: res.clinic.operatorname,
              zhihuiybtoken: res.clinic.zhihuiybtoken
            }
            this.$store.commit('user/SET_SHE_BAO', obj)
          }
        }
      })
    },
    // 是否提示完善诊所信息
    promptPerfectInfo() {
      if (!this.chargeItems.length) {
        this.$confirm('为方便使用本系统，请先完善诊所信息', '提示', {
          confirmButtonText: '立即维护',
          cancelButtonText: '暂不维护',
          type: 'warning',
          closeOnClickModal: false,
          center: true
        }).then(() => {
          this.$router.push({ path: '/setting' })
        }).catch(() => {
          this.$router.push({ path: '/registration' })
        })
      } else {
        // 如已经维护，则跳转到挂号
        this.$router.push({ path: '/registration' })
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'user'])
  },
  created() {
    this.getClinicList()
  }
}
</script>

<style lang="scss" scoped>
.clinic-list {
  display: flex;
  flex-wrap: wrap;
  margin: 30px auto;
  padding-left: 50px;
  width: 70%;
  .clinic {
    margin: 20px;
    width: 160px;
    height: 200px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #fff;
    box-shadow: 2px 2px 4px rgba(0, 21, 41, 0.08);
    cursor: pointer;
    .icon {
      width: 90px;
      height: 90px;
      margin-left: 35px;
      margin-top: 20px;
    }
    .name {
      height: 40px;
      line-height: 40px;
      margin-top: 15px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #777;
    }
  }
}
</style>
