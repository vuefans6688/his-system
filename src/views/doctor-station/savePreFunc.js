
import deepClone from '@/utils/deepClone'
import service from '@/utils/request'
import { modifyPre, sbAuditApi } from '@/serve/api'
import { dateFilter } from '@/utils/filters'
import store from '@/store'
import connectionTest from '@/common/connection'

let opener = null

async function sbAuditRequest(bindSheBao, content) {  // 调用智慧社保审批
  const connectionStatus = await connectionTest()
  if (connectionStatus !== '1') {
    return
  }
  service(sbAuditApi, {
    auth_token: bindSheBao.zhihuiybtoken,
    content: content
  }).then(res => {
    if (!(typeof res === 'string' && res.includes('ERRORCODE')) && res.is_open_window === '1') {
      if (opener) {
        opener.close()
        opener = null
      }
      const url = res.window_url
      const outerWidth = window.outerWidth
      const outerHeight = window.outerHeight
      const height = parseFloat(res.window_size.split(',')[1])
      const width = parseFloat(res.window_size.split(',')[0])
      const top = (outerHeight - height) / 2
      const left = (outerWidth - width) / 2
      opener = window.open(url, '_blank', `height=${height},width=${width},top=${top},left=${left}`)
      if (res.window_open_way === '2') {
        setTimeout(() => {
          opener.close()
          opener = null
        }, 5000)
      }
    }
  })
}

function fixWestContent(bindSheBao, res, preId, patientInfo, preType = 1) {
  const content = {
    tran_serial_no: bindSheBao.operatorCode + new Date().format('yyyyMMddhhmmss'),
    operate_person_code: bindSheBao.operatorCode,
    operate_person_name: bindSheBao.operatorName,
    operate_time: dateFilter(new Date().getTime(), 'yyyyMMdd'),
    visit_no: res.regist_id,
    medical_dept_code: res.departmentcode,
    medical_dept_name: res.dept_name,
    visit_type: '2',   // 就诊类型（2门诊）
    medicine_type: '11',  // 医疗类别
    card_no: patientInfo.details.szsbcardid,
    pc_no: patientInfo.details.szsbcardid,
    patient_name: patientInfo.name,
    sex: patientInfo.gender + '',
    age: patientInfo.age.toString(),
    birth_date: patientInfo.birthdate.replace(/-/g, ''),
    region_code: '440300',
    insurance_type: '310',  // 险种类型
    doctor_code: res.doctorszsbid,
    doctor_name: res.doctorszsbname,
    doctor_advice_no: preId,   // 处方流水号
    diagnoses: [],  // 门诊诊断信息
    advice_details: []   // 医嘱明细信息
  }
  content.diagnoses = patientInfo.medicalRecordsForm.jibingjson.map((val, index) => {
    return {
      diagnose_no: (index + 1).toString(),  // 编号
      diagnose_code: val.maincode,  // 诊断代码
      diagnose_desc: val.jbname  // 诊断描述
    }
  })

  if (preType === 2) {  // 处理中药
    content.advice_details = res.drug_list.map(val => {
      const drugInfo = val.druginfo;
      const days = (val => {
        const obj = store.getters.frequencyList.find(val2 => val2.name === val.frequency)
        if (obj) {
          return Math.ceil(obj.times * val.total)
        }
        return 1
      })(val)
      return {
        project_code: drugInfo.ake001,  // 项目编码（使用医保三目录项目编码）
        hospital_code: bindSheBao.hospitalCode,
        project_name: val.name,
        is_out_recip: '1',  // 外配处方标志（0：非外配处方 1：外配处方）
        recipe_no: bindSheBao.hospitalCode + preId,
        medical_specification: val.spec_text,
        price: val.price,
        medical_number: val.total,
        dose_unit: val.total_unit,
        amount: val.price * val.total,
        use_day: days,
        single_dose_number: val.dosage,
        single_dose_unit: val.dose_unit,
        single_take_number: val.dosage,
        single_take_unit: val.dose_unit,
        take_medical_number: val.total * val.dosage,
        take_medical_unit: val.dose_unit,
        take_frequence: val.frequency,
        dose_day: days
      }
    })
  } else {  // 处理西药输液
    content.advice_details = res.drug_list.map(val => {
      return {
        project_code: val.druginfo.ake001,  // 项目编码(使用医保三目录项目编码)
        hospital_code: bindSheBao.hospitalCode,
        project_name: val.name,
        is_out_recip: '1',  // 外配处方标志（0：非外配处方 1：外配处方）
        recipe_no: bindSheBao.hospitalCode + preId,
        medical_specification: val.spec_text,
        price: val.price,
        medical_number: val.total,
        dose_unit: val.total_unit,
        amount: val.price * val.total,
        use_day: val.days,
        single_dose_number: val.dosage,
        single_dose_unit: val.dose_unit,
        single_take_number: val.dosage,
        single_take_unit: val.dose_unit,
        take_medical_number: val.total,
        take_medical_unit: val.total_unit,
        dose_day: val.days,
        take_frequence: val.frequency
      }
    })
  }
  sbAuditRequest(bindSheBao, content)
}

function getPreMessage(bindSheBao, preId, patientInfo, preType) {
  service(modifyPre, {
    regist_id: patientInfo.registid,
    prescript_id: preId,
    prescript_type: preType,
    status: -1
  }).then(res => {
    if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
      fixWestContent(bindSheBao, res, res.danju, patientInfo, preType)  // 调整数据
    }
  })
}

const savePreFunc = {
  allChange(patientInfo) {
    const arr = []
    if (patientInfo.westMedPre.length) {
      patientInfo.westMedPre.forEach(val => {
        if (!val.westMedForm.flag) {
          val.westMedForm.drug_list.map(val2 => {
            val2.dosage -= 0
            val2.days -= 0
            val2.total -= 0
            return val.westMedForm
          })
          arr.push(val.westMedForm)
        }
      })
    }
    if (patientInfo.chinaMedPre.length) {
      patientInfo.chinaMedPre.forEach(val => {
        if (!val.chinaMedForm.flag) {
          val.chinaMedForm.drug_list.map(val2 => {
            val2.dosage -= 0
            return val.chinaMedForm
          })
          arr.push(val.chinaMedForm)
        }
      })
    }
    if (patientInfo.infusionMedPre.length) {
      patientInfo.infusionMedPre.forEach(val => {
        if (!val.infusionMedForm.flag) {
          const inArr = []
          val.InfusionArr.forEach((val1, index1) => {
            val1.drug_list.forEach(val2 => {
              val2.group_index_str = (index1 + 1).toString()
              val2.dosage -= 0
              val2.total -= 0
              val2.use_method = val1.use_method
              val2.frequency = val1.frequency
              val2.infusion_speed = +val1.infusion_speed
              val2.infu_speed_unit = val1.infu_speed_unit
              val2.begin_date = (new Date(val1.begin_date).getTime()).toString()
              val2.days = +val1.days
              inArr.push(val2)
            })
          })
          const copy = deepClone(inArr)
          copy.map(val3 => {
            val3.skin_test = val3.skin_test ? 1 : 0
            return copy
          })
          val.infusionMedForm.drug_list = copy
          arr.push(val.infusionMedForm)
        }
      })
    }
    const arr2 = arr.filter(val => val.status === 0)
    return arr2
  },
  /**
     * sbAudit智慧医保审批
     * 参数
     * 1绑定信息 2处方id 3挂号id 4处方类别（1西药、2中药、3输液）
     */
  sbAudit(bindSheBao, preId, patientInfo, preType) {
    getPreMessage(bindSheBao, preId, patientInfo, preType)  // 获取处方信息
  }
}

export default savePreFunc
