<template>
  <div class="doctor-station">
    <div class="patient" v-if="$route.path !== '/doctor-station/patient-message'">
      <div class="quick">
        <el-button @click="openQuickRegistWin" type="primary" size="mini">快速接诊</el-button>
        <el-button @click="getPrescriptMessage" type="success" size="mini">刷新</el-button>
        <strong class="person">就诊列表{{ todaySeeDoctor.length }}人</strong>
      </div>
      <p class="base-info" v-for="(item, index) in todaySeeDoctor" 
        :key="index" :class="{ active: isActive === item.registid }">
        <span>{{ item.name }}-</span>
        <span>{{ item.gender | sexFilter }}-</span>
        <span>{{ item.age }}-</span>
        <span>{{ item.registstatus | statusFilter }}</span>
        <el-button v-if="item.registstatus === 1" @click="receivePatient(item, 1)" type="primary" size="mini">接诊</el-button> 
        <el-button v-if="item.registstatus === 2" @click="receivePatient(item, 2)" type="primary" size="mini">继续诊断</el-button> 
        <el-button v-if="item.registstatus === 3" @click="receivePatient(item, 3, index)" type="primary" size="mini">查看</el-button>
      </p>
    </div>
    <patient-message :patient-msg="msg" ref="initType"></patient-message>
    <!-- 快速接诊 -->
    <el-dialog title="快速接诊" align="center" :visible.sync="quickRegistWinStatus">
      <quick-regist @closeRegistWin="closeRegistWin"></quick-regist>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { prescriptionList, getUserChargitemList, getUserMedicalInfo, acceptPatients, getClinicName, registdoctor, registsingle, sbRemindApi } from '@/serve/api'
import service from '@/utils/request'
import deepClone from '@/utils/deepClone'
import { dateFilter } from '@/utils/filters'
import { calculateFromBirth } from '@/utils/ageTransfer'
import connectionTest from '@/common/connection'
import QuickRegist from './quick-regist'
import PatientMessage from './patient-message'
export default {
  components: { QuickRegist, PatientMessage },
  data() {
    return {
      opener: null,  // 智慧医保窗口
      clinicName: '',
      num: '',
      todaySeeDoctor: [],
      regType: [  // 挂号类别
        {
          name: '普通',
          value: '1'
        },
        {
          name: '主治',
          value: '2'
        },
        {
          name: '主任',
          value: '3'
        },
        {
          name: '免收诊金',
          value: '4'
        },
        {
          name: '专家号',
          value: '5'
        }
      ],
      msg: {    // 子组件传值保存用户信息
        details: {},   // 详细信息
        medicalRecordsForm: {
          complaint: '',      // 主述
          cur_history: '',   // 现病史
          past_history: '',        // 既往史
          person_history: '',  // 个人史
          allergy_history: '',   // 过敏史
          family_history: '',    // 家族史
          other_history: '',  // 其他
          temperature: '',    // 体温
          systolic_pressure: '',    // 收缩压
          diastolic_pressure: '',   // 舒张压
          pulse: '',      // 脉搏
          breathing: '',          // 呼吸
          mainphyexam: '',    // 体格检查
          other_phy_exam: '',    // 辅助检查
          jibingjson: [],      // 病症tags
          advice: '',
          diagn_result: ''   // 本次诊断结果
        },   
        // 病历
        westMedPre: [   // 西药处方
          {
            westMedForm: {},
            westPreStatus: {
              isDisabled: false,   // 禁用表单
              isIconShow: false,   // 收费图标
              validation: false    // 验证
            }
          }
        ],
        chinaMedPre: [   // 中药处方
          {
            chinaMedForm: {},
            chinaPreStatus: {
              isDisabled: false,   // 禁用表单
              isIconShow: false,   // 收费图标
              validation: false    // 验证
            }
          }
        ],
        infusionMedPre: [{  // 输液处方
          InfusionArr: [],
          infusionPreStatus: {
            isDisabled: false,   // 禁用表单
            isIconShow: false,   // 收费图标
            validation: false    // 验证
          }
        }],
        westPreShow: 0,
        chinaPreShow: 0,
        infusionPreShow: 0,
        presForm: [],  // 处方列表
        checkItem: {
          items: [],
          checkPayList: [],
          otherMsg: {},
          totalMoney: 0
        },
        comsumables: {
          items: [],
          comsumablesPayList: [],
          otherMsg: {},
          totalMoney: 0
        },
        other: {
          items: [],
          otherPayList: [],
          otherMsg: {},
          totalMoney: 0
        },
        doctorTip: {   // 医生信息
          name: '',
          tipMsg: true,
          content: '请完善用户信息'
        },
        medicalAdvice: ''    // 医嘱
      },
      isActive: '',
      quickRegistWinStatus: false  // 快速接诊窗口
    }
  },
  methods: {
    openQuickRegistWin() {
      this.quickRegistWinStatus = true
    },
    closeRegistWin(flag) {
      this.quickRegistWinStatus = false
      if (flag === 1) {  // 代表快速挂号成功
        this.getPrescriptMessage()   // 刷新患者列表
      }
    },
    getRecord(val) {  // 获取病历及医嘱
      service(getUserMedicalInfo, {
        regist_id: val.registid,
        medical_id: ''
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          val.medicalRecordsForm = res
          // 0则删除
          val.medicalRecordsForm.temperature = val.medicalRecordsForm.temperature === 0 ? '' : val.medicalRecordsForm.temperature
          val.medicalRecordsForm.systolic_pressure = val.medicalRecordsForm.systolic_pressure === 0 ? '' : val.medicalRecordsForm.systolic_pressure
          val.medicalRecordsForm.diastolic_pressure = val.medicalRecordsForm.diastolic_pressure === 0 ? '' : val.medicalRecordsForm.diastolic_pressure
          val.medicalRecordsForm.pulse = val.medicalRecordsForm.pulse === 0 ? '' : val.medicalRecordsForm.pulse
          val.medicalRecordsForm.breathing = val.medicalRecordsForm.breathing === 0 ? '' : val.medicalRecordsForm.breathing
          if (val.medicalRecordsForm.jibingjson && val.medicalRecordsForm.jibingjson.length) {
            val.medicalRecordsForm.jibingjson = val.medicalRecordsForm.jibingjson.map(v => v.maincode + '-' + v.jbname)
          }
        }
      })
    },
    getPresList(val) {  // 获取处方列表
      service(prescriptionList, {
        regist_id: val.registid,
        status: -1
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const arr1 = []
          const arr2 = []
          const arr3 = []
          if (res && res.length) {
            res.forEach(item => {
              switch (item.prescript_type) {
                case 1:
                  arr1.push(item)
                  break
                case 2:
                  arr2.push(item)
                  break
                case 3:
                  arr3.push(item)
                  break
                default:
                  break
              }
            })
          }
          val.westPreList = arr1
          val.chinaPreList = arr2
          val.infusionPreList = arr3
        }
      })
    },
    getCheckPayList(val) {  // 获取客户收费项目列表
      service(getUserChargitemList, {
        status: -1,
        regist_id: val.registid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const arr1 = []
          const arr2 = []
          const arr3 = []
          if (res && res.length) {
            res.forEach(item => {
              switch (item.item_type) {
                case 3:
                  arr1.push(item)
                  break
                case 4:
                  arr2.push(item)
                  break
                case 6:
                  arr3.push(item)
                  break
                default:
                  break
              }
            })
          }
          // 检验检查
          if (arr1.length) {
            val.checkItem.items = arr1
            val.checkItem.otherMsg.isDisabled = true
          } else {
            val.checkItem.otherMsg.isDisabled = false
          }
          // 耗材
          if (arr2.length) {
            val.comsumables.items = arr2
            val.comsumables.otherMsg.isDisabled = true
          } else {
            val.comsumables.otherMsg.isDisabled = false
          }
          // 其他
          if (arr3.length) {
            val.other.items = arr3
            val.other.otherMsg.isDisabled = true
          } else {
            val.other.otherMsg.isDisabled = false
          }
        }
      })
    },
    getPrescriptMessage() {  // 获取患者列表
      service(registdoctor, {
        deptid: this.user.dept_id,  // 科室id
        doctorid: this.user.userid,   // 医生id
        fromdate: dateFilter(new Date()),
        todate: dateFilter(new Date())
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const arr = []
          if (!res.entity || !res.entity.length) {
            return
          }
          res.entity.forEach(val => {
            val.age = calculateFromBirth(val.birthdate)
            if (this.todaySeeDoctor.length === 0) {
              val.medicalRecordsForm = {  // 病历
                clinic_id: '',
                regist_id: '',
                medical_id: '',
                complaint: '',      // 主述
                cur_history: '',    // 现病史
                past_history: '',   // 既往史
                person_history: '',  // 个人史
                allergy_history: '',   // 过敏史
                family_history: '',    // 家族史
                other_history: '',  // 其他
                temperature: '',    // 体温
                systolic_pressure: '',    // 收缩压
                diastolic_pressure: '',   // 舒张压
                pulse: '',      // 脉搏
                breathing: '',          // 呼吸
                mainphyexam: '',    // 体格检查
                other_phy_exam: '',    // 辅助检查
                jibingjson: [],      // 病症tags
                advice: '',
                diagn_result: ''   // 本次诊断结果
              }
              val.westMedPre = [{
                westMedForm: {
                  flag: true,
                  totalMoney: 0,    // 总价
                  clinic_id: this.clinic,
                  regist_id: val.registid,
                  prescript_id: '',
                  prescript_type: 1,       //  处方类型。1-西药处方 2-中药处方 3-输液处方
                  doctor: this.msg.doctorTip.name,
                  doctorid: this.user.userid,
                  status: 0,
                  drug_list: [
                    {
                      group_index_str: '',     // 组合
                      drug_id: '',   // 药品id
                      drug_type: 0,
                      name: '',   // 药品名
                      spec_text: '',     // 规格
                      use_method: '',     // 用法
                      dosage: '',    // 单次剂量
                      dose_unit: '',      // 单次剂量(单位)
                      frequency: '',     // 用药频次
                      days: '',      // 天数
                      total: '',    // 开药数量
                      total_unit: '',       // 开药数量(单位)
                      price: 0,     // 单价
                      total_price: 0     // 金额
                    }
                  ]
                },
                westPreStatus: {
                  isDisabled: false,   // 禁用表单
                  isIconShow: false,   // 收费图标
                  validation: false    // 验证
                }
              }]
              val.chinaMedPre = [{
                chinaMedForm: {
                  flag: true,
                  totalMoney: 0,    // 总价
                  clinic_id: this.clinic,
                  regist_id: val.registid,
                  prescript_id: '',
                  prescript_type: 2,       //  处方类型。1-西药处方 2-中药处方 3-输液处方
                  doctor: this.msg.doctorTip.name,
                  doctorid: this.user.userid,
                  status: 0,
                  drug_list: [
                    {
                      name: '',   // 药品名
                      spec_text: '',  // 规格
                      bigSpecsUnit: '',  // 大单位
                      dosage: '',    // 单次剂量
                      dose_unit: '',      // 单次剂量(单位)
                      drug_id: '',   // 药品id
                      drug_type: 1,
                      use_note: '',    // 煎法，用法
                      price: 0,    // 单价
                      total_price: 0,     // 金额
                      total_unit: '剂',
                      specs: 1   // 规则计算
                    }
                  ],
                  use_method: '内服',        // 煎法用法
                  total: 1,      // 剂数
                  daily_use: '',   // 每次剂量
                  daily_use_unit: 'ml',
                  frequency: '',       // 频次
                  taking_note: ''      // 要求
                },
                chinaPreStatus: {
                  isDisabled: false,   // 禁用表单
                  isIconShow: false,   // 收费图标
                  validation: false    // 验证
                }
              }]
              val.infusionMedPre = [{  // 输液处方
                InfusionArr: [
                  {
                    totalMoney: 0,    // 总价
                    status: 0,
                    drug_list: [
                      {
                        name: '',   // 药品名
                        drug_id: '',   // 药品id
                        spec_text: '',
                        drug_type: 0,
                        dosage: '',    // 剂量
                        dose_unit: '',      // 剂量(单位)
                        skin_test: false,     // 皮试
                        total: '',           // 数量
                        total_unit: '',     // 数量单位
                        price: 0,        // 单价
                        total_price: 0     // 金额
                      }
                    ],
                    use_method: '',        // 用法
                    frequency: '',      // 频次
                    infusion_speed: '',     // 滴速
                    infu_speed_unit: '',     // 滴速(单位)
                    begin_date: new Date(),        // 日期
                    days: ''      // 天数
                  }
                ],
                infusionMedForm: {
                  flag: true,
                  clinic_id: this.clinic,
                  regist_id: val.registid,
                  prescript_id: '',
                  prescript_type: 3,       //  处方类型。1-西药处方 2-中药处方 3-输液处方
                  doctor: this.msg.doctorTip.name,
                  doctorid: this.user.userid,
                  status: 0
                },
                infusionPreStatus: {
                  isDisabled: false,   // 禁用表单
                  isIconShow: false,   // 收费图标
                  validation: false    // 验证
                }
              }]
              val.westPreShow = 0
              val.chinaPreShow = 0
              val.infusionPreShow = 0
              val.presForm = []
              val.checkItem = {
                items: [
                  {
                    clinic_id: this.clinic,
                    regist_id: val.registid,
                    chargitem_id: '',
                    name: '',
                    item_type: 3,
                    total: 1,
                    price: 0,
                    total_price: 0,
                    doctor: this.msg.doctorTip.name,
                    doctorid: this.user.userid,
                    status: 0
                  }
                ],
                otherMsg: {
                  isDisabled: false,   // 禁用表单
                  isIconShow: false    // 收费图标
                },
                totalMoney: 0
              }
              val.comsumables = {
                items: [
                  {
                    clinic_id: this.clinic,
                    regist_id: val.registid,
                    chargitem_id: '',
                    name: '',
                    item_type: 4,
                    total: 1,
                    price: 0,
                    total_price: 0,
                    doctor: this.msg.doctorTip.name,
                    doctorid: this.user.userid,
                    status: 0
                  }
                ],
                otherMsg: {
                  isDisabled: false,   // 禁用表单
                  isIconShow: false    // 收费图标
                },
                totalMoney: 0
              }
              val.other = {
                items: [
                  {
                    clinic_id: this.clinic,
                    regist_id: val.registid,
                    chargitem_id: '',
                    name: '',
                    item_type: 6,
                    total: 1,
                    price: 0,
                    total_price: 0,
                    doctor: this.msg.doctorTip.name,
                    doctorid: this.user.userid,
                    status: 0
                  }
                ],
                otherMsg: {
                  isDisabled: false,   // 禁用表单
                  isIconShow: false    // 收费图标
                },
                totalMoney: 0
              }
              val.checkItemTotalMoney = 0
              val.comsumablesTotalMoney = 0
              val.otherTotalMoney = 0
              val.medicalAdvice = ''
            }
            for (let i = 0; i < this.todaySeeDoctor.length; i++) {
              if (this.todaySeeDoctor[i].registid === val.registid) {  // 存在则赋值
                val.medicalRecordsForm = this.todaySeeDoctor[i].medicalRecordsForm
                val.medicalAdvice = this.todaySeeDoctor[i].medicalAdvice
                val.westMedPre = this.todaySeeDoctor[i].westMedPre
                val.chinaMedPre = this.todaySeeDoctor[i].chinaMedPre
                val.infusionMedPre = this.todaySeeDoctor[i].infusionMedPre
                val.presForm = this.todaySeeDoctor[i].presForm
                val.westPreShow = this.todaySeeDoctor[i].westPreShow
                val.chinaPreShow = this.todaySeeDoctor[i].chinaPreShow
                val.infusionPreShow = this.todaySeeDoctor[i].infusionPreShow
                val.checkItem = this.todaySeeDoctor[i].checkItem
                val.comsumables = this.todaySeeDoctor[i].comsumables
                val.other = this.todaySeeDoctor[i].other
                val.checkItemTotalMoney = this.todaySeeDoctor[i].checkItemTotalMoney
                val.comsumablesTotalMoney = this.todaySeeDoctor[i].comsumablesTotalMoney
                val.otherTotalMoney = this.todaySeeDoctor[i].otherTotalMoney
                val.medicalAdvice = this.todaySeeDoctor[i].medicalAdvice
                break
              } else {
                val.medicalRecordsForm = {  // 诊断信息
                  clinic_id: '',
                  regist_id: '',
                  medical_id: '',
                  complaint: '',       // 主述
                  cur_history: '',     // 现病史
                  past_history: '',    // 既往史
                  person_history: '',  // 个人史
                  allergy_history: '',   // 过敏史
                  family_history: '',    // 家族史
                  other_history: '',  // 其他
                  temperature: '',    // 体温
                  systolic_pressure: '',    // 收缩压
                  diastolic_pressure: '',   // 舒张压
                  pulse: '',      // 脉搏
                  breathing: '',          // 呼吸
                  mainphyexam: '',    // 体格检查
                  other_phy_exam: '',    // 辅助检查
                  advice: '',
                  diagn_result: '',   // 本次诊断结果
                  jibingjson: []      // 病症tags
                }
                val.westMedPre = [{  // 西药处方
                  westMedForm: {
                    flag: true,
                    totalMoney: 0,    // 总价
                    clinic_id: this.clinic,
                    regist_id: val.registid,
                    prescript_id: '',
                    prescript_type: 1,  //  处方类型。1-西药处方 2-中药处方 3-输液处方
                    doctor: this.msg.doctorTip.name,
                    doctorid: this.user.userid,
                    status: 0,
                    drug_list: [
                      {
                        group_index_str: '',     // 组合
                        drug_id: '',   // 药品id
                        drug_type: 0,
                        name: '',   // 药品名
                        spec_text: '',     // 规格
                        use_method: '',    // 用法
                        dosage: '',    // 单次剂量
                        dose_unit: '',     // 单次剂量(单位)
                        frequency: '',     // 用药频次
                        days: '',     // 天数
                        total: '',    // 开药数量
                        total_unit: '',       // 开药数量(单位)
                        price: 0,     // 单价
                        total_price: 0     // 金额
                      }
                    ]
                  },
                  westPreStatus: {
                    isDisabled: false,   // 禁用表单
                    isIconShow: false,   // 收费图标
                    validation: false    // 验证
                  }
                }]
                val.chinaMedPre = [{
                  chinaMedForm: {
                    flag: true,
                    totalMoney: 0,    // 总价
                    clinic_id: this.clinic,
                    regist_id: val.registid,
                    prescript_id: '',
                    prescript_type: 2,       //  处方类型。1-西药处方 2-中药处方 3-输液处方
                    doctor: this.msg.doctorTip.name,
                    doctorid: this.user.userid,
                    status: 0,
                    drug_list: [
                      {
                        name: '',   // 药品名
                        spec_text: '',  // 规格
                        bigSpecsUnit: '',  // 大单位
                        dosage: '',    // 单次剂量
                        drug_id: '',
                        drug_type: 1,
                        dose_unit: '',   // 单次剂量(单位)
                        use_note: '',    // 煎法，用法
                        price: 0,    // 单价
                        total_price: 0,     // 金额
                        total_unit: '剂'
                      }
                    ],
                    use_method: '内服',        // 煎法用法
                    total: 1,      // 剂数
                    daily_use: '',   // 每次剂量
                    f: 'ml',
                    frequency: '',   // 频次
                    taking_note: ''  // 要求
                  },
                  chinaPreStatus: {
                    isDisabled: false,   // 禁用表单
                    isIconShow: false,   // 收费图标
                    validation: false    // 验证
                  }
                }]
                val.infusionMedPre = [{  // 输液处方
                  InfusionArr: [
                    {
                      totalMoney: 0,    // 总价
                      status: 0,
                      drug_list: [
                        {
                          name: '',   // 药品名
                          drug_id: '',   // 药品id
                          spec_text: '',
                          dosage: '',    // 剂量
                          drug_type: 0,
                          dose_unit: '',      // 剂量(单位)
                          skin_test: false,   // 皮试
                          total: '',          // 数量
                          total_unit: '',     // 数量单位
                          price: 0,        // 单价
                          total_price: 0   // 金额
                        }
                      ],
                      use_method: '',     // 用法
                      frequency: '',      // 频次
                      infusion_speed: '',     // 滴速
                      infu_speed_unit: '',    // 滴速(单位)
                      begin_date: new Date(),        // 日期
                      days: ''      // 天数
                    }
                  ],
                  infusionMedForm: {
                    flag: true,
                    clinic_id: this.clinic,
                    regist_id: val.registid,
                    prescript_id: '',
                    prescript_type: 3,       //  处方类型。1-西药处方 2-中药处方 3-输液处方
                    doctor: this.msg.doctorTip.name,
                    doctorid: this.user.userid,
                    status: 0
                  },
                  infusionPreStatus: {
                    isDisabled: false,   // 禁用表单
                    isIconShow: false,   // 收费图标
                    validation: false    // 验证
                  }
                }]
                val.westPreShow = 0
                val.chinaPreShow = 0
                val.infusionPreShow = 0
                val.presForm = []
                val.checkItem = {
                  items: [
                    {
                      clinic_id: this.clinic,
                      regist_id: val.registid,
                      chargitem_id: '',
                      name: '',
                      item_type: 3,  // 0未知 1挂号 2处方 3检查项 4耗材 5门诊购药 6其他"name": "抽血检查"
                      total: 1,
                      price: 0,
                      total_price: 0,
                      doctor: this.msg.doctorTip.name,
                      doctorid: this.user.userid,
                      status: 0
                    }
                  ],
                  otherMsg: {
                    isDisabled: false,   // 禁用表单
                    isIconShow: false    // 收费图标
                  }
                }
                val.comsumables = {
                  items: [
                    {
                      clinic_id: this.clinic,
                      regist_id: val.registid,
                      chargitem_id: '',
                      name: '',
                      item_type: 4,
                      total: 1,
                      price: 0,
                      total_price: 0,
                      doctor: this.msg.doctorTip.name,
                      doctorid: this.user.userid,
                      status: 0
                    }
                  ],
                  otherMsg: {
                    isDisabled: false,   // 禁用表单
                    isIconShow: false    // 收费图标
                  }
                }
                val.other = {
                  items: [
                    {
                      clinic_id: this.clinic,
                      regist_id: val.registid,
                      chargitem_id: '',
                      name: '',
                      item_type: 6,
                      total: 1,
                      price: 0,
                      total_price: 0,
                      doctor: this.msg.doctorTip.name,
                      doctorid: this.user.userid,
                      status: 0
                    }
                  ],
                  otherMsg: {
                    isDisabled: false,   // 禁用表单
                    isIconShow: false    // 收费图标
                  }
                }
                val.checkItemTotalMoney = 0
                val.comsumablesTotalMoney = 0
                val.otherTotalMoney = 0
                val.medicalAdvice = ''  // 医嘱
              }
            }
            arr.push(val)
          })
          const copy = deepClone(arr)
          copy.sort((obj1, obj2) => {  // 排序
            if (obj1.registstatus === 3 && obj2.registstatus !== 3) {
              return 1
            } else {
              return 0
            }            
          })
          this.todaySeeDoctor = copy
        }
      })
    },
    receivePatient(item, id) {   // 点击客户列表获取挂号信息
      if (id === 3) {
        this.$router.push({ name: 'CheckClientMessage', query: { patientId: item.registid } })
      } else {
        this.$router.push({ name: 'Doctors' })
        service(registsingle, {
          registid: item.registid
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            this.isActive = item.registid  // 根据id判断选择颜色
            if (id === 1) {
              this.acceptPatient(item.registid, 2)  // 修改就诊状态 状态2接诊中
              item.westPreList = []
              item.chinaPreList = []
              item.infusionPreList = []
              item.checkItem.items = []
              item.comsumables.items = []
              item.other.items = []
            }
            if (id === 2) {
              this.getCheckPayList(item)  // 获取用户收费列表（诊疗项目、耗材、其他）
              this.getRecord(item)   // 获取病历及医嘱
              this.getPresList(item)  // 获取已开处方
            }
            item.details = res
            item.details.clinicname = this.clinicName  // 设置诊所名
            item.details.age = calculateFromBirth(res.birthdate)  // 计算年龄
            item.doctorTip = this.msg.doctorTip
            setTimeout(() => {  // 向子组件传值
              this.msg = deepClone(item)
              if (item.details.szsbcardid) {  // 存在电脑号则走智慧医保
                this.socialSecurity(item)  // 智慧医保提示
              }
            }, 300)
          }
        })
      }
    },
    acceptPatient(registid, statusid) {  // 接诊
      service(acceptPatients, {
        registid: registid,
        deptid: this.user.dept_id, // 科室id
        doctorid: this.user.userid,   // 医生id
        oldstatus: 1,
        newstatus: statusid
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.getPrescriptMessage()
        }
      })
    },
    handleClinicName() {  // 获取诊所名
      service(getClinicName).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.clinicName = res.clinic_name
        }
      })
    },
    socialSecurity(item) {  // 智慧医保提示
      const obj = {
        auth_token: this.shebao.zhihuiybtoken,
        content: {
          tran_serial_no: this.shebao.operatorCode + new Date().format('yyyyMMddhhmmss'),
          operate_person_code: this.shebao.operatorCode,
          operate_person_name: this.shebao.operatorName,
          operate_time: dateFilter(new Date().getTime(), 'yyyyMMdd'),
          visit_no: item.details.registid,
          patient_evidence_type: '01',  // 凭证类型。默认01，社会保障卡号
          card_no: item.details.szsbcardid,   // 个人电脑编号
          pc_no: item.details.szsbcardid,
          medical_dept_code: item.details.departmentcode,
          medical_dept_name: item.details.deptname,
          visit_type: '2',   // 就诊类型（2门诊）
          doctor_code: item.details.doctorcode,
          doctor_name: item.details.doctor,
          patient_name: item.name,
          sex: item.gender + '',
          age: item.age.toString(),
          birth_date: item.birthdate.replace(/-/g, ''),
          region_code: '440300',
          insurance_type: '310'  // 险种类型
        }
      }
      service(sbRemindApi, obj).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE')) && res.is_open_window === '1') {
          if (this.opener) {
            this.opener.close()
            this.opener = null
          }
          const url = res.window_url
          const outerWidth = window.outerWidth
          const outerHeight = window.outerHeight
          const height = parseFloat(res.window_size.split(',')[1])
          const width = parseFloat(res.window_size.split(',')[0])
          const top = (outerHeight - height) / 2
          const left = (outerWidth - width) / 2
          this.opener = window.open(url, '_blank', `height=${height},width=${width},top=${top},left=${left}`)
          if (res.window_open_way === '2') {
            setTimeout(() => {
              this.opener.close()
              this.opener = null
            }, 5000)
          }
        }
      })
    }
  },
  created() {
    if (!this.user.truename) {
      this.msg.doctorTip.name = this.user.phone  // 将用户名赋值给医生
      this.msg.doctorTip.tipMsg = true
    } else {
      this.msg.doctorTip.name = this.user.truename  // 将用户名赋值给医生
      this.msg.doctorTip.tipMsg = false
    }
    this.getPrescriptMessage()
    this.handleClinicName()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic', 'shebao']),
    usefulDoctor() {
      return this.doctors.filter(item => item.deptid === this.quickForm.deptid)
    }
  },
  filters: {
    statusFilter(status) {  // 就诊状态
      switch (status) {
        case 0:
          return '未知'
        case 1:
          return '待接诊'
        case 2:
          return '诊断中'
        case 3:
          return '就诊完成'
        case 4:
          return '已退号'
        case 5:
          return '已失效'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.patient {
  margin-top: 20px;
  margin-left: 30px;
  width: 1000px;
  .quick {
    border-bottom: 1px solid #ddd;
    padding-bottom: 6px;
    .person {
      margin-left: 20px;
      color: #666;
    }
  }
  &.active {
    color: #e4e4f0;
  }
  .base-info {
    color: #666;
    span {
      display: inline-block;
      height: 30px;
      line-height: 30px;
      font-weight: 600;
      background: #eee;
    }
    .el-button {
      margin-left: 20px;
    }
  }
}
</style>

