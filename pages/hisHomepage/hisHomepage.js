const app = getApp();
var wxreq=require('../../utils/wxRequest.js');
Page({
  data: {
    myOpenid: '', // 本人的openid
    hisOpenid: '', // 查看之人的openid
    infoArr: [], // 查询的人的信息列表
    hisSex: '', // 查询人的性别图片地址
    hisInfo: '',
    myFollowArr: '', // 我的关注列表
    myOrHis: false, // 显示关注按钮
    cancel: false, //显示取消关注按钮
    myFocusList: [] ,//我的关注列表
    // hisFollow: '', // Ta关注的人
    // hisFans: '', // Ta的粉丝
    hispublishNum: '' // Ta的发帖数量
  },
  onLoad: function (option) {
    var that = this;
    that.setData({
      myOpenid: wx.getStorageSync('openid'),
      hisOpenid: option.hisOpenid
    })
    that.searchInfo();
    that.getmyFocus();
    // that.getHisFollows();
    that.hisPublishNum();
  },

  // 查询这个人的个人信息
  searchInfo: function() {
    var that = this;
    var url = app.globalData.Api + "/user/getUserVo";
    var data={
      openId: that.data.hisOpenid,
      myOpenId: that.data.myOpenid
    }
    wxreq.postRequest(url, data).then(res => {
      var arr = [];
      arr = arr.concat(res.data.data);
      that.setData({
        infoArr: arr,
        hisInfo: res.data.data
      });
      if (that.data.infoArr[0].sex == 1) {
        that.setData({
          hisSex:
            'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        });
      } else if (that.data.infoArr[0].sex == 0) {
        that.setData({
          hisSex:
            'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        });
      }
    })
  },
  
  // 查看wo的关注列表
  getmyFocus: function(){
     var that = this;
    var url = app.globalData.Api + '/user/getUserFocusFans';
    var data = {
      flag: 1,
      openId: that.data.myOpenid,
      pageSize: 200,
      pageNum: 1
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        myFocusList: res.data.userList
      })
      that.setData({
        myOrHis: true,
        cancel: false
      })
      for (var i = 0; i < that.data.myFocusList.length; i++) {
        if (that.data.myFocusList[i].openId == that.data.hisOpenid) {
          that.setData({
            myOrHis: false,
            cancel: true
          })
        }
      }
      that.searchInfo();
    })
  },
  // 查看他人的关注粉丝列表
  // getHisFollows:function(){
  //   var that= this;
  //   wx.request({
  //     url: app.globalData.Api + '/user/getUserFocusFans',
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded' // 默认值
  //     },
  //     data: {
  //       flag: 1,
  //       openId: that.data.myOpenid,
  //       targetOpenId: that.data.hisOpenid,
  //       pageSize: 5,
  //       pageNum: 1
  //     },
  //     success: function(res){
  //       if(res.data.code==0){
  //         that.setData({
  //           hisFollow: res.data.count
  //         })
  //       } else {
  //         wx.showModal({
  //           title: '提示',
  //           content: res.data.msg,
  //         })
  //       }
  //     }
  //   })
  //   wx.request({
  //     url: app.globalData.Api + '/user/getUserFocusFans',
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded' // 默认值
  //     },
  //     data: {
  //       flag: 2,
  //       openId: that.data.myOpenid,
  //       targetOpenId: that.data.hisOpenid,
  //       pageSize: 5,
  //       pageNum: 1
  //     },
  //     success: function (res) {
  //       if (res.data.code == 0) {
  //         that.setData({
  //           hisFans: res.data.count
  //         })
  //       }else{
  //         wx.showModal({
  //           title: '提示',
  //           content: res.data.msg,
  //         })
  //       }
  //     }
  //   })
  // },
  // 查询他的发帖数量
  hisPublishNum: function(){
    var that =this;
    var url = app.globalData.Api + "/forumMark/selectCollectAndRelease"
    var data = { openId: that.data.hisOpenid }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.setData({
          hispublishNum: res.data.data.collect
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
        })
      }
    })
  },
  // 调用关注用户接口
  interest: function(){
    var that = this;
    var txt = ''
    if (!that.data.hisInfo.isFocus){
      txt = '确定关注该邻粉吗'
    } else{
      txt = '确定取消对该邻粉的关注吗'
    }
    wx.showModal({
      title: '提示',
      content: txt,
      success: function(res){
        if(res.confirm){
          var url = app.globalData.Api + "/user/isFocusUser";
          var data = {
            openId: that.data.myOpenid,
            targetOpenId: that.data.hisOpenid
          }
          wxreq.postRequest(url, data).then(res => {
            if (res.data.data == 1) {
              that.setData({
                myOrHis: false,
                cancel: true
              })
              wx.showToast({
                title: '关注成功',
              })
            } else if (res.data.data == 0) {
              that.setData({
                cancel: false,
                myOrHis: true
              })
              wx.showToast({
                title: '取消关注成功',
              })
            }
            that.searchInfo();
          })
        }else{
          return;
        }
      }
    })
  },

 
  // 进入他关注的位置页面
  toHisFollowModel: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/hisFollowposition/hisFollowposition?hisOpenid=' + that.data.hisOpenid,
    })
  },
  // 进入他的发布页面
  toHisPublic: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/hisModelInfo/hisModelInfo?hisOpenid=' + that.data.hisOpenid,
    })
  },
  // 进入他关注/粉丝的列表页面
  // toHisFocus: function() {
    // var that = this;
    // var detail = [that.data.hisOpenid, 1]
  //   wx.navigateTo({
  //     url: '/pages/hisFollowModel/hisFollowModel',
  //   })
  // },
  toHisFans: function(){
    var that = this;
    // var detail = [that.data.hisOpenid,2]
    wx.navigateTo({
      url: '/pages/hisFollowModel/hisFollowModel?hisOpenid=' + that.data.hisOpenid,
    })
  }
})
