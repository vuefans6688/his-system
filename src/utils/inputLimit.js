// 控制只能输入正整数
export function intLimit(value, boundary = 0) {      
  value = value.toString()
  const validates = [
    ['^0(\\d+)$', '$1'],  // 禁止录入整数部分两位以上，但首位必须为0
    ['[^\\d]+', '']  // 禁止录入任何非数字
  ]
  validates.forEach(item => {
    const matches = new RegExp(item[0])
    value = value.replace(matches, item[1])
  })
  if (boundary) {
    return parseInt(value, 10) > boundary ? boundary.toString() : value
  }
  return value
}

// 控制小数输入并限制位数
export function floatLimit(value, bit) { 
  value = value.toString()
  const validates = [
    ['^0(\\d+)$', '$1'],  // 禁止录入整数部分两位以上，但首位必须为0
    ['[^\\d\\.]+', ''],  // 禁止录入任何非数字和点
    ['\\.(\\d?)\\.+', '.$1'],  // 禁止录入两个以上的点
    [`^(\\d+\\.\\d{${bit}}).+`, '$1']  // 禁止录入小数点后n位以上
  ]
  validates.forEach(item => {
    const matches = new RegExp(item[0])
    value = value.replace(matches, item[1])
  })
  return value
}

