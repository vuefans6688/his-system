import { dateFilter } from '@/utils/filters'

// 将日期yyyy-MM-dd转化成日期对象(支持8位、14位) 
export function dateChange(value) {
  value += ''
  let date = ''
  if (value.length === 8) {
    date = value.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
  } else if (value.length === 14) {
    date = value.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3 $4:$5:$6')
  } else {
    return dateFilter(new Date())
  }
  return date
}


