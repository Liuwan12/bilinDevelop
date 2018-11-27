const QQMapWX =require("../../../libs/qqmap-wx-jssdk.min.js")
var config = require('../../../libs/config.js');
var key = config.tencentConfig.key;
var qqwxmap;
qqwxmap = new QQMapWX({
  key: key // 必填，这里最好填自己申请的的
});
Page({
  data: {
    isChecked: true,
    plateQQName: '',
    recipiName: '', // 收件人
    relaphone: '', // 联系电话
    spechouse: '', // 具体门牌号
    editor: false
  },
  onLoad: function (options) {
  },
  // 开关
  changeSwitch: function(){
    var that = this;
    that.setData({
      isChecked: !that.data.isChecked
    })
  },
  // 收件人
  recipiName: function(e){
    var that = this;
    that.setData({
      recipiName: e.detail.value
    })
  },
  // 联系电话
  relatPhone: function(e){
    var that = this;
    if (e !== undefined) {
      var relaphone = e.detail.value;
      if (relaphone.length === 11) {
        let checkedNum = this.checkPhoneNum(relaphone);
        if (checkedNum) {
          that.setData({
            relaphone: relaphone
          })
        }else{
          wx.showToast({
            title: '请填写正确的手机号',
            icon: 'none'
          })
        }
      }
    }
  },
  checkPhoneNum: function (phoneNum) {
    let str = /^1\d{10}$/
    if (str.test(phoneNum)) {
      return true
    } else {
      return false
    }
  },
  // 具体门牌号
  specHouse: function(e){
    var that = this;
    that.setData({
      spechouse: e.detail.value
    })
  },
  atuoGetLocation: function(e){
    qqwxmap.geocoder({
      address: e.detail.value,   //用户输入的地址（注：地址中请包含城市名称，否则会影响解析效果），如：'北京市海淀区彩和坊路海淀西大街74号'
      complete: res => {
        console.log(res.result.location);   //经纬度对象
      } 
      // else {
      //   console.log('无法定位到该地址，请确认地址信息！')
      // }
    })
        
  },
  toQQMap: function() {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          plateQQName: res.name,
          plateQQAddress: res.address,
          forumlat: res.latitude,
          forumlon: res.longitude
        })
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },
  // 编辑地址
  Editor: function(){
    var that = this;
    that.setData({
      editor: true
    })
  },
  // 删除地址
  DeleteAdd: function() {
    wx.showModal({
      title: '提示',
      content: '确定删除该常用地址吗',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '删除成功'
          })
        }
      }
    })
  },
  // 保存地址
  SaveAdd: function(){
    wx.showToast({
      title: '保存成功'
    })
  },
  // 新增地址
  newAddress: function(){
    var that = this;
    if (!that.data.recipiName){
      wx.showToast({
        title: '请填写收件人姓名',
        icon: 'none'
      })
    } else if (!that.data.relaphone){
      wx.showToast({
        title: '请填写联系电话',
        icon: 'none'
      })
    } else if (!that.data.spechouse){
      wx.showToast({
        title: '请填写门牌号',
        icon: 'none'
      })
    }else{
      wx.showToast({
        title: '新增成功',
      })
    }
  }
})