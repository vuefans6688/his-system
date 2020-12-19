import axios from 'axios'
import Vue from 'vue'
import { MessageBox, Message } from 'element-ui'
import { getToken } from '@/serve/token'
import { getClinicId } from '@/serve/clinic-id'
import { getSheBaoHead } from '@/serve/she-bao-head'

// 基本路径
// let baseURL = ''  

// 请求拦截器
axios.interceptors.request.use(
  config => config, 
  error => Promise.reject(error)
)

// 响应拦截器
axios.interceptors.response.use(
  response => response, 
  error => Promise.resolve(error.response)
)

function service(config, data = {}) {
  // 公共数据结构
  const publicData = {  
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
  // http请求的默认配置对象
  const httpConfig = {  
    method: config.method || 'post',
    // baseURL: config.baseURL ? config.baseURL : baseURL,
    url: config.url,
    data: publicData
  }
  return new Promise((resolve, reject) => {
    axios(httpConfig).then(response => {
      const res = response.data
      // his接口
      if (res.errcode === 0) {         
        if (!config.baseURL) {
          resolve(res.data)
          // 客户端接口请求成功
        } else if (res.data.transReturnCode === '00000000' || res.data.success) {  
          resolve(res.data)
          // 客户端接口请求失败
        } else {  
          resolve(`错误码: ${res.data.transReturnCode}`)
          MessageBox.alert(res.data.transReturnMessage, '错误提示', {
            confirmButtonText: '确定',
            callback: () => {}
          })
        }
      // 错误码处理
      } else {  
        resolve(`错误码: ${res.errcode}`)
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
