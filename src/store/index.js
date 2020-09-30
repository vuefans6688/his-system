import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import tagsView from './modules/tagsView'
import { customerType, customerSource } from '@/common/customer'
import { nationList } from '@/common/nation'
import { marriageStatus } from '@/common/marriage'
import { frequencyList } from '@/common/frequencyList'
import { usageList } from '@/common/usageList'
import { chinaUsage } from '@/common/chinaUsage'
import { doseUnitList } from '@/common/doseUnitList'
import { permissionList } from './auth-manage'

const state = {
  customerType,
  customerSource,
  nationList,
  marriageStatus,
  frequencyList,
  usageList,
  chinaUsage,
  doseUnitList,
  permissionList
}

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    tagsView
  },
  getters,
  state
})

export default store
