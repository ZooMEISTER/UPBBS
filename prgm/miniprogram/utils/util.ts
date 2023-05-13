export const formatTime = (date: Date, timeType:string) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  if(timeType == "FullTime"){
    return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
    )
  }
  else if(timeType == "OnlyDate"){
    return (
      [year, month, day].map(formatNumber).join('-')
    )
  }
  else{
    return (
      [year, month, day].map(formatNumber).join('-') +
      ' ' +
      [hour, minute, second].map(formatNumber).join(':')
      )
  }
  
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}
