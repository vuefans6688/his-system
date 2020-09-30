import store from '@/store'

export function getSheBaoHead() {
  const obj = { ...store.getters.shebao }
  delete (obj.zhihuiybtoken)
  return obj
}
