const QQMapWX = require("../../../libs/qqmap-wx-jssdk.min.js")
var config = require('../../../libs/config.js');
var key = config.tencentConfig.key;
var qqwxmap = new QQMapWX({
  key: key // 必填，这里最好填自己申请的的
});
Page({

  data: {
    radioValues: [
      { value: '商家送货上门', selected: true },
      { value: '用户自取' }
    ],
    counts: 1,
    params: '',
    money:12, // 拼团价
    paymoney: 12 ,// 支付价
    lng: '',
    lat: ''
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      params: options.params,
    })

  },
  radioChange: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var arr = this.data.radioValues;
    for (var id in arr) {
      if (id == index) {
        arr[id].selected = true;
      } else {
        arr[id].selected = false;
      }
    }
    this.setData({
      radioValues: arr
    })
  },
  // 点击跳转收货地址
  toAddrel: function () {
    var that = this;
    wx.chooseAddress({
      success(res) {
        that.setData({
          userName: res.userName,
          telNumber: res.telNumber,
          address: res.provinceName + res.cityName + res.countyName + res.detailInfo
        })
        that.atuoGetLocation();
      }
    })
  },
  atuoGetLocation: function () {
    var that = this;
    qqwxmap.geocoder({
      address: that.data.address,  
      complete: res => {
        that.setData({
          lng: res.result.location.lng,
          lat: res.result.location.lat
        })
      },
      fail: res => {
        wx.showToast({
          title: '无法定位到该地址，请确认地址信息',
        })
      }
    })
  },
  // 数量+1
  addcount: function () {
    var that = this;
    that.setData({
      counts: that.data.counts + 1,
    })
    that.setData({
      paymoney: that.data.money * that.data.counts
    })
  },
  // 数量-1
  minuscount: function () {
    var that = this;
    if (that.data.counts > 1) {
      that.setData({
        counts: that.data.counts - 1,
      })
      that.setData({
        paymoney: that.data.money * that.data.counts
      })
    }
  },
  // 支付
  toPay: function(){
    wx.showToast({
      title: '支付成功',
    })
  }
})