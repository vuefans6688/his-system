import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { md5 } from '@/utils/md5'
import { get, set, remove } from '../storage'

const state = {
  token: get('token') || getToken(),
  user: get('user') || '',
  name: '' || '超级管理员',
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  clinic: get('clinic') || '',
  shebao: get('shebao') || {},
  customerId: get('customerId') || '',
  printMessage: get('printMessage') || '',
  purchRecode: get('purchRecode') || '',
  feeList: get('feeList') || [],
  printSetting: get('printSetting') || '',
  seriesCode: ''
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      set('token', token)  
    } else {
      remove('token')   
    }
  },
  SET_NAME(state, name) {
    state.name = name
  },
  SET_AVATAR(state, avatar) {
    state.avatar = avatar
  },
  SET_CLINIC(state, clinic) {
    state.clinic = clinic
    if (clinic) {
      set('clinic', clinic)  
    } else {
      remove('clinic')   
    }
  },
  SET_USER(state, user) {
    state.user = user
    if (user) {
      set('user', user)  
    } else {
      remove('user')   
    }
  },
  SET_SHE_BAO(state, shebao) {
    state.shebao = shebao
    if (shebao) {
      set('shebao', shebao)  
    } else {
      remove('shebao')   
    }
  },
  SET_CUSTOMER_ID(state, customerId) {
    state.customerId = customerId
    if (customerId) {
      set('customerId', customerId)
    } else {
      state.clinicStatus = ''
      remove('customerId')
    }
  },
  SET_PRINT_MESSAGE(state, printMessage) {
    state.printMessage = printMessage
    set('printMessage', printMessage)
  },
  SET_PURCH_RECODE(state, purchRecode) {
    state.purchRecode = purchRecode
    if (purchRecode) {
      set('purchRecode', purchRecode)  
    } else {
      remove('purchRecode')   
    }
  },
  SET_FEE_PRINT(state, feeList) {
    state.feeList = feeList
    set('feeList', feeList)
  },
  SET_PRINT_SETTING(state, printSetting) {
    state.printSetting = printSetting
    set('printSetting', printSetting)
  },
  SET_SERIES_CODE(state, seriesCode) {
    state.seriesCode = seriesCode
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: md5(password) }).then(res => {
        set('token', res.accessToken)
        set('user', res)  // 将JSON对象转化为JSON字符串
        commit('SET_TOKEN', res.accessToken)
        commit('SET_USER', res)
        setToken(res.accessToken)
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  },
  // 获取用户信息
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo().then(res => {
        commit('SET_TOKEN', res.accessToken)
        commit('SET_CLINIC', res.clinic_id)
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },
  // 用户退出
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit('SET_TOKEN', '')
        commit('SET_CLINIC', '')
        commit('SET_USER', '')
        removeToken()  // 必须先移除token
        resetRouter()
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  },
  // 移除令牌
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken()  // 必须先移除token
      commit('SET_TOKEN', '')  // 将token设置为空
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

