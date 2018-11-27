const app = getApp();
import wxreq from '../../utils/wxRequest.js';
Page({
  data: {
    hisOpenid: '', // 查看的人的openid
    hisFollowArr: [], // 查看的人关注的版块列表 
    flag: 1,
    openid: '',
    nofocusUser:false,
    noUserFocus:false
  },
  onLoad: function (option) {
    var that = this;
    that.setData({
      hisOpenid: option.hisOpenid,
      openid: wx.getStorageSync('openid')
    });
    that.searchFollowModel();
  },
  // 查询他的关注和粉丝列表
  searchFollowModel: function () {
    var that = this;
    var url = app.globalData.Api + "/user/getUserFocusFans";
    var data = {
      flag: that.data.flag,
      openId: that.data.openid,
      targetOpenId: that.data.hisOpenid,
      pageSize: 200,
      pageNum: 1
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.count == 0 && that.data.flag == 1) {
        that.setData({
          nofocusUser: true
        })
      } else if (res.data.count == 0 && that.data.flag == 2) {
        that.setData({
          noUserFocus: true
        })
      }
      for (var i = 0; i < res.data.userList.length; i++) {
        res.data.userList[i].nofocus = true;
        res.data.userList[i].hasfocus = false
        if (res.data.userList[i].isFocus == 1) {
          res.data.userList[i].hasfocus = true;
          res.data.userList[i].nofocus = false;
        } else {
          res.data.userList[i].hasfocus = false;
          res.data.userList[i].nofocus = true;
        }
        if (res.data.userList[i].openId == wx.getStorageSync('openid')) {
          res.data.userList[i].hasfocus = false;
          res.data.userList[i].nofocus = false;
        }
        if (res.data.userList[i].sex == 1) {
          res.data.userList[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.userList[i].sex == 0) {
          res.data.userList[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
      }
      that.setData({
        hisFollowArr: res.data.userList
      })
    })
  },
  // tab栏跳转
  selectTap: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    this.setData({menuTapCurrent: current})
    if (current == 0) {
      that.setData({
        flag: 2
      })
    } else if (current == 1) {
      that.setData({
        flag: 1
      })
    }
    that.searchFollowModel();
  },
  focus: function(e){
    var id = e.currentTarget.id;
    var that = this;
    var url = app.globalData.Api + '/user/isFocusUser';
    var data = {
      openId: that.data.openid,
      targetOpenId: that.data.hisFollowArr[id].openId
    }
    wxreq.postRequest(url, data).then(res => {
      that.searchFollowModel();
    })
  },
  tohisDetail: function(e){
    var id = e.currentTarget.id;
    var that = this;
    wx.navigateTo({
      url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.hisFollowArr[id].openId,
    })
  }
})
