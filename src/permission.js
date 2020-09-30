import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'  // 进度条
import 'nprogress/nprogress.css'  // 进度条样式
// import { getToken } from '@/utils/auth'  // 从cookie中获取token
import { getToken } from '@/serve/token'  
import getPageTitle from '@/utils/get-page-title'


NProgress.configure({ showSpinner: false })  // 进度条配置对象

const whiteList = ['/login']  // 无重定向白名单

router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()
  // 设置页面标题
  document.title = getPageTitle(to.meta.title)
  // 确认用户是否已登录
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，则重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.user
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // 获取用户信息
          await store.dispatch('user/getInfo')
          next()
        } catch (error) {
          // 重新登录并删除token
          await store.dispatch('user/resetToken')
          Message.error(error || '有错误')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 没有token 
    if (whiteList.includes(to.path)) {
      // 在免费登录白名单中，直接进入
      next()
    } else {
      // 其他没有访问权限的页面将被重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 结束进度条
  NProgress.done()
})
