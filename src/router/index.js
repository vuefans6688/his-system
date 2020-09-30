import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
/**
 * index 是后端定义的字段，表示索引的意思，但它是从1开始的
 * needAuth 表示是否需要权限验证，true为需要，false为不需要
 * hidden 是否在侧边栏中显示项目模块 true是隐藏，默认是false显示
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    name: 'Login'
  },
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    name: 'Register'
  },
  {
    path: '/forget',
    component: () => import('@/views/forget/index'),
    name: 'Forget'
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/index'),
    hidden: true,
    children: [
      {
        path: '/',
        redirect: 'clinic-list'
      },
      {
        path: 'clinic-list',
        name: 'ClinicList',
        component: () => import('@/views/admin/clinic-list'),
        meta: { title: '诊所列表' }
      },
      {
        path: 'account-info',
        name: 'AccountInfo',
        component: () => import('@/views/user-info/account-info'),
        meta: { title: '用户信息' }
      }
    ]
  },
  {
    path: '/user-info',
    component: () => import('@/views/user-info/index'),
    hidden: true,
    children: [
      {
        path: '/user-info/account-info',
        component: () => import('@/views/user-info/account-info')
      }
    ]
  },
  {
    path: '/registration',
    component: Layout,
    redirect: '/registration/add-registration',
    name: 'Registration',
    meta: { title: '登记挂号', icon: 'el-icon-first-aid-kit' },
    index: 1,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/registration/index')
      },
      {
        path: 'add-registration',
        name: 'AddRegistration',
        component: () => import('@/views/registration/add-registration'),
        meta: { title: '咨询挂号' }
      },
      {
        path: 'registration-info',
        name: 'RegistrationInfo',
        component: () => import('@/views/registration/registration-info'),
        meta: { title: '登记列表' }
      },
      {
        path: 'new-follow-project',
        component: () => import('@/views/customers/follow-up/new-follow-project'),
        meta: { title: '新随访计划' },
        hidden: true
      }
    ]
  },
  {
    path: '/doctor-station',
    component: Layout,
    redirect: '/doctor-station/patient-message',
    meta: { title: '医生站', icon: 'el-icon-school' },
    index: 2,
    needAuth: true,  
    children: [
      {
        path: 'doctors',
        name: 'Doctors',
        component: () => import('@/views/doctor-station/doctors'),
        meta: { title: '今日接诊' }
      },
      {
        path: 'patient-message',
        name: 'PatientMessage',
        component: () => import('@/views/doctor-station/patient-message'),
        meta: { title: '患者消息' },
        hidden: true
      },
      {
        path: 'treatment-history',
        name: 'TreatmentHistory',
        component: () => import('@/views/doctor-station/treatment-history'),
        meta: { title: '接诊记录' }
      },
      {
        path: 'quick-regist',
        name: 'QuickRegist',
        component: () => import('@/views/doctor-station/quick-regist'),
        meta: { title: '快速接诊' },
        hidden: true
      },
      {
        path: 'check-client-message',
        name: 'CheckClientMessage',
        component: () => import('@/views/doctor-station/check-client-message'),
        meta: { title: '查看患者信息' },
        hidden: true
      },
      {
        path: 'report-query',
        name: 'ReportQuery',
        component: () => import('@/views/doctor-station/report-query'),
        meta: { title: '报告查询' },
        hidden: true
      },
      {
        path: 'patient-visitor/:patientid',
        component: () => import('@/views/customers/customer-detail'),
        meta: { title: '客户详情' },
        hidden: true,
        children: [
          {
            path: '/',
            redirect: 'customer-info'
          },
          {
            path: 'customer-info',
            component: () => import('@/views/customers/details/customer-info')
          },
          {
            path: 'visit-record',
            component: () => import('@/views/customers/details/visit-record')
          },
          {
            path: 'follow-up-record',
            component: () => import('@/views/customers/details/follow-up-record')
          },
          {
            path: 'charge-record',
            component: () => import('@/views/customers/details/charge-record')
          }
        ]
      }
    ]
  },
  {
    path: '/customers',
    component: Layout,
    redirect: '/customers/customer-list',
    name: 'Customers',
    meta: { title: '客户管理', icon: 'el-icon-s-custom' },
    index: 6,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/customers/index'),
      },
      {
        path: 'customer-list',
        name: 'CustomerList',
        component: () => import('@/views/customers/customer-list'),
        meta: { title: '客户档案' }
      },
      {
        path: 'customer-detail',
        component: () => import('@/views/customers/customer-detail'),
        meta: { title: '客户详情' },
        hidden: true,
        children: [
          {
            path: '/',
            redirect: 'customer-info'
          },
          {
            path: 'customer-info',
            component: () => import('@/views/customers/details/customer-info'),
            name: 'CustomerInfo',
            meta: { title: '客户信息' }
          },
          {
            path: 'visit-record',
            component: () => import('@/views/customers/details/visit-record'),
            name: 'VisitRecord',
            meta: { title: '就诊记录' }
          },
          {
            path: 'follow-up-record',
            component: () => import('@/views/customers/details/follow-up-record'),
            name: 'FollowUpRecord',
            meta: { title: '随访记录' }
          },
          {
            path: 'charge-record',
            component: () => import('@/views/customers/details/charge-record'),
            name: 'ChargeRecord',
            meta: { title: '收费记录' }
          }
        ]
      },
      {
        path: 'follow-up',
        name: 'FollowUp',
        component: () => import('@/views/customers/follow-up/index'),
        meta: { title: '随访' },
        children: [
          {
            path: 'already-follow',
            name: 'AlreadyFollow',
            component: () => import('@/views/customers/follow-up/already-follow'),
            meta: { title: '已随访' }
          },
          {
            path: 'cancel-follow',
            name: 'CancelFollow',
            component: () => import('@/views/customers/follow-up/cancel-follow'),
            meta: { title: '取消随访' }
          },
          {
            path: 'new-follow',
            name: 'NewFollow',
            component: () => import('@/views/customers/follow-up/new-follow'),
            meta: { title: '新随访' }
          },
          {
            path: 'new-follow-project',
            name: 'NewFollowProject',
            component: () => import('@/views/customers/follow-up/new-follow-project'),
            meta: { title: '新随访计划' },
            hidden: true
          },
          {
            path: 'waiting-follow',
            name: 'WaitingFollow',
            component: () => import('@/views/customers/follow-up/waiting-follow'),
            meta: { title: '待随访' }
          },
          {
            path: 'check-follow',
            name: 'CheckFollow',
            component: () => import('@/views/customers/follow-up/check-follow'),
            meta: { title: '查看随访' },
            hidden: true
          },
          {
            path: 'check-cancel',
            name: 'CheckCancel',
            component: () => import('@/views/customers/follow-up/check-cancel'),
            meta: { title: '取消查看' },
            hidden: true
          },
          {
            path: 'follow',
            name: 'Follow',
            component: () => import('@/views/customers/follow-up/follow'),
            meta: { title: '访问' },
            hidden: true
          },
          {
            path: 'modification-follow',
            name: 'ModificationFollow',
            component: () => import('@/views/customers/follow-up/modification-follow'),
            meta: { title: '修改随访' },
            hidden: true
          }
        ]
      }
    ]
  },
  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/log-book',
    name: 'Statistics',
    meta: { title: '统计查询', icon: 'el-icon-notebook-2' },
    index: 7,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/statistics/index')
      },
      {
        path: 'log-book',
        name: 'LogBook',
        component: () => import('@/views/statistics/child/log-book'),
        meta: { title: '接诊日志' }
      },
      {
        path: 'charge-statistics',
        name: 'ChargeStatistics',
        component: () => import('@/views/statistics/child/charge-statistics'),
        meta: { title: '收费统计' }
      },
      {
        path: 'diagnosis-statistics',
        name: 'DiagnosisStatistics',
        component: () => import('@/views/statistics/child/diagnosis-statistics'),
        meta: { title: '诊疗项目统计' }
      },
      {
        path: 'drug-statistics',
        name: 'DrugStatistics',
        component: () => import('@/views/statistics/child/drug-statistics'),
        meta: { title: '药品销售统计' }
      },
      {
        path: 'doctor-statistics',
        name: 'DoctorStatistics',
        component: () => import('@/views/statistics/child/doctor-statistics'),
        meta: { title: '医生工作量统计' }
      },
      {
        path: 'doctor-detail',
        name: 'DoctorDetail',
        component: () => import('@/views/statistics/child/doctor-detail'),
        meta: { title: '医生工作详情统计' },
        hidden: true
      }
    ]
  },
  {
    path: '/print',
    name: 'Print',
    component: Layout,
    meta: { title: '病历打印', icon: 'el-icon-printer' },
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/print/index')
      },
      {
        path: 'illness-print',
        name: 'IllnessPrint',
        component: () => import('@/views/print/illness-print'),
        meta: { title: '病历打印' }
      },
      {
        path: 'fee-print-1',
        name: 'FeePrint1',
        component: () => import('@/views/print/fee-print-1'),
        meta: { title: '费用打印1' }
      },
      {
        path: 'fee-print-2',
        name: 'FeePrint2',
        component: () => import('@/views/print/fee-print-2'),
        meta: { title: '费用打印2' }
      },
      {
        path: 'bill-print',
        name: 'BillPrint',
        component: () => import('@/views/print/bill-print'),
        meta: { title: '发票打印' }
      },
      {
        path: 'west-prescription',
        name: 'WestPrescription',
        component: () => import('@/views/print/west-prescription'),
        meta: { title: '西药处方打印' }
      },
      {
        path: 'chinese-prescription',
        name: 'ChinesePrescription',
        component: () => import('@/views/print/chinese-prescription'),
        meta: { title: '中药处方打印' }
      },
      {
        path: 'water-prescription',
        name: 'WaterPrescription',
        component: () => import('@/views/print/water-prescription'),
        meta: { title: '输液处方打印' }
      },
      {
        path: 'treatment-print',
        name: 'TreatmentPrint',
        component: () => import('@/views/print/treatment-print'),
        meta: { title: '检查治疗项打印' }
      }
    ]
  },
  {
    path: '/pay-charges',
    component: Layout,
    name: 'PayCharges',
    redirect: '/pay-charges/pay-charges-list',
    meta: { title: '收费发药', icon: 'el-icon-bank-card' },
    index: 3,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/pay-charges/index')
      },
      {
        path: 'child',
        name: 'Child',
        component: () => import('@/views/pay-charges/child'),
        meta: { title: '收费' },
        children: [
          {
            path: 'pay-charges-list',
            name: 'PayChargesList',
            component: () => import('@/views/pay-charges/child/pay-charges-list'),
            meta: { title: '待收费' }
          },
          {
            path: 'pay-charges-history',
            component: () => import('@/views/pay-charges/child/pay-charges-history'),
            name: 'PayChargesHistory',
            meta: { title: '收费记录' }
          },
          {
            path: 'direct-sell',
            component: () => import('@/views/pay-charges/child/direct-sell'),
            name: 'DirectSell',
            meta: { title: '门诊购药' }
          },
          {
            path: 'pay-detail/:registid',
            component: () => import('@/views/pay-charges/child/pay-detail'),
            name: 'PayDetail',
            meta: { title: '收费详情' },
            hidden: true
          },
          {
            path: 'returns-fee/:chargeid',
            component: () => import('@/views/pay-charges/child/returns-fee'),
            name: 'ReturnsFee',
            meta: { title: '返回收费' },
            hidden: true
          }
        ]
      },
      {
        path: 'dispense',
        name: 'Dispense',
        component: () => import('@/views/pay-charges/dispense'),
        meta: { title: '发药' },
        children: [
          {
            path: 'sell',
            name: 'Sell',
            component: () => import('@/views/pay-charges/dispense/sell'),
            meta: { title: '待发药' }
          },
          {
            path: 'records',
            name: 'Records',
            component: () => import('@/views/pay-charges/dispense/records'),
            meta: { title: '发药记录' }
          },
          {
            path: 'pills',
            name: 'Pills',
            component: () => import('@/views/pay-charges/dispense/pills'),
            meta: { title: '药片' },
            hidden: true
          },
          {
            path: 'return-medical',
            name: 'ReturnMedical',
            component: () => import('@/views/pay-charges/dispense/return-medical'),
            meta: { title: '返回发药' },
            hidden: true
          }
        ]
      }
    ]
  },
  {
    path: '/medicine',
    component: Layout,
    name: 'Medicine',
    redirect: '/medicine/medicine-control/medicine-info',
    meta: { title: '药品库房', icon: 'el-icon-upload' },
    index: 4,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/medicine/index')
      },
      {
        path: 'medicine-info',
        name: 'MedicineInfo',
        component: () => import('@/views/medicine/medicine-control/medicine-info'),
        meta: { title: '药品信息维护' }
      },
      {
        path: 'edit-medicine',
        name: 'EditMedicine',
        component: () => import('@/views/medicine/medicine-control/edit-medicine'),
        meta: { title: '药品信息管理' },
        hidden: true
      },
      {
        path: 'medicine-suppliers',
        name: 'MedicineSuppliers',
        component: () => import('@/views/medicine/medicine-suppliers'),
        meta: { title: '供应商维护' }
      },
      {
        path: 'medicine-purch',
        name: 'MedicinePurch',
        component: () => import('@/views/medicine/medicine-add-store/medicine-purch'),
        meta: { title: '采购入库' }
      },
      {
        path: 'store-reviewed',
        name: 'StoreReviewed',
        component: () => import('@/views/medicine/medicine-add-store/store-reviewed'),
        meta: { title: '入库审核' },
        hidden: true
      },
      {
        path: 'add-store',
        name: 'AddStore',
        component: () => import('@/views/medicine/medicine-add-store/add-store'),
        meta: { title: '添加入库' },
        hidden: true
      },
      {
        path: 'medicine-audit-1',
        name: 'MedicineAudit1',
        component: () => import('@/views/medicine/medicine-add-store/medicine-audit-1'),
        meta: { title: '医药审查-1' },
        hidden: true
      },
      {
        path: 'medicine-audit-2',
        name: 'MedicineAudit2',
        component: () => import('@/views/medicine/medicine-add-store/medicine-audit-2'),
        meta: { title: '医药审查-2' },
        hidden: true
      },
      {
        path: 'medicine-inventory',
        name: 'MedicineInventory',
        component: () => import('@/views/medicine/medicine-inventory'),
        meta: { title: '库存盘点' }
      },
      {
        path: 'new-inventory',
        name: 'NewInventory',
        component: () => import('@/views/medicine/medicine-inventory/new-inventory'),
        meta: { title: '盘点详情' },
        hidden: true
      },
      {
        path: 'seen-inventory',
        name: 'SeenInventory',
        component: () => import('@/views/medicine/medicine-inventory/seen-inventory'),
        meta: { title: '查看盘点' },
        hidden: true
      },
      {
        path: 'medicine-query',
        name: 'MedicineQuery',
        component: () => import('@/views/medicine/medicine-query'),
        meta: { title: '库存查询' }
      },
      {
        path: 'medicine-effective',
        name: 'MedicineEffective',
        component: () => import('@/views/medicine/medicine-effective'),
        meta: { title: '药品预警' }
      },
      {
        path: 'medicine-diary',
        name: 'MedicineDiary',
        component: () => import('@/views/medicine/medicine-diary'),
        meta: { title: '药品日记' },
        hidden: true
      },
      {
        path: 'medicine-price',
        name: 'MedicinePrice',
        component: () => import('@/views/medicine/medicine-price'),
        meta: { title: '药品价格' },
        hidden: true
      },
      {
        path: 'medicine-warning',
        name: 'MedicineWarning',
        component: () => import('@/views/medicine/medicine-warning'),
        meta: { title: '药品预警' },
        hidden: true
      }
    ]
  },
  {
    path: '/module',
    component: Layout,
    name: 'Module',
    redirect: '/module/medical-records',
    meta: { title: '模板管理', icon: 'el-icon-menu' },
    index: 5,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/module/index')
      },
      {
        path: 'medical-records',
        name: 'MedicalRecords',
        component: () => import('@/views/module/medical-records'),
        meta: { title: '病历模板' }
      },
      {
        path: 'new-medical-records/:tplId',
        name: 'NewMedicalRecords',
        component: () => import('@/views/module/medical-records/new-medical-records'),
        meta: { title: '病历模板详情' },
        hidden: true
      },
      {
        path: 'western-formulation',
        name: 'WesternFormulation',
        component: () => import('@/views/module/western-formulation'),
        meta: { title: '西/成药处方模板' }
      },
      {
        path: 'new-western-formulation/:tplId',
        name: 'NewWesternFormulation',
        component: () => import('@/views/module/western-formulation/new-western-formulation'),
        meta: { title: '西/成药处方模板详情' },
        hidden: true
      },
      {
        path: 'chinese-formulation',
        name: 'ChineseFormulation',
        component: () => import('@/views/module/chinese-formulation'),
        meta: { title: '中药处方模板' }
      },
      {
        path: 'new-chinese-formulation/:tplId',
        name: 'NewChineseFormulation',
        component: () => import('@/views/module/chinese-formulation/new-chinese-formulation'),
        meta: { title: '中药处方模板详情' },
        hidden: true
      },
      {
        path: 'infusion-formulation',
        name: 'InfusionFormulation',
        component: () => import('@/views/module/infusion-formulation'),
        meta: { title: '输液处方模板' }
      },
      {
        path: 'new-infusion-formulation/:tplId',
        name: 'NewInfusionFormulation',
        component: () => import('@/views/module/infusion-formulation/new-infusion-formulation'),
        meta: { title: '输液处方模板详情' },
        hidden: true
      },
      {
        path: 'inspection-check',
        name: 'InspectionCheck',
        component: () => import('@/views/module/inspection-check'),
        meta: { title: '诊疗项目模板' }
      },
      {
        path: 'new-inspection-check/:tplId',
        name: 'NewInspectionCheck',
        component: () => import('@/views/module/inspection-check/new-inspection-check'),
        meta: { title: '诊疗项目模板详情' },
        hidden: true
      },
      {
        path: 'material-combination',
        name: 'MaterialCombination',
        component: () => import('@/views/module/material-combination'),
        meta: { title: '耗材组合模板' }
      },
      {
        path: 'new-material-combination/:tplId',
        name: 'NewMaterialCombination',
        component: () => import('@/views/module/material-combination/new-material-combination'),
        meta: { title: '耗材组合模板详情' },
        hidden: true
      },
      {
        path: 'other-objects',
        name: 'OtherObjects',
        component: () => import('@/views/module/other-objects'),
        meta: { title: '其它项目模板' }
      },
      {
        path: 'new-other-objects/:tplId',
        name: 'NewOtherObjects',
        component: () => import('@/views/module/other-objects/new-other-objects'),
        meta: { title: '其它项目模板详情' },
        hidden: true
      },
      {
        path: 'used-advice',
        name: 'UsedAdvice',
        component: () => import('@/views/module/used-advice'),
        meta: { title: '医嘱模板' }
      },
      {
        path: 'new-used-advice/:tplId',
        name: 'NewUsedAdvice',
        component: () => import('@/views/module/used-advice/new-used-advice'),
        meta: { title: '医嘱模板详情' },
        hidden: true
      },
    ]
  },
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/regist-info',
    name: 'Setting',
    meta: { title: '诊所管理', icon: 'el-icon-setting' },
    index: 8,
    needAuth: true,  
    children: [
      {
        path: 'index',
        component: () => import('@/views/setting/index')
      },
      {
        path: 'regist-info',
        name: 'RegistInfo',
        meta: { title: '注册信息' },
        component: () => import('@/views/setting/regist-info/index')
      },
      {
        path: 'section-manage',
        name: 'SectionManage',
        meta: { title: '科室管理' },
        component: () => import('@/views/setting/section-manage/index')
      },
      {
        path: 'staff-manage',
        name: 'StaffManage',
        meta: { title: '人员管理' },
        component: () => import('@/views/setting/staff-manage/index')
      },
      {
        path: 'charge-items',
        name: 'ChargeItems',
        meta: { title: '收费项目' },
        component: () => import('@/views/setting/charge-items'),
        children: [
          {
            path: 'index',
            component: () => import('@/views/setting/charge-items/index')
          },
          {
            path: 'diagnosis-fee',
            name: 'DiagnosisFee',
            component: () => import('@/views/setting/charge-items/diagnosis-fee'),
            meta: { title: '诊金设置' }
          },
          {
            path: 'treatment',
            name: 'Treatment',
            component: () => import('@/views/setting/charge-items/treatment'),
            meta: { title: '诊疗项目' }
          },
          {
            path: 'material',
            name: 'Material',
            component: () => import('@/views/setting/charge-items/material'),
            meta: { title: '耗材设置' }
          },
          {
            path: 'others',
            name: 'Others',
            component: () => import('@/views/setting/charge-items/others'),
            meta: { title: '其它收费项' }
          }
        ]
      },
      {
        path: 'bind',
        name: 'Bind',
        component: () => import('@/views/setting/bind/truss'),
        meta: { title: '医保管理' },
        children: [
          {
            path: 'index',
            component: () => import('@/views/setting/bind/truss/index')
          },
          {
            path: 'bind-medical',
            name: 'BindMedical',
            component: () => import('@/views/setting/bind/truss/bind-medical'),
            meta: { title: '医保绑定' }
          },
          {
            path: 'all-accounts',
            name: 'AllAccounts',
            component: () => import('@/views/setting/bind/accounts/all-accounts'),
            meta: { title: '对账管理' }
          },
          {
            path: 'accounts-detail',
            name: 'AccountsDetail',
            component: () => import('@/views/setting/bind/accounts/accounts-detail'),
            meta: { title: '账目详情' },
            hidden: true
          },
          {
            path: 'day-accounts/:date',
            name: 'DayAccounts',
            component: () => import('@/views/setting/bind/accounts/day-accounts'),
            meta: { title: '日对账' },
            hidden: true
          },
          {
            path: 'drug-check-in',
            name: 'DrugCheckIn',
            component: () => import('@/views/setting/bind/drug/drug-check-in'),
            meta: { title: '药品准入管理' },
          },
          {
            path: 'drug-apply',
            name: 'DrugApply',
            component: () => import('@/views/setting/bind/drug/drug-apply'),
            meta: { title: '药品应用' },
            hidden: true
          },
          {
            path: 'project-check-in',
            name: 'ProjectCheckIn',
            component: () => import('@/views/setting/bind/project/project-check-in'),
            meta: { title: '诊疗项目准入管理' },
          },
          {
            path: 'project-apply',
            name: 'ProjectApply',
            component: () => import('@/views/setting/bind/project/project-apply'),
            meta: { title: '诊疗项目应用' },
            hidden: true
          },
          {
            path: 'material-check-in',
            name: 'MaterialCheckIn',
            component: () => import('@/views/setting/bind/material/material-check-in'),
            meta: { title: '耗材准入管理' },
          },
          {
            path: 'material-apply',
            name: 'MaterialApply',
            component: () => import('@/views/setting/bind/material/material-apply'),
            meta: { title: '耗材应用' },
            hidden: true
          },
        ]
      },
      {
        path: 'patients-list',
        name: 'PatientsList',
        meta: { title: '患者列表' },
        component: () => import('@/views/setting/patients-list/index'),
        hidden: true               
      },
      {
        path: 'print-setting',
        name: 'PrintSetting',
        meta: { title: '打印设置' },
        component: () => import('@/views/setting/print-setting/index'),
        hidden: true 
      },
      {
        path: 'registration-fee',
        name: 'RegistrationFee',
        meta: { title: '登记费用' },
        component: () => import('@/views/setting/registration-fee/index'),
        hidden: true
      },
      {
        path: 'short-message',
        name: 'ShortMessage',
        meta: { title: '短信' },
        component: () => import('@/views/setting/short-message/index'),
        hidden: true
      },
      {
        path: 'system-settings',
        name: 'SystemSettings',
        meta: { title: '系统设置' },
        component: () => import('@/views/setting/system-settings/index'),
        hidden: true
      }
    ]
  },
  {
    path: '/message',
    component: Layout,
    redirect: '/message/unread-message',
    name: 'Message',
    meta: { title: '消息管理', icon: 'el-icon-bell' },
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/message/index')
      },
      {
        path: 'all-message',
        name: 'AllMessage',
        component: () => import('@/views/message/all-message'),
        meta: { title: '所有消息' }
      },
      {
        path: 'important-message',
        name: 'ImportantMessage',
        component: () => import('@/views/message/important-message'),
        meta: { title: '重要消息' }
      },
      {
        path: 'unread-message',
        name: 'UnreadMessage',
        component: () => import('@/views/message/unread-message'),
        meta: { title: '未读消息' }
      }
    ]
  },
  {
    path: '/help',
    component: Layout,
    redirect: '/help/management-help',
    name: 'Help',
    meta: { title: '帮助', icon: 'el-icon-question' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/help/index')
      },
      {
        path: 'management-help',
        name: 'ManagementHelp',
        component: () => import('@/views/help/management-help'),
        meta: { title: '管理帮助' }
      },
      {
        path: 'fee-help',
        name: 'FeeHelp',
        component: () => import('@/views/help/fee-help'),
        meta: { title: '费用帮助' }
      },
      {
        path: 'medical-help',
        name: 'MedicalHelp',
        component: () => import('@/views/help/medical-help'),
        meta: { title: '医学帮助' }
      },
      {
        path: 'pharmacy-help',
        name: 'PharmacyHelp',
        component: () => import('@/views/help/pharmacy-help'),
        meta: { title: '药房帮助' }
      },
      {
        path: 'print-help',
        name: 'PrintHelp',
        component: () => import('@/views/help/print-help'),
        meta: { title: '打印帮助' }
      },
      {
        path: 'regist-help',
        name: 'RegistHelp',
        component: () => import('@/views/help/regist-help'),
        meta: { title: '挂号帮助' }
      },
      {
        path: 'station-help',
        name: 'StationHelp',
        component: () => import('@/views/help/station-help'),
        meta: { title: '医生站帮助' }
      },
      {
        path: 'template-help',
        name: 'TemplateHelp',
        component: () => import('@/views/help/template-help'),
        meta: { title: '模板帮助' }
      }
    ]
  },
  {  // 404页必须放到末尾 !!!
    path: '*', 
    redirect: '/404', 
    hidden: true 
  }
]

const createRouter = () => new Router({
  mode: 'history',  // 需要服务支持
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher  // 重置路由
}

export default router
