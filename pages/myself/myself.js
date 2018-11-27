//index.js
//获取应用实例
var template = require('../../pages/tabBar/tabBar.js')
const app = getApp()
var interval = null;
import  wxreq from '../../utils/wxRequest.js'
Page({
  data: {
    personalOpenid: '', // 从本地缓存中取出的openID
    myavater: '', // 我的头像
    myName: '', // 我的名字
    mySex: '', // 我的性别
    myPhone: '', // 我的手机号
    setSex: 0,
    // myFans: '', // 我的粉丝
    // myFollow: '', // 我的关注
    placeArr: '',
    bindhasPhone: false,
    hideName: false,
    currentTime: 60,  //倒计时
    time: 60,
    phoneNum: '',
    bangding: true,
    genggai: false,
    ontime: false,
    verification: true,
    personalInfo: '',
    release: '',// 发帖数量
    collect: '' // 收藏数量
  },
  onTabItemTap(item) {
    var that = this;
    that.onLoad();
  },
  onLoad: function () {
    template.tabbar("tabBar", 1, this)//0表示第一个tabbar
    var that = this;
    // 取出本地缓存中的信息
    that.setData({
      personalOpenid: wx.getStorageSync('openid')
    })
    // 取出本地缓存中的地理位置
    wx.getStorage({
      key: 'place',
      success: function (res) {
        that.setData({
          placeArr: res.data
        });
      },
      fail: function () {
        that.getPlace();
      }
    });
    that.getPersonal();
    // that.getuserFocusFans();
    // that.getuserFocusFans1();
    that.CollectAndRelease();
  },
  // 获取个人信息
  getPersonal: function () {   
   var that = this;
    var url = app.globalData.Api + "/user/getUserVo";
    var data={
      openId: that.data.personalOpenid
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.setData({
          myavater: res.data.data.avatar,
          myName: res.data.data.nickname,
        })
        if (res.data.data.sex == 1) {
          that.setData({
            mySex: 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg', // 我的性别
            setSex: 1
          });
        } else {
          that.setData({
            mySex: 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg', // 我的性别
            setSex: 0
          });
        }
        wx.setStorage({
          key: 'myPersonalInfo',
          data: res.data.data
        });
        if (res.data.data.telphone == "") {
          that.setData({
            bindhasPhone: false
          })
        } else {
          that.setData({
            myPhone: res.data.data.telphone,
            bindhasPhone: true,
          })
        }
      } else {
        // 将我的个人信息存储到本地缓存
      }
    })
  },
  // 获取用户的关注粉丝数
  // getuserFocusFans: function () {
  //   var that = this;
  //   var url = app.globalData.Api + '/user/getUserFocusFans'
  //   var data = {
  //     flag: 1,
  //     openId: that.data.personalOpenid,
  //     pageNum: 1,
  //     pageSize: 5
  //   }
  //   api.postRequest(url, data).then(res=>{
  //       if (res.data.code == 0) {
  //         that.setData({
  //           myFollow: res.data.count
  //         });
  //       }
  //   })
  // },
  // getuserFocusFans1: function () {
  //   var that = this;
  //   var url = app.globalData.Api + '/user/getUserFocusFans'
  //   var data = {
  //     flag: 2,
  //     openId: that.data.personalOpenid,
  //     pageNum: 1,
  //     pageSize: 5
  //   }
  //   api.postRequest(url, data).then(res => {
  //     if (res.data.code == 0) {
  //       that.setData({
  //         myFans: res.data.count
  //       });
  //     }
  //   })
  // },
  // 获取发布和收藏的帖子个数
  CollectAndRelease:function(){
    var that = this;
    var url = app.globalData.Api + '/forumMark/selectCollectAndRelease';
    var data = {openId: that.data.personalOpenid};
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.setData({
          release: res.data.data.release,
          collect: res.data.data.collect
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
        })
      }
    })
  },
  getPlace: function () {
    var that = this;
    if (that.data.placeArr == '') {
      // 调用设置用户信息授权页面API     
      wx.openSetting({
        success: function (res) {
          if (res.authSetting["scope.userLocation"] == false) {
            that.getPlace();
          } else {
            wx.getLocation({
              success: function (res) {
                // 将经度纬度存储到本地缓存
                wx.setStorage({
                  key: 'place',
                  data: res
                });
              },
            })
          }
        }
      });
    }
  },
  // 手机号部分
  inputPhoneNum: function (e) {
    var that = this;
    let phoneNum = e.detail.value;
    if (phoneNum.length === 11) {
      let checkedNum = this.checkPhoneNum(phoneNum);
      if (checkedNum) {
        that.setData({
          phoneNum: phoneNum
        })
      }
    }
  },
  checkPhoneNum: function (phoneNum) {
    let str = /^1\d{10}$/
    if (str.test(phoneNum)) {
      return true
    } else {
      wx.showToast({
        title: '手机号不正确',
        image: '../../images/fail.png'
      })
      return false
    }
  },
  // 获取验证码
  getVerificationCode: function (res) {
    var that = this;
    var phoneNum = this.data.phoneNum;
    let currentTime = that.data.currentTime;
    clearInterval(interval);
    if (that.data.phoneNum){
      let url = app.globalData.Api + '/sms/sendSmsCode';
      let data = {phone:this.data.phoneNum};
      wxreq.postRequest(url,data).then(res=>{
        if(res.data.code==0){
          that.setData({
            verification: false,
            ontime: true
          });
          interval = setInterval(function () {
            currentTime--;
            that.setData({
              time: currentTime
            });
            if (currentTime <= 0) {
              clearInterval(interval);
              that.setData({
                verification: true,
                ontime: false
              })
            }
          }, 1000);
        }
      })
    }
  },
  // 输入验证码
  onverify: function (res) {
    var that = this;
    let verify = res.detail.value;
    that.setData({
      verify: verify
    });
  },
  // 确认验证码
  onconfirm: function (res) {
    var that = this;
    if (that.data.phoneNum && that.data.verify) {
      var url = app.globalData.Api + '/sms/checkSmsCode';
      var data = {
        phone: that.data.phoneNum,
        smsCode: that.data.verify
      }
      wxreq.postRequest(url,data).then(res=>{
        if (res.data.code == 0 && that.data.verify == res.data.data){
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000,
          })
          that.updateUser();
          that.setData({
            hideName: false,
          })    
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      })
    }
  },
  updateUser:function(res){
    var that = this;
    var url = app.globalData.Api +'/user/updateUser'
    var data = {
      openId: that.data.personalOpenid,
      tel: that.data.phoneNum,
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
          that.getPersonal();
       }
    })
  },
  //跳到我的红包页面
  toRedPaper: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/myself/redpaper/redpaper',
    })
  },
  // 跳到我的发布页面
  toMypublish: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/myself/mypublish/mypublish',
    })
  },
  // 跳到我的收藏页面
  toMycollection: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/myself/mycollection/mycollection',
    })
  },
  // 点击隐藏弹窗
  hide: function (e) {
    this.setData({
      hideName: false
    });
  },
  // 绑定手机号
  getPhoneNumber: function(e) {
    var that = this;
    // console.log(e.detail.encryptedData);
    if (that.data.myPhone==""){
      that.setData({
        hideName: true
      })

    }
  },
  skip: function(){
    var that = this;
    wx.navigateTo({
      url: '/pages/myself/personalInfo/personalInfo',
    })
  },
  // tofollow: function(){
  //   var that = this;
  //   wx.navigateTo({
  //     url: '/pages/myself/myfocus/myfocus?flag='+1,
  //   })
  // },
  tofans: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/myself/myfollow/myfollow',
    })
  },
  // 修改手机号
  changetel: function(){
     var that= this;
     that.setData({
       bangding: false,
       genggai: true,
       hideName: true
     });
    that.updateUser();
  },
  // 分享
  onShareAppMessage: function () {
    var that = this;
    return {
      title: ' 拼团 | 租房 | 闲置 | 求助',
      path: '/pages/myself/myself',
      imageUrl: '/image/share.png'
    }
  }
})
