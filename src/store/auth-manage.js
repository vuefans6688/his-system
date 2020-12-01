export const permissionList = [  // 权限列表
  { index: 1, name: '登记挂号', path: '/registration', weight: 1 },
  { index: 2, name: '医生站', path: '/doctor-station', weight: 1 * 2 * 2 },
  { index: 3, name: '收费发药', path: '/pay-charges', weight: (1 * 2 * 2 * 2) + (1 * 2) + (1 * 2 * 2 * 2 * 2) },
  { index: 4, name: '药品库房', path: '/medicine', weight: 1 * 2 * 2 * 2 * 2 * 2 },
  { index: 5, name: '模板管理', path: '/module', weight: 1 * 2 * 2 * 2 * 2 * 2 * 2 },
  { index: 6, name: '客户管理', path: '/customers', weight: (1 * 2 * 2 * 2 * 2 * 2 * 2 * 2) + (1 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2) },
  { index: 7, name: '统计查询', path: '/statistics', weight: 1 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 },
  { index: 8, name: '诊所管理', path: '/setting', weight: 1 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 }
]
