// 计算当前月天数
export function getCurrentMonthDays(month, year) {
  let currentMonthDays = 30
  const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12]
  if (monthsWith31Days.indexOf(month) > -1) {
    currentMonthDays = 31
  } else if (month === 2) {
    currentMonthDays = year % 4 === 0 ? 29 : 28
  }
  return currentMonthDays
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
  const curMonthDays = getCurrentMonthDays(month, year)
  if (ageDay < 0) {
    ageMonth -= 1
    ageDay = curMonthDays + ageDay
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



