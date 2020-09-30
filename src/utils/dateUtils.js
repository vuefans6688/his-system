const MILLI_SECONDS = 60 * 60 * 24 * 1000  // 一天的毫秒数
export function plusDays(dates, days) {
  const targetDate = new Date()
  const timestamp = dates.getTime()
  const targetTime = timestamp + (days * MILLI_SECONDS)
  return targetDate.setTime(targetTime)
}

// 对Date的扩展，将Date转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// new Date().format("yyyy-MM-dd hh:mm:ss.S")  ==> 2006-07-02 08:09:04.423
// new Date().format("yyyy-M-d h:m:s.S")       ==> 2006-7-2 8:9:4.18
export function format(date, pattern) {
  const o = {
    'M+': date.getMonth() + 1,               // 月份
    'd+': date.getDate(),                    // 日
    'h+': date.getHours(),                   // 小时
    'm+': date.getMinutes(),                 // 分
    's+': date.getSeconds(),                 // 秒
    'S+': date.getMilliseconds(),            // 毫秒
    'q+': Math.floor((date.getMonth() + 3) / 3)  // 季度
  }
  if (/(y+)/.test(pattern)) { 
    const year = date.getFullYear()
    pattern = pattern.replace(RegExp.$1, (`${year}`).substr(4 - RegExp.$1.length))
  }
  Object.keys(o).forEach(key => {
    if (new RegExp(`(${key})`).test(pattern)) {
      if (key === 'S+') {
        const start = `00${o[key]}`.length - 3
        pattern = pattern.replace(RegExp.$1, `00${o[key]}`.substr(start, RegExp.$1.length))
      } else {
        pattern = pattern.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[key]) : ((`00${o[key]}`).substr((`${o[key]}`).length)))
      }
    }
  })
  return pattern
}

export function dateToTimestamp(date) {
  return date.getTime() / 1000
}

export function timestampFormat(timeStamp, pattern) {
  const date = new Date(timeStamp)
  return format(date, pattern)
}

export default {
  plusDays,
  format,
  dateToTimestamp,
  timestampFormat
}
