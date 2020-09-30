export function paddingZero(date) {
  return date < 10 ? `0${date}` : date
}