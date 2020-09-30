const baseURL = 'http://127.0.0.1:20188'
const needToken = true
const needSheBaoHead = true
/*
  * Client Common
  * ========================================================================================================================================
*/

export const connect = {  // 测试服务器连接状态
  url: '/sysmng/conn',
  baseURL,
  needToken,
  needSheBaoHead
}

export const baseinfo = {
  url: '/person/baseinfo',
  baseURL,
  needSheBaoHead
}

export const detailinfo = {
  url: '/person/xx002',
  baseURL,
  needSheBaoHead
}

/*
  * Client Common End
  * ========================================================================================================================================
*/

/*
  * 用户 (HIS) ==============================================================================================================================
*/

// 登录
export const login = {
  url: '/service/user/login'
}

// 退出
export const logout = {
  url: '/service/user/logout',
  needToken
}

// 注册
export const regist = {
  url: '/service/user/register'
}

// 短信验证码(忘记密码)
export const forgotSmscode = {
  url: '/service/user/get_forgot_smscode'
}

// 短信验证码(注册)
export const registSmscode = {
  url: '/service/user/get_register_smscode'
}

// 找回密码
export const forgotPwd = {
  url: '/service/user/forgot_pswd'
}

// 修改用户信息
export const userModify = {
  url: '/service/user/modify',
  needToken
}

// 修改密码
export const userModifyPwd = {
  url: '/service/user/modify_pswd',
  needToken
}

/*
  * END ====================================================================================================================================
*/

/*
  * 管理员模块  =============================================================================================================================
*/

// 诊所列表
export const clinicList = {
  url: '/service/user/clinic_list',
  needToken
}

// 添加诊所
export const clinicAdd = {
  url: '/service/user/create_clinic',
  needToken
}

/*
  * END  ===================================================================================================================================
*/


/**
 * 挂号
 */
export const getClinicName = {  // 获取诊所名
  url: '/service/public/clinic_name',
  needToken,
  clinicid: 'clinic_id'
}

export const getDeptList = {  // 获取科室
  url: '/service/clinic/dept_list',
  needToken,
  clinicid: 'clinic_id'
}

export const getDocList = {  // 获取医生
  url: '/service/clinic/user_list',
  needToken,
  clinicid: 'clinic_id'
}

export const getChargitemList = {  // 获取收费列表
  url: '/service/clinic/chargitem_list',
  needToken,
  clinicid: 'clinic_id'
}

export const addRegist = {  // 增加挂号
  url: '/service/registration/registadd',
  needToken,
  clinicid: 'clinicid'
}

export const patientSearch = {  // 患者搜索
  url: '/service/registration/patientsearch',
  needToken,
  clinicid: 'clinicid'
}

export const patientDetail = {  // 患者信息
  url: '/service/registration/patientdetail',
  needToken,
  clinicid: 'clinicid'
}

export const patientDetail2 = {  // 社保患者信息
  url: '/service/registration/patientszsbquery',
  needToken,
  clinicid: 'clinicid'
}

export const cancelRegist = {  // 取消挂号
  url: '/service/registration/registstatus',
  needToken,
  clinicid: 'clinicid'
}

export const registList = {  // 挂号列表
  url: '/service/registration/registlist',
  needToken,
  clinicid: 'clinicid'
}


/*
  * END  ===================================================================================================================================
*/


/**
 * 诊所管理
 */
export const createDept = {  // 新增科室
  url: '/service/clinic/create_dept',
  needToken,
  clinicid: 'clinic_id'
}

export const modifyDept = {  // 编辑科室
  url: '/service/clinic/modify_dept',
  needToken,
  clinicid: 'clinic_id'
}

export const createChargitem = {  // 新增项目
  url: '/service/clinic/create_chargitem',
  needToken,
  clinicid: 'clinic_id'
}

export const fuzzysearchzhenliao = {  // 搜索诊疗项目
  url: '/service/clinic/fuzzysearchzhenliao',
  needToken,
  clinicid: 'clinic_id'
}

export const fuzzysearchcailiao = {  // 搜索耗材项目
  url: '/service/clinic/fuzzysearchcailiao',
  needToken,
  clinicid: 'clinic_id'
}

export const chargitemByType = {  // 分页获取itemList
  url: '/service/clinic/chargitem_by_type',
  needToken,
  clinicid: 'clinic_id'
}

export const getzhenliaoByKey = {  // 获取医保诊疗详情
  url: '/service/clinic/getzhenliaobykey',
  needToken,
  clinicid: 'clinic_id'
}

export const getcailiaoByKey = {  // 获取医保诊疗详情
  url: '/service/clinic/getcailiaobykey',
  needToken,
  clinicid: 'clinic_id'
}

export const getChargitemInfo = {  // 获取医保诊疗详情
  url: '/service/clinic/chargitem_info',
  needToken,
  clinicid: 'clinic_id'
}

export const modifyChargitem = {  // 获取医保诊疗详情
  url: '/service/clinic/modify_chargitem',
  needToken,
  clinicid: 'clinic_id'
}

export const clinicInfo = {  // 获取诊所信息
  url: '/service/clinic/info',
  needToken,
  clinicid: 'clinic_id'
}

export const uploadFile = {  // 上传头像
  url: '/service/clinic/upload_file',
  needToken,
  clinicid: 'clinic_id',
};

export const fileInfo = {  // 获取头像
  url: '/service/clinic/file_info',
  needToken,
  clinicid: 'clinic_id'
}

/*
  * END  ===================================================================================================================================
*/

/**
 * 诊所管理の绑定医保
 */

export const bindSzsb = {  // 绑定社保
  url: '/service/clinic/szsbbind',
  needToken,
  clinicid: 'clinic_id'
}

export const szdoctorListHis = {  // 获取社保医生列表
  url: '/service/clinic/szsbdoctorlist',
  needToken,
  clinicid: 'clinic_id'
}

export const doctorRegistSb = {  // 医生登记注册(社保)
  url: '/doctor/regist',
  baseURL,
  needToken,
  needSheBaoHead
}

export const doctorRegistHis = {  // 医生登记注册(his)
  url: '/service/clinic/szsbdoctoradd',
  needToken,
  clinicid: 'clinic_id'
}

export const szdoctorEditSb = {  // 医生登记信息编辑(社保)
  url: '/doctor/update',
  baseURL,
  needToken,
  needSheBaoHead
}

export const szdoctorEditHis = {  // 医生登记信息编辑(his)
  url: '/service/clinic/szsbdoctorupate',
  needToken,
  clinicid: 'clinic_id'
}

export const changeDocotorSb = {  // 医生注销(社保)
  url: '/doctor/change',
  baseURL,
  needToken,
  needSheBaoHead
}
export const changeDocotorHis = {  // 医生注销(his)
  url: '/service/clinic/szsbdoctorstatus',
  needToken,
  clinicid: 'clinic_id'
}

export const bookingStatus = {  // 机构约定信息查询
  url: '/clinic/info',
  baseURL,
  needToken,
  needSheBaoHead
}

export const bookingProject = {  // 备案诊疗项目
  url: '/beian/zhenliao',
  baseURL,
  needToken,
  needSheBaoHead
}

export const bookingMaterial = {  // 备案耗材
  url: '/beian/cailiao',
  baseURL,
  needToken,
  needSheBaoHead
}

export const bookingDrug = {  // 备案药品
  url: '/beian/drug',
  baseURL,
  needToken,
  needSheBaoHead
}

export const sbzbinfoupdate = {  // 社保药品备案价格与状态的更新
  url: '/service/drug/sbzbinfoupdate',
  needToken,
  clinicid: 'clinic_id'
}

export const batchmodifychargitem = {  // 社保诊疗项备案价格与状态的更新
  url: '/service/clinic/batchmodifychargitem',
  needToken,
  clinicid: 'clinic_id'
}

export const bookingQuery = {  // 备案查询
  url: '/beian/query',
  baseURL,
  needToken,
  needSheBaoHead
}

export const bookingCancel = {  // 备案撤销
  url: '/beian/cexiao',
  baseURL,
  needToken,
  needSheBaoHead
}

export const sbDzdaily = {  // 日终对账
  url: '/clinic/dzdaily',
  baseURL,
  needToken,
  needSheBaoHead
}

export const dzquery = {  // dz002交易流水对比查询
  url: '/clinic/dzquery',
  baseURL,
  needToken,
  needSheBaoHead
}

export const dzdetailquery = {  // dz003交易明细对比查询
  url: '/clinic/dzdetailquery',
  baseURL,
  needToken,
  needSheBaoHead
}

export const szsbchargequery = {  // dz003交易明细对比查询
  url: '/service/outpatiend/szsbchargequery',
  needToken,
  clinicid: 'clinicid'
}

/*
  * END  ===================================================================================================================================
*/

/**
 * 药品进销存 ================================================================================================================================
 */

export const getDrugList = {  // 获取药品目录
  url: '/service/drug/infolistquery',
  needToken,
  clinicid: 'clinic_id'
}

export const querySearchDrugKey = {  // 新增药品模糊查询
  url: '/service/drug/sshortlist',
  needToken,
  clinicid: 'clinic_id'
}

export const selectDrug = {  // 新增药品模糊查询
  url: '/service/drug/sinfobykey',
  needToken,
  clinicid: 'clinic_id'
}

export const saveDrug = {  // 储存药品信息
  url: '/service/drug/infoadd',
  needToken,
  clinicid: 'clinic_id'
}

export const InventoryRecords = {  // 盘点记录列表
  url: '/service/drug/getcheckrecordlist',
  needToken
}

export const createstockcheck = {  // 盘点记录列表
  url: '/service/drug/createstockcheck',
  needToken
}

export const getcheckitemlist = {  // 盘点详情列表
  url: '/service/drug/getcheckitemlist',
  needToken
}

export const updatecheckeditem = {  // 更新盘点数据
  url: '/service/drug/updatecheckeditem',
  needToken
}

export const finishstockcheck = {  // 更新盘点数据
  url: '/service/drug/finishstockcheck',
  needToken
}

export const drugPandian = {  // 社保盘点接口
  url: '/drug/pandian',
  baseURL,
  needToken,
  needSheBaoHead
}

export const drugBuyin = {  // 社保进药接口
  url: '/drug/buyin',
  baseURL,
  needToken,
  needSheBaoHead
}

export const purchasequeryitems = {  // 更新盘点数据
  url: '/service/drug/purchasequeryitems',
  needToken,
  clinicid: 'clinic_id'
}

export const stockquery = {  // 库存列表
  url: '/service/drug/stockquery',
  needToken,
  clinicid: 'clinic_id'
}

export const drugStore = {  // 社保库存
  url: '/drug/store',
  baseURL,
  needToken,
  needSheBaoHead
}

export const drugDeleteStore = {  // 撤销
  url: '/drug/jx005',
  baseURL,
  needToken,
  needSheBaoHead
}

export const supplierquerylist = {  // 供应商列表
  url: '/service/drug/supplierquerylist',
  needToken,
  clinicid: 'clinic_id'
}

export const szsbdruglogs = {  // 药品销售统计
  url: '/service/stats/szsbdrug_logs',
  needToken,
  clinicid: 'clinic_id'
}

/*
  * 收费(客户端)  ===========================================================================================================================
*/
// 挂号试算
export const registrationTryChargeUrl = {
  url: '/clinic/guahaoss',
  baseURL,
  needSheBaoHead
}

// 接诊
export const receiveTreatment = {
  url: '/bingli/jiezhen',
  baseURL,
  needSheBaoHead
}

// 挂号结算
export const registrationChargeUrl = {
  url: '/clinic/guahaojs',
  baseURL,
  needSheBaoHead
}

// 处方录入
export const cfadd = {
  url: '/clinic/cfadd',
  baseURL,
  needSheBaoHead
}

// 处方取消
export const cfcancel = {
  url: '/clinic/cfcancel',
  baseURL,
  needSheBaoHead
}

// 处方试算
export const fyshisuan = {
  url: '/clinic/fyshisuan',
  baseURL,
  needSheBaoHead
}

// 处方结算
export const fyjiesuan = {
  url: '/clinic/fyjiesuan',
  baseURL,
  needSheBaoHead
}

// 交易查询
export const cfquery = {
  url: '/clinic/cfquery',
  baseURL,
  needSheBaoHead
}

/*
  * END   ==================================================================================================================================
*/

/*
  * 退费 (Client)  ==========================================================================================================================
*/

// 交易退费
export const jycancel = {
  url: '/clinic/jycancel',
  baseURL,
  needSheBaoHead
}

// 本月撤销
export const jydrop = {
  url: '/clinic/jydrop',
  baseURL,
  needSheBaoHead
}

/*
  * END ====================================================================================================================================
*/

/*
  * 收费(HIS)  =============================================================================================================================
*/

// 待收费列表
export const chargeList = {
  url: '/service/outpatiend/chargelist',
  needToken,
  clinicid: 'clinic_id'
}

// 收费详情
export const feeDetail = {
  url: '/service/outpatiend/chargeinfo',
  needToken,
  clinicid: 'clinicid'
}

// 已收费列表
export const payedList = {
  url: '/service/outpatiend/payedlist',
  needToken,
  clinicid: 'clinicid'
}

// 退费详情
export const backFeeDetail = {
  url: '/service/outpatiend/payedinfo',
  needToken,
  clinicid: 'clinicid'
}

// 退费
export const payedRefund = {
  url: '/service/outpatiend/payedrefund',
  needToken,
  clinicid: 'clinicid'
}

// 收费
export const chargeForHIS = {
  url: '/service/outpatiend/payedadd',
  needToken
}

/*
   * END   =================================================================================================================================
*/

/*
  * 客户档案(HIS) ===========================================================================================================================
*/

// 客户档案列表
export const customerList = {
  url: '/service/customers/archivelist',
  needToken,
  clinicid: 'clinicid'
}

// 新建客户档案
export const customerAdd = {
  url: '/service/registration/patientadd',
  needToken,
  clinicid: 'clinicid'
}

// 客户信息
export const customerInfo = {
  url: '/service/customers/archiveinfo',
  needToken,
  clinicid: 'clinicid'
}

// 修改客户信息
export const customerInfoUpdate = {
  url: '/service/registration/patientupdate',
  needToken,
  clinicid: 'clinicid'
}

// 接诊记录列表
export const diagnosisList = {
  url: '/service/diagnosis/list',
  needToken,
  clinicid: 'clinic_id'
}

// 接诊记录详情
export const diagnosisInfo = {
  url: '/service/diagnosis/info',
  needToken,
  clinicid: 'clinic_id'
}

// 随访记录列表
export const followUpList = {
  url: '/service/customers/followuplist',
  needToken,
  clinicid: 'clinicid'
}

// 当前客户收费列表
export const customerPayedList = {
  url: '/service/outpatiend/payedlist',
  needToken,
  clinicid: 'clinicid'
}
/*
  * END   ==================================================================================================================================
*/


/*
  * 挂号(HIS)  =============================================================================================================================
*/

export const registFast = {  // 快速挂号
  url: '/service/prescription/registfast',
  needToken,
  clinicid: 'clinicid'
}

export const registdoctor = {  // 获取患者列表
  url: '/service/prescription/registdoctor',
  needToken,
  clinicid: 'clinicid'
}

export const registsingle = {  // 获取挂号信息
  url: '/service/registration/registsingle',
  needToken,
  clinicid: 'clinicid'
}

export const prescriptionList = {  // 获取处方列表
  url: '/service/prescription/list',
  needToken,
  clinicid: 'clinic_id'
}

export const getUserChargitemList = {  // 获取诊疗项列表
  url: '/service/chargitem/list',
  needToken,
  clinicid: 'clinic_id'
}

export const getUserMedicalInfo = {  // 获取病历医嘱
  url: '/service/medical/info',
  needToken,
  clinicid: 'clinic_id'
}

export const acceptPatients = {  // 修改就诊状态
  url: '/service/registration/registstatus',
  needToken,
  clinicid: 'clinicid'
}


export const modifyReferral = {  // 修改就诊类型
  url: '/service/medical/modify_referral',
  needToken,
  clinicid: 'clinic_id'
}

export const lastDiagnosis = {  // 获取最近就诊记录
  url: '/service/diagnosis/last_info',
  needToken,
  clinicid: 'clinic_id'
}

export const saveMedical = {  // 保存病历
  url: '/service/medical/save',
  needToken,
  clinicid: 'clinic_id'
}

export const saveAdvice = {  // 保存病历
  url: '/service/medical/save_advice',
  needToken,
  clinicid: 'clinic_id'
}

export const presSearchDrug = {  // 搜索药品
  url: '/service/prescription/search_drug',
  needToken,
  clinicid: 'clinic_id'
}

export const presDrugInfo = {  // 搜索药品详情
  url: '/service/prescription/drug_info',
  needToken,
  clinicid: 'clinic_id'
}

export const addPre = {  // 增加处方
  url: '/service/prescription/save',
  needToken,
  clinicid: 'clinic_id'
}

export const modifyPre = {  // 修改处方
  url: '/service/prescription/info',
  needToken,
  clinicid: 'clinic_id'
}

export const delPreApi = {  // 删除处方
  url: '/service/prescription/delete',
  needToken,
  clinicid: 'clinic_id'
}

export const saveChargitem = {  // 保存诊疗项
  url: '/service/chargitem/save',
  needToken,
  clinicid: 'clinic_id'
}

export const deleteChargitem = {  // 删除诊疗项
  url: '/service/chargitem/delete',
  needToken,
  clinicid: 'clinic_id'
}

export const createTemplate = {  // 新建模板
  url: '/service/template/create',
  needToken,
  clinicid: 'clinic_id'
}

export const getTemplateMenu = {  // 获取模板列表
  url: '/service/template/list',
  needToken,
  clinicid: 'clinic_id'
}

export const getjibing = {  // 获取模板列表
  url: '/service/prescription/getjibing',
  needToken,
  clinicid: 'clinic_id'
}


export const sbRemindApi = {  // 智慧医保提醒
  url: 'medical_insurance/remind',
  baseURL,
  needToken,
  needSheBaoHead
}
export const sbAuditApi = {  // 智慧医保审核
  url: 'medical_insurance/audit',
  baseURL,
  needToken,
  needSheBaoHead
}
/*
  * END ====================================================================================================================================
*/

/*
  * 药房  =============================================================================================================================
*/
export const dback = {  // 退药
  url: '/service/drugdeliver/dback',
  needToken,
  clinicid: 'clinicid'
}

export const drugDeliver = {  // 社保发药接口
  url: '/drug/deliver',
  baseURL,
  needToken,
  needSheBaoHead
}

/*
  * END ====================================================================================================================================
*/

/*
  * 对账  =============================================================================================================================
*/
export const getszsbmonthdata = {  // his对账
  url: '/service/outpatiend/getszsbmonthdata',
  needToken,
  clinicid: 'clinicid'
}

export const getszsbdailydata = {  // 获取当日信息
  url: '/service/outpatiend/getszsbdailydata',
  needToken,
  clinicid: 'clinicid'
}

export const setduizhangstatus = {  // 保存对账状态
  url: '/service/outpatiend/setduizhangstatus',
  needToken,
  clinicid: 'clinicid'
}

export const getDrugUpData = {  // 保存对账状态
  url: '/service/stats/szsbdrug_logs',
  needToken,
  clinicid: 'clinic_id'
}


/*
  * 检测检查接口  =============================================================================================================================
*/
export const DoctorSMS = {
  url: '/service/inspection/doctor_sms',
  needToken,
  clinicid: 'clinic_id'
}

export const InsLogin = {
  url: '/service/inspection/login',
  needToken,
  clinicid: 'clinic_id'
}

export const InsGetOrder = {
  url: '/service/inspection/get_order_list',
  needToken,
  clinicid: 'clinic_id'
}

export const InsBindCheck = {
  url: '/service/inspection/bind_check',
  needToken,
  clinicid: 'clinic_id'
}

export const InsGetReportList = {
  url: '/service/inspection/get_report_list',
  needToken,
  clinicid: 'clinic_id'
}
/*
  * END ====================================================================================================================================
*/
