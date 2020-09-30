import request from '@/utils/request'


export function login(data) {
  return request({
    url: '/service/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/service/clinic/info',
    method: 'get',
    needToken: true,
    clinicid: clinic_id
  })
}

export function logout() {
  return request({
    url: '/service/user/logout',
    method: 'post',
    needToken: true
  })
}

