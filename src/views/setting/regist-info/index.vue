<template>
  <div class="regist-info">
    <!-- 诊所基本信息 -->
    <div class="header">
      <h4 class="title">诊所所属人信息</h4>
      <p class="name">所属人姓名: {{ owner_name }}</p>
      <p class="phone">所属人手机: {{ owner_phone }}</p>
    </div>
    <div class="clinic-info">
      <h4 class="title">诊所信息</h4>
      <p class="name">诊所名称: {{ clinicInfo.name }}</p>
      <p class="address">诊所地址: {{ clinicInfo.address }}</p>
      <p class="time">注册时间: {{ clinicInfo.create_time | clinicDateFilter }}</p>
      <p class="modify">
        <el-button size="small" type="primary" @click="modifyClinic">修改诊所信息</el-button>
      </p>
    </div>
    <!-- 修改诊所信息弹窗 -->
    <el-dialog :visible.sync="modifyClinicShow" :before-close="handleClose" title="修改诊所信息" align="center">
      <el-form :model="clinicModify" :rules="clinicRules" ref="clinic" label-width="90px" size="small">
        <el-form-item label="诊所名称:" prop="name">
          <el-input v-model="clinicModify.name"></el-input>
        </el-form-item>
        <el-form-item label="诊所地址:" prop="address">
          <el-input v-model="clinicModify.address"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="modifyClinicConfirm('clinic')">确定</el-button>
          <el-button @click="modifyClinicCancel('clinic')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 执照 -->
    <div class="identify-info">
      <h4 class="title">营业执照</h4> 
      <div class="content" v-if="avatar">
        <el-tooltip placement="top" :open-delay="200" effect="light" :offset="-100">
          <div slot="content" class="avatar-detail">
            <img :src="avatar" class="picture">
          </div>
          <img :src="avatar" width="120" height="120">
        </el-tooltip>
      </div>
      <div class="upload-license">
        <el-button @click="uploadIdentify" size="small" type="primary">上传执照</el-button>
      </div>
    </div>
    <!-- 上传执照弹窗 -->
    <el-dialog :visible.sync="uploadShow" title="上传诊所执照" align="center">
      <el-form :model="upload" label-width="60px" size="small">
        <el-form-item label="文件:" align="left">
          <el-upload action="https://jsonplaceholder.typicode.com/posts/" :show-file-list="false"
            :auto-upload="false" list-type="picture-card" :on-change="selectFile">
            <img v-if="upload.base64" :src="upload.base64" width="100" height="100">
            <i v-else class="el-icon-plus"></i>
          </el-upload>
        </el-form-item> 
        <el-form-item align="right">
          <el-button type="primary" @click="uploadConfirm" :disabled="uploadDisabled">确定</el-button>
          <el-button @click="uploadCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
export default {
  data() {
    return {
      modifyClinicShow: false,
      uploadShow: false,
      clinicModify: {
        name: '',
        address: ''
      },
      clinicRules: {
        name: [
          { required: true, message: '请输入诊所名称', trigger: 'blur' },
          { max: 64, message: '诊所名称长度不超过64位', trigger: 'blur' }
        ]
      },
      clinicInfo: {},
      owner_name: '',
      owner_phone: '',
      base64: '',
      upload: {
        base64: '',
        data: '',
        file: {}
      },
      avatar: '',
      uploadDisabled: false
    }
  },
  methods: {
    modifyClinic() {
      this.modifyClinicShow = true
      this.clinicModify.name = this.clinicInfo.name
      this.clinicModify.address = this.clinicInfo.address
    },
    modifyClinicCancel(formName) {
      this.modifyClinicShow = false
      // 重置表单
      this.$refs[formName].resetFields()
    },
    handleClose() {
      this.modifyClinicShow = false
      // 重置表单
      this.$refs.clinic.resetFields()
    },
    modifyClinicConfirm(formName) {
      this.modifyClinicShow = false
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post('/service/clinic/modify', {
            head: {
              msgid: '',
              lastnotice: 0,
              accessToken: this.token
            },
            body: {
              clinic_id: this.clinicInfo.clinic_id,
              items: [
                {
                  name: 'name',
                  newVal: this.clinicModify.name
                },
                {
                  name: 'address',
                  newVal: this.clinicModify.address
                }
              ]
            }
          }).then(response => {
            const res = response.data
            if (res.errcode === 0) {
              // 修改成功的处理
              this.clinicInfo.name = this.clinicModify.name
              this.clinicInfo.address = this.clinicModify.address
              this.$message.success('诊所信息修改成功!')
              // 重置表单
              this.$refs[formName].resetFields()
            } else {
              this.$message({
                type: 'error',
                message: res.errmsg,
                duration: 1000,
                showClose: true
              })
            }
          }).catch()
        } else {
          return false
        }
      })
    },
    // 重置文件
    fileReset() {
      this.upload.base64 = ''
      this.upload.data = ''
      this.upload.file = {}
      this.uploadDisabled = false
    },
    // 弹出文件上传框
    uploadIdentify() {
      this.uploadShow = true
    },
    // 取消上传
    uploadCancel() {
      this.uploadShow = false
      this.fileReset()
    },
    // 获取文件
    selectFile(file) {
      // 限制类型和大小
      const pictureType = /\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG|BMP)$/.test(file.name)
      const pictureSize = file.size / 1024 / 1024 < 4
      if (!pictureType) {
        this.$message.error({
          message: '仅支持gif, jpg, jpeg, png, bmp图片上传',
          duration: 1000,
          showClose: true
        })
        return
      }
      if (!pictureSize) {
        this.$message.error({
          message: '图片大小不超过4M',
          duration: 1000,
          showClose: true
        })
        return
      }
      this.upload.file = deepClone(file)
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onloadend = () => {
        this.upload.base64 = reader.result
        this.upload.data = reader.result.split(',')[1]
      }
    },
    uploadConfirm() {
      if (!this.upload.base64) {
        this.$message.error({
          message: '请选择文件',
          duration: 1000,
          showClose: true
        })
        return
      }
      // 点击后禁用 防止再次上传
      this.uploadDisabled = true
      this.$http.post('/service/clinic/upload_file', {
        body: {
          clinic_id: this.clinic,
          source_name: this.upload.file.name,
          use_type: 0,
          data: this.upload.data
        },
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0) {
          this.$message.success({
            message: '执照上传成功',
            duration: 1000,
            showClose: true
          })
          this.avatar = res.data.file_url
        } else {
          this.$message.error({
            message: res.errmsg,
            duration: 1000,
            showClose: true
          })
        }
        this.uploadCancel()
      }).catch(() => {
        this.$message.error({
          message: '执照上传失败',
          duration: 1000,
          showClose: true
        })
        this.uploadCancel()
      })
    },
    // 获取执照
    getIdentity() {
      this.$http.post('/service/clinic/file_info', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          use_type: 0
        }
      }).then(res => {
        if (res.data.errcode === 0 && res.data.data) {
          this.avatar = res.data.data.file_url
        }
      })
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  filters: {
    clinicDateFilter(date) {
      const str = date + ''
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    }
  },
  created() {
    this.$http.post('/service/clinic/info', {
      head: {
        msgid: '',
        lastnotice: 0,
        accessToken: this.token
      },
      body: {
        clinic_id: this.clinic
      }
    }).then(response => {
      const res = response.data
      if (res.errcode === 0) {
        this.clinicInfo = res.data.clinic
        this.owner_name = res.data.owner_name
        this.owner_phone = res.data.owner_phone
      } else {
        this.$message({
          type: 'error',
          message: res.errmsg,
          duration: 1000,
          showClose: true
        })
      }
    }).catch(() => {
      this.$message.error({
        message: '获取诊所信息失败',
        duration: 1000,
        showClose: true
      })
    })
    this.getIdentity()
  }
}
</script>

<style lang="scss" scoped>
.regist-info {
  margin-top: 20px;
  margin-left: 30px;
  .header, .clinic-info {
    color: #666;
    .title {
      width: 1000px;
      height: 40px;
      line-height: 40px;
      padding-left: 6px;
      background: #eee;
    }
    p {
      margin-left: 20px;
    }
  }
  .identify-info {
    color: #666;
    .title {
      width: 1000px;
      height: 40px;
      line-height: 40px;
      padding-left: 6px;
      background: #eee;
    }
    .avatar-detail {
      max-width: 640px;
      max-height: 480px;
      .picture {
        width: 100%;
        height: 100%;
        display: inline-block;
        vertical-align: top;
      }
    }
    .upload-license {
      margin-left: 20px;
    }
  }
}
</style>
