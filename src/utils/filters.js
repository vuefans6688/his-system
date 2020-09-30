import * as dateUtils from './dateUtils'

export function statusFilter(status) {
  return status === 0 ? '可用' : '不可用'
}

export function sexFilter(status) {
  return status === 1 ? '男' : status === 2 ? '女' : '-'
}

export function priceFilter(price) {
  price = parseFloat(price)
  return isNaN(price) ? '' : price.toFixed(2)
}

export function undefineFilter(str) {
  return str !== '' ? str : '-'
}

export function ageFilter(birthday) {
  birthday = +new Date(birthday)
  return ~~((Date.now() - birthday) / 31557600000)
}

export function dateFilter(timestamp, parttern = 'yyyy-MM-dd') {
  if (!timestamp) {
    return ''
  }
  if (typeof timestamp === 'object') {
    return timestamp.format('yyyy-MM-dd')
  }
  const formatTime = parseInt(timestamp, 10)
  if (isNaN(formatTime)) {
    return ''
  }
  const dayTime = new Date(formatTime)
  return dateUtils.format(dayTime, parttern)
}

export function unixTimeFilter(timestamp, parttern) {
  const formatTime = parseInt(timestamp, 10)
  if (isNaN(formatTime)) {
    return ''
  }
  return dateFilter(formatTime * 1000, parttern)
}

// 数字末尾补零
export function paddingEndZero(value, len) {
  // 避免出现.00的情况
  if (value || value === 0) {
    let newValue = value + ''
    if (newValue.indexOf('.') < 0) {
      newValue += '.'
    }
    for (let i = 0; i < len; i++) {
      newValue += '0'
    }
    let index = newValue.indexOf('.')
    return newValue.substr(0, index + len + 1)
  }
}
