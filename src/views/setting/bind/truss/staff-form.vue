<template>
  <div class="staff-form">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="220px" size="small">
      <el-form-item label="姓名:" prop="aac003">
        <el-input v-model="ruleForm.aac003" placeholder="请输入医护人员姓名"></el-input> 
      </el-form-item>
      <el-form-item label="性别:" prop="aac004">
        <el-select v-model="ruleForm.aac004" placeholder="请选择性别" style="width: 100%;">
          <el-option label="男" value="1"></el-option>
          <el-option label="女" value="2"></el-option>
          <el-option label="未知" value="9"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话:" prop="aae005">
        <el-input v-model="ruleForm.aae005" placeholder="请输入联系电话"></el-input>
      </el-form-item>
      <el-form-item label="民族:" prop="aac005">
        <el-select v-model="ruleForm.aac005" placeholder="请选择民族" style="width: 100%;">
          <el-option :label="item.name" :value="item.id" v-for="(item, index) in nationList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期:" prop="aac006">
        <el-date-picker v-model="ruleForm.aac006" type="date" placeholder="请选择出生日期" value-format="yyyyMMdd" :picker-options="pickerOptions" style="width: 100%;"></el-date-picker>
      </el-form-item>
      <el-form-item label="证件类型:" prop="aac058">
        <el-select v-model="ruleForm.aac058" placeholder="请选择证件类型" style="width: 100%;">
          <el-option :label="item.value" :value="item.key" v-for="(item, index) in cardTypeList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="头像:">
        <el-upload style="margin-right: 420px;" action="https://jsonplaceholder.typicode.com/posts/"
          :show-file-list="false" :on-change="selectFile" list-type="picture-card" :auto-upload="false">
          <img v-if="upload.base64 && !upload.img" :src="upload.base64" width="100" height="130">
          <img v-if="upload.img && !upload.base64" :src="upload.img" width="100" height="130">
          <span v-if="!upload.base64 && !upload.img" class="avatar-uploader-icon">点击上传图片</span>
        </el-upload>
      </el-form-item>
      <el-form-item label="参加工作日期:" prop="aac007">
        <el-date-picker v-model="ruleForm.aac007" type="date" placeholder="请选择参加工作日期" value-format="yyyyMMdd" style="width: 100%;"></el-date-picker>
      </el-form-item>
      <el-form-item label="证件号码:" prop="aac147">
        <el-input v-model="ruleForm.aac147" placeholder="请输入证件号码"></el-input>
      </el-form-item>
      <el-form-item label="学历:" prop="aac011">
        <el-select v-model="ruleForm.aac011" placeholder="请选择学历" style="width: 100%;">
          <el-option :label="item.value" :value="item.key" v-for="(item, index) in educationDegree" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所学专业名称:" prop="aac183">
        <el-input v-model="ruleForm.aac183" placeholder="请输入所学专业名称"></el-input>
      </el-form-item>
      <el-form-item label="所属科室:" prop="akf001" :rules="[{ required: isDoctor, message: '请选择所属科室', trigger: 'change' }]">
        <el-select v-model="ruleForm.akf001" placeholder="请选择所属科室" style="width: 100%;">
          <el-option :label="item.value" :value="item.key" v-for="(item, index) in sectionList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="工号:" prop="acc501">
        <el-input v-model="ruleForm.acc501"  placeholder="请输入工号"></el-input>
      </el-form-item>
      <el-form-item label="医护人员类别:" prop="bka633">
        <el-select v-model="ruleForm.bka633" placeholder="请选择医护人员类别" style="width: 100%;">
          <el-option :label="item.value" :value="item.key" v-for="(item, index) in staffTypeList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="多点执业标志:" prop="bkc324">
        <el-select v-model="ruleForm.bkc324" placeholder="请选择多点执业标志" style="width: 100%;">
          <el-option label="是" value="1"></el-option>
          <el-option label="否" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="在职情况:" prop="bkc321">
        <el-select v-model="ruleForm.bkc321" placeholder="请选择在职情况" style="width: 100%;">
          <el-option :label="item.value" :value="item.key" v-for="(item, index) in jobStatusList" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="处方资格标识:" prop="ckc302">
        <el-select v-model="ruleForm.ckc302" placeholder="请选择处方资格标识" style="width: 100%;">
          <el-option label="是" value="1"></el-option>
          <el-option label="否" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="isDoctor ? '医师执业证书编码:' : '药师执业证书编码:'" prop="bkc323">
        <el-input v-model="ruleForm.bkc323" placeholder="请输入执业证书编码"></el-input>
      </el-form-item>
      <el-form-item :label="isDoctor ? '医师资格证编码:' : '药师资格证编码:'" prop="bke955">
        <el-input v-model="ruleForm.bke955"  placeholder="请输入资格证编码"></el-input>
      </el-form-item>
      <el-form-item label="开始日期:" prop="aae030">
        <el-date-picker v-model="ruleForm.aae030" type="date" placeholder="请选择本机构执业开始日期" value-format="yyyyMMdd" style="width: 100%;"></el-date-picker>
        <div style="text-align: left;color: #f00;">(本机构执业开始日期)</div>
      </el-form-item>
      <el-form-item label="现从事专业名称:" prop="bkc322">
        <el-input v-model="ruleForm.bkc322"  placeholder="请输入现从事专业名称"></el-input>
      </el-form-item>
      <!-- 医师必填项 -->
      <div class="illness" v-show="isDoctor">
        <el-form-item label="门诊大病医师标识:" prop="bkc325" :rules="[{ required: isDoctor, message: '请选择门诊大病类别', trigger: 'change' }]">
          <el-select v-model="ruleForm.bkc325" placeholder="请选择门诊大病医师标识" style="width: 100%;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门诊大病类别:" prop="ckc304" :rules="[{ required: isBig, message: '请选择门诊大病类别', trigger: 'change' }]">
          <el-select v-model="ruleForm.ckc304" placeholder="请选择门诊大病类别" clearable style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in seriousDiseaseList" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="practice" v-show="isDoctor">
        <el-form-item label="医师执业范围:" prop="akc055" :rules="[{ required: isDoctor, message: '请选择医师执业范围', trigger: 'change' }]">
          <el-select v-model="ruleForm.akc055" placeholder="请选择医师执业范围" style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in doctorRange" :key="index">
              <span style="display: flex;">{{ item.value }}</span>
              <span v-show="item.key.startsWith('1')" style="display: flex;color: #8492a6;font-size: 13px;">西医</span>
              <span v-show="item.key.startsWith('4')" style="display: flex;color: #8492a6;font-size: 13px;">中医</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="医保医师编号:" prop="bka503">
          <el-input v-model="ruleForm.bka503"  placeholder="请输入医保医师编号"></el-input>
        </el-form-item>
      </div>
      <div class="seniority" v-show="isDoctor">
        <el-form-item label="医师执业资格证中的医师级别:" prop="bcc950" :rules="[{ required: isDoctor, message: '请选择医师级别', trigger: 'change' }]">
          <el-select v-model="ruleForm.bcc950" placeholder="请选择医师级别" style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in doctorLevel" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="医师执业资格证中的执业类别:" prop="bcc955" :rules="[{ required: isDoctor, message: '请选择医师执业类别', trigger: 'change' }]">
          <el-select v-model="ruleForm.bcc955" placeholder="请选择医师执业类别" style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in doctorType" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <!-- 药师必填项 -->
      <div class="fill" v-show="!isDoctor">
        <el-form-item label="药师类别:" prop="bkc332" :rules="[{ required: !isDoctor, message: '请选择药师类别', trigger: 'change' }]">
          <el-select v-model="ruleForm.bkc332" placeholder="请选择药师类别" style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in pharmacistType" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="药师执业类别:" prop="bkc333" :rules="[{ required: !isDoctor, message: '请选择药师执业类别', trigger: 'change' }]">
          <el-select v-model="ruleForm.bkc333" placeholder="请选择药师执业类别" style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in pharmacistWorkType" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="range" v-show="!isDoctor">
        <el-form-item label="药师执业范围:" prop="bkc334" :rules="[{ required: !isDoctor, message: '请选择药师执业范围', trigger: 'change' }]">
          <el-select v-model="ruleForm.bkc334" placeholder="请选择药师执业范围" style="width: 100%;">
            <el-option :label="item.value" :value="item.key" v-for="(item, index) in pharmacistRange" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执业药师注册证编号:" prop="bkc335" :rules="[{ required: !isDoctor, message: '请选择执业药师注册证编号', trigger: 'change' }]">
          <el-input v-model="ruleForm.bkc335" placeholder="请输入执业药师注册证编号"></el-input>
        </el-form-item>
      </div>
      <div class="footer">
        <el-button type="primary" @click="submitForm('ruleForm')" size="small">确定</el-button>
        <el-button @click="closeWin" size="small">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import deepClone from '@/utils/deepClone'
import { AAC058, AAC011, BKA633, BKC321, CKA303, AKC055, BCC950, BCC955, BKC332, BKC333, BKC334 } from '@/common/dictionary'
import service from '@/utils/request'
import { doctorRegistSb, doctorRegistHis, szdoctorEditSb, szdoctorEditHis, uploadFile, fileInfo } from '@/serve/api'
import connectionTest from '@/common/connection'
export default {
  data() {
    const validateMobile = (rule, value, callback) => {
      const isValid = /^1[3|4|5|7|8|9][0-9]\d{8}$/
      if (value && !isValid.test(value)) {
        callback(new Error('请输入合法的手机号'))
      } else {
        callback()
      }
    }
    const validateIdCard = (rule, value, callback) => {
      const isValid = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/
      if (this.ruleForm.aac058 === '01' && value && !isValid.test(value)) {  // 只验证身份证
        callback(new Error('请输入合法的身份证号'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        aac003: [
          { required: true, message: '请输入姓名', trigger: 'change' }
        ],
        aac004: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        aac058: [
          { required: true, message: '请选择证件类型', trigger: 'change' }
        ],
        aac147: [
          { required: true, trigger: 'change', message: '请输入证件号' },
          { validator: validateIdCard, trigger: 'blur' }
        ],
        aae005: [
          { required: true, trigger: 'change', message: '请输入手机号' },
          { validator: validateMobile, trigger: 'blur' }
        ],
        aac005: [
          { required: true, message: '请选择民族', trigger: 'change' }
        ],
        aac006: [
          { required: true, message: '请选择出生日期', trigger: 'change' }
        ],
        aac007: [
          { required: true, message: '请选择参加工作日期', trigger: 'change' }
        ],
        aac011: [
          { required: true, message: '请选择学历', trigger: 'change' }
        ],
        aac183: [
          { required: true, message: '请选择所学的专业名称', trigger: 'change' }
        ],
        acc501: [
          { required: true, message: '请输入工号', trigger: 'change' }
        ],
        ahc451: [
          { required: true, message: '请输入职务名称', trigger: 'change' }
        ],
        aae030: [
          { required: true, message: '请选择机构执业开始日期', trigger: 'change' }
        ],
        bka633: [
          { required: true, message: '请选择医护人员类别', trigger: 'change' }
        ],
        bkc322: [
          { required: true, message: '请输入现从事专业名称', trigger: 'change' }
        ],
        bkc323: [
          { required: true, message: '请输入执业证书编码', trigger: 'change' }
        ],
        bke955: [
          { required: true, message: '请输入资格证编码', trigger: 'change' }
        ],
        bkc324: [
          { required: true, message: '请选择多点执业标志', trigger: 'change' }
        ],
        bkc321: [
          { required: true, message: '请选择在职情况', trigger: 'change' }
        ],
        ckc302: [
          { required: true, message: '请选择处方资格标识', trigger: 'change' }
        ]
      },
      imageUrl: '',
      upload: {
        base64: '',
        data: '',
        file: {},
        img: ''
      },
      cardTypeList: AAC058,    // 证件类型
      educationDegree: AAC011,  // 学历
      staffTypeList: BKA633,  // 医护人员类别
      jobStatusList: BKC321,  // 在职情况
      seriousDiseaseList: CKA303,   // 大病类别
      doctorRange: AKC055,  // 医师执业范围
      doctorLevel: BCC950,  // 医生执业资格证中的医师级别
      doctorType: BCC955,  // 医生执业资格证中的执业类别
      pharmacistType: BKC332,  // 药师类别
      pharmacistWorkType: BKC333,  // 药师执业类别
      pharmacistRange: BKC334,  // 药师执业范围
       // 现在日期
      pickerOptions: {
        disabledDate(date) {
          const today = new Date()
          return date.getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
        }
      }
    }
  },
  methods: {
    closeWin() {
      this.$emit('closeWin')
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // 检查是否开启客户端
          const connectionStatus = await connectionTest()
          if (connectionStatus !== '1') {
            return
          }
          if (this.isDoctor) {  // 选择医师，则删除药师信息
            delete this.ruleForm.bkc332
            delete this.ruleForm.bkc333
            delete this.ruleForm.bkc334
            delete this.ruleForm.bkc335
          } else {
            delete this.ruleForm.bkc325
            delete this.ruleForm.ckc304
            delete this.ruleForm.akc055
            delete this.ruleForm.bcc950
            delete this.ruleForm.bcc955
            delete this.ruleForm.bka503
          }
          const obj = deepClone(this.ruleForm)
          obj.aac006 = Number(obj.aac006)
          obj.aac007 = Number(obj.aac007)
          obj.aae030 = Number(obj.aae030)
          if (this.staffStatus) {
            this.addStaffSheBao(obj)  // 新增
          } else {
            this.editStaffSheBao(obj)   // 编辑
            if (this.upload.base64) {
              this.updateDoctorPhoto(obj.doctorkey)  // 保存图片
            }
          }
        } else {
          this.$message({ message: '请填写相关信息', type: 'warning', showClose: true, duration: 1000 })
          return false
        }
      })
    },
    resetForm(formName = 'ruleForm') {
      this.$refs[formName].resetFields()
      this.upload = {
        base64: '',
        data: '',
        file: {},
        img: ''
      }
    },
    addStaffSheBao(obj) {  // 添加人员(社保)
      service(doctorRegistSb, {
        transBody: {
          listsize: 1,
          inputlist: [
            { ...obj }
          ]
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const bkc320 = res.transBody.outputlist[0].bkc320
          this.addStaffHis(obj, bkc320)
        }
      })
    },
    addStaffHis(obj, bkc320) {  // 添加人员(his)
      service(doctorRegistHis, {
        bkc320: bkc320,   // 客户端返回
        ...obj
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '新建医务人员成功！', type: 'success', showClose: true, duration: 1500 })
          if (this.upload.base64) {
            this.updateDoctorPhoto(res.doctorkey)  // 保存图片
          }
          this.$emit('changeDoctor', 1)
        }
      })
    },
    editStaffSheBao(obj) {  // 编辑人员(社保)
      service(szdoctorEditSb, {
        transBody: {
          listsize: 1,
          inputlist: [
            { ...obj }
          ]
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.editStaffHis(obj)
        }
      })
    },
    editStaffHis(obj) {  // 编辑人员(his)
      service(szdoctorEditHis, {
        ...obj
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '编辑医务人员成功！', type: 'success', showClose: true, duration: 1500 })
          this.$emit('changeDoctor', 2)
        }
      })
    },
    updateDoctorPhoto(doctorkey) {  // 更新医生头像
      service(uploadFile, {
        source_name: this.upload.file.name,
        use_type: 1,
        data: this.upload.data,
        fileidentify: doctorkey   // 医生ID
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          console.log(res)
        }
      })
    },
    getDoctorPhoto(doctorkey) {  // 获取医生头像
      service(fileInfo, {
        use_type: 1,
        fileidentify: doctorkey   // doctorid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res) {
            this.$set(this.upload, 'img', res.file_url)
          }
        }
      })
    },
    // 图片上传
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    selectFile(file) {
      const pictureType = /\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG|BMP)$/.test(file.name)
      const pictureSize = file.size / 1024 / 1024 < 4
      if (!pictureType) {
        this.$message.error({
          message: '仅支持gif, jpg, jpeg, png, bmp 图片上传',
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
      this.upload.img = ''
      this.upload.file = deepClone(file)
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onloadend = () => {
        this.upload.base64 = reader.result
        this.upload.data = reader.result.split(',')[1]
      }
    }
  },
  computed: {
    ...mapGetters(['nationList']),
    isDoctor() {
      return this.ruleForm.bka633 === '1' ? true : false
    },
    isBig() {
      return this.ruleForm.bkc325 === '1' ? true : false
    }
  },
  props: {
    ruleForm: {
      type: Object,
      default() {
        return {
          bka633: '1'
        }
      }
    },
    sectionList: {
      type: Array,
      default() {
        return []
      }
    },
    staffStatus: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped></style>
