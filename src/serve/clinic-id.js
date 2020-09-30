import store from '@/store'

export function getClinicId() {
  return store.getters.clinic
}
