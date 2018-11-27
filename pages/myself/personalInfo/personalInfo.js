//index.js
//获取应用实例
const app = getApp();
Page({
  data: {
    WXisShow: true,
    telNum: 0,
    PlaceisShow: true,
    placeNum: 0,
    mySex: '未知', // 本人性别
    myName: '', // 本人姓名
    myOpenid: '', // 本人openid
    myInfo: [] // 个人信息
  },
  onShow: function () {
    var that = this;
    that.setData({
      myOpenid: wx.getStorageSync('openid')
    })
    that.getMyInfo();
  },

  // 获取个人信息
  getMyInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.Api + "/user/getUserInfo",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.myOpenid
      },
      success: function (res) {
        that.setData({
          myName: res.data.data[0].nickname,
          myInfo: res.data.data[0]
        });
        if (that.data.myInfo.sex==0){
          that.setData({
            mySex:'女'
          })
        }else{
          that.setData({
            mySex: '男'
          })
        }
      }
    });
  }
})
