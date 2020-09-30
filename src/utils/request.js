import axios from 'axios'
import Vue from 'vue'
import { MessageBox, Message } from 'element-ui'
import { getToken } from '@/serve/token'
import { getClinicId } from '@/serve/clinic-id'
import { getSheBaoHead } from '@/serve/she-bao-head'

let baseURL = ''  // 基本路径

// 请求拦截器
axios.interceptors.request.use(config => {  
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(response => {  
  return response
}, error => {
  return Promise.resolve(error.response)
})

const service = (config, data = {}) => {
  const publicData = {  // 公共数据结构
    head: {
      accessToken: config.needToken ? getToken() : '',
      lastnotice: 0,
      msgid: ''
    },
    body: config.data || {}
  }
  if (config.clinicid) {
    Vue.set(publicData.body, config.clinicid, getClinicId())
  }
  if (config.needSheBaoHead) {
    Object.assign(publicData.body, getSheBaoHead())
  } else {
    Object.assign(publicData.body, data)
  }
  const httpConfig = {  // http请求的默认配置对象
    method: config.method || 'post',
    baseURL: config.baseURL ? config.baseURL : baseURL,
    url: config.url,
    data: publicData
  }
  return new Promise((resolve, reject) => {
    axios(httpConfig).then(response => {
      const res = response.data
      if (res.errcode === 0) {  // his接口       
        if (!config.baseURL) {
          resolve(res.data)
        } else if (res.data.transReturnCode === '00000000' || res.data.success) {  // 客户端接口请求成功
          resolve(res.data)
        } else {  // 客户端接口请求失败
          resolve(`ERRORCODE: ${res.data.transReturnCode}`)
          MessageBox.alert(res.data.transReturnMessage, '错误提示', {
            confirmButtonText: '确定',
            callback: () => {}
          })
        }
      } else {  // 错误码处理
        resolve(`ERRORCODE: ${res.errcode}`)
        if ((response.config.url === '/service/drug/createstockcheck' && res.errcode === -1) || res.errcode === 24) {
          return
        }
        if (response.config.url === '/service/medical/info' || response.config.url === '/sysmng/conn') {
          return
        }
        if (res.errcode === 42) {
          MessageBox.alert(res.errmsg, '错误提示', {
            confirmButtonText: '确定',
            callback: () => {}
          })
          return
        }
        Message({ message: res.errmsg, type: 'error', showClose: true, duration: 1500 })
      }
    }).catch(error => {
      reject(error)
    })
  })
}

export default service
