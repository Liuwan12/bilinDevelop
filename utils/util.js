const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function changeTime(data){
  let da = new Date(data).getTime();
  let date1= new Date(da);
  let month = date1.getMonth() + 1 + '月';
  let date = date1.getDate() + '日';
  let hour = date1.getHours()
  let minute = date1.getMinutes()
  if (minute<10){
    minute = "0" + minute
  }
  return [month, date].join('') + " " + hour + ":" + minute
}
module.exports = {
  formatTime: formatTime,
  changeTime: changeTime
}
