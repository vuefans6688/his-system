// 计算当前月份的天数
export function getCurrentMonthDays(month, year) {
  let transDays = 30
  let largeMonth = [1, 3, 5, 7, 8, 10, 12]
  if (largeMonth.includes(month)) {
    transDays = 31
  } else if (month === 2) {
    transDays = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? 29 : 28
  }
  return transDays
}

export function calculateFromBirth(birthDate) {
  if (!birthDate) {
    return ''
  }
  // const birthArray = birthDate.split('-')
  // const birthYear = parseInt(birthArray[0], 10)
  // const birthMonth = parseInt(birthArray[1], 10)
  // const birthDay = parseInt(birthArray[2], 10)
  const birthYear = birthDate.substr(0, 4)
  const birthMonth = birthDate.substr(5, 2)
  const birthDay = birthDate.substr(8, 2)
  const nowYear = new Date().getFullYear() - birthYear
  const nowMonth = new Date().getMonth() + 1 - birthMonth
  const nowDay = new Date().getDate() - birthDay
  // 获取当前月天数
  const currentDay = getCurrentMonthDays(birthMonth, birthYear)
  if (nowDay < 0) {
    nowMonth -= 1
    nowDay += currentDay
  }
  if (nowMonth < 0) {
    nowYear -= 1
    nowMonth += 12
  }
  if (nowYear > 0) {
    return `${nowYear}岁`
  } else if (nowMonth > 0) {
    return `${nowMonth}月`
  }
  return `${nowDay}天`
}











