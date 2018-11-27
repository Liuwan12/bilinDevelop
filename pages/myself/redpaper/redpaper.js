const app = getApp();
const api = require('../../../utils/util.js')
const wxreq = require('../../../utils/wxRequest.js');
Page({

  data: {
    openid: '',
    GrabList: []
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      openid: wx.getStorageSync('openid')
    })
    that.getRedpacketById();
  },
  // 个人页面
  toHisInfo: function (e) {
    var that = this;
    var id = e.currentTarget.id;
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.GrabList[id].giveRedUser.openId
      });
  },
  getRedpacketById: function(){
    var that = this;
    var url = app.globalData.Api + '/red/getRedGrabpacketByUserId';
    var data= {
      openid: that.data.openid,
      pageNum: 1,
      pageSize: 10
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        for (var i = 0; i < res.data.data.redGrabpackets.length; i++) {
          res.data.data.redGrabpackets[i].grabdate = api.changeTime(res.data.data.redGrabpackets[i].grabdate);
          if (res.data.data.redGrabpackets[i].giveRedUser.sex == 1) {
            res.data.data.redGrabpackets[i].giveRedUser.sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
          } else if (res.data.data.redGrabpackets[i].giveRedUser.sex == 0) {
            res.data.data.redGrabpackets[i].giveRedUser.sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
          }
          res.data.data.redGrabpackets[i].money = that.getFloatStr(res.data.data.redGrabpackets[i].money);
        }
        that.setData({
          GrabList: res.data.data.redGrabpackets
        })
      }
    })
  },
  
  getFloatStr :function (num) {
    num += '';
    // num = num.replace(/[^0-9|\.]/g, ''); //清除字符串中的非数字非.字符
    if (/^0+/) //清除字符串开头的0  
      num = num.replace(/^0+/, '');
    if (!/\./.test(num)) //为整数字符串在末尾添加.00  
    {
      num += '.00';
    }
    if (/^\./.test(num)) {//字符以.开头时,在开头添加0  
      num = '0' + num;
      num += '00';        //在字符串末尾补零  
      num = num.match(/\d+\.\d{2}/)[0]; 
    } 
    return num;
  }
})