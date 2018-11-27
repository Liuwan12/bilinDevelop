// pages/myself/feedback/feedback.js
const app = getApp();
const wxreq = require("../../../utils/wxRequest.js"); 
Page({

  data: {
    personalOpenid: '',
    feedContent: '',
    feedPlaceHolder: '请在此输入您对淘比邻平台的任何建议❤️',
    textNum: '0/140',
    UserInfo:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 取出本地缓存中的信息
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          personalOpenid: res.data
        });
        that.getUserInfo();
      }
    });
  },
  getUserInfo: function(){
    var that = this;
    var that = this;
    var url = app.globalData.Api + '/user/getUserInfo';
    var data = {
      openId: that.data.personalOpenid
    }
    wxreq.postRequest(url, data).then(res => {
      if(res.data.code==0){
        if (res.data.data[0].sex == 1) {
          res.data.data[0].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.data[0].sex == 0) {
          res.data.data[0].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        that.setData({
          UserInfo: res.data.data[0]
        })
      }
    })
  },
  feedFocus: function(e){
    var that = this;
    if (e.detail.value.trim.length==0){
      that.setData({
        feedPlaceHolder: ''
      })
    }
  },
  feedBlur: function(e){
    var that = this;
    if (e.detail.value.trim.length == 0) {
      that.setData({
        feedPlaceHolder: '请在这里留下您对我们淘比邻平台的任何建议和您的联系方式，您的反馈对我们十分重要❤️'
      })
    }
  },
  feedContent: function (e) {
    var that = this;
    var value = e.detail.value;
    var len = parseInt(value.length);
    that.setData({
      feedContent: e.detail.value,
      textNum: len+'/140'
    })
  },

  commitClick: function (){
    var that = this;

    that.feedback();
  },

  feedback: function (){
    var that = this;
    var len = parseInt(that.data.feedContent.length);
    if (len == 0) {
      wx.showModal({
        title: '提示',
        content: '请输入反馈内容',
      })
    }
    else {
      var url = app.globalData.Api + "/feedback/add";
      var data={
        userId: that.data.personalOpenid,
        feedback: that.data.feedContent,
      }
      wxreq.postRequest(url, data).then(res => {
        if (res.data.code == 0) {
          that.setData({
            feedContent: '',
            textNum: '0/140'
          })
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
      })
    }
  }
})