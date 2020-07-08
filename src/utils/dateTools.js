export function dateStringToYearString (dataString) {
    return dataString.slice(0, 4)
}

export function dateStringToMonthString (dataString) {
    return dataString.slice(5, 7)
}

export function formatDate(dataString, long) {
    const date = new Date(dataString)
    if(long) {
      return `${date.getFullYear()}年${padZero(date.getMonth()+1)}月${padZero(date.getDate())}日 ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
    }else {
      return `${date.getFullYear()}年${padZero(date.getMonth()+1)}月${padZero(date.getDate())}日`
    }
  }

  function padZero(num) {
    if(num>9) {
      return num
    } else {
      return '0'+num
    }
  }