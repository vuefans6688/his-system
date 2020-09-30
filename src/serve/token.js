import store from '@/store'

export function getToken() {
  return store.getters.token
}