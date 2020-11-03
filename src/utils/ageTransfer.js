// 计算当前月天数
export function getCurrentMonthDays(month, year) {
  let transDays = 30
  const largeMonth = [1, 3, 5, 7, 8, 10, 12]
  if (largeMonth.includes(month)) {
    transDays = 31
  } else if (month === 2) {
    transDays = year % 2 === 0 && year % 100 !== 0 || year % 400 === 0 ? 29 : 28
  }
  return transDays
}

export function calculateFromBirth(birthdate) {
  if (!birthdate) {
    return ''
  }
  const birthArr = birthdate.split('-')
  const year = parseInt(birthArr[0], 10)
  const month = parseInt(birthArr[1], 10)
  const day = parseInt(birthArr[2], 10)
  let ageYear = new Date().getFullYear() - year
  let ageMonth = new Date().getMonth() + 1 - month
  let ageDay = new Date().getDate() - day
  // 获取当前月天数
  const currentMonthDays = getCurrentMonthDays(month, year)
  if (ageDay < 0) {
    ageMonth -= 1
    ageDay = currentMonthDays + ageDay
  }
  if (ageMonth < 0) {
    ageYear -= 1
    ageMonth = 12 + ageMonth
  }
  if (ageYear > 0) {
    return `${ageYear}岁`
  } else if (ageMonth > 0) {
    return `${ageMonth}月`
  }
  return `${ageDay}天`
}



