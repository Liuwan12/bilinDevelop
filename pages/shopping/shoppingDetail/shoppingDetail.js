const app = getApp();
var interval = null;
Page({

  data: {
    shopid: '',
    name: '',
    telphone:'',
    shoplocation: '',
    bossname: '',
    logoImage: '',
    haslogoImage: true,
    plateId: '',
    plateName: '',
    hideName: false,
    ontime: false, // 倒计时
    verification: true, // 验证码
    verify: '', // 输入的验证码
    time: 60,
    currentTime: 60,
    changeNum: false ,// 更改门牌号
    houseInput: '', // 用户输入的门牌号
  },
  onLoad: function (options) {
    var that = this;
    that.getStoreById();
  },
  getStoreById: function(){
    var that = this;
    wx.request({
      url: app.globalData.Api + '/store/getStoreStateByOpenId',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: wx.getStorageSync('openid')
      },
      success: function (res) {
        if (res.data.data.logoimgs) {
          that.setData({
            logoImage: res.data.data.logoimgs
          })
        } else {
          that.setData({
            haslogoImage: false
          })
        }
        that.setData({
          name: res.data.data.name,
          telphone: res.data.data.phone,
          shoplocation: res.data.data.location,
          bossname: res.data.data.bossname,
          plateId: res.data.data.plateid,
          shopid: res.data.data.id
        })
        wx.request({
          url: app.globalData.Api + '/plate/getPlateDetail',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          data: {
            plateId: that.data.plateId,
          },
          success: function (res) {
            if(res.data.code == 0){
              that.setData({
                plateName: res.data.data.plate.title
              })
            }
          }
        })
      }
    })
  },
  changePhone:function(){
    var that = this;
    that.setData({
      hideName: true
    })
  },
  hide:function(){
    var that = this;
    that.setData({
      hideName: false,
      changeNum:false
    })
  },
  // 手机号部分
  inputPhoneNum: function (e) {
    var that = this;
    if (e !== undefined) {
      var phoneNum = e.detail.value;
      if (phoneNum.length === 11) {
        let checkedNum = this.checkPhoneNum(phoneNum);
        if (checkedNum) {
          that.setData({
            phoneNum: phoneNum
          })
        }
      }
    }
  },
  // 验证手机号
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
    if (that.data.phoneNum) {
      wx.request({
        url: app.globalData.Api + '/sms/sendSmsCode',
        data: {
          phone: this.data.phoneNum
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: 'POST',
        success: function (res) {
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
      verify: verify,
    });
  },
  // 确认验证码
  onconfirm: function (res) {
    var that = this;
    if (that.data.phoneNum && that.data.verify) {
      wx.request({
        url: app.globalData.Api + '/sms/checkSmsCode',
        data: {
          phone: that.data.phoneNum,
          smsCode: that.data.verify
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: 'POST',
        success: function (res) {
          if (that.data.verify == res.data.data) {
            wx.request({
              url: app.globalData.Api + '/store/updateStore',
              method: 'POST',
              data: {
                id: that.data.shopid,
                phone: that.data.phoneNum,
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              success: function (res) {
                if(res.data.code==0){
                  wx.showToast({
                    title: '更改成功',
                    icon: 'success',
                    duration: 2000,
                  })
                  that.onLoad();
                } else {
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'fail',
                    duration: 2000,
                  })
                }
              }
            })
            that.setData({
              hideName: false,
              shade: false,
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '验证码错误',
            })
          }
        }
      })
    }
  },
  // 修改商铺门牌号
  changeNum:function(){
    var that = this;
    that.setData({
      changeNum: true
    })
  },
  // 用户输入的门牌号
  houseInput:function(e){
    var that=this;
    that.setData({
      houseInput: e.detail.value
    })
  },
  changeHouNum: function(){
    var that = this;
    wx.request({
      url: app.globalData.Api + '/store/updateStore',
      method: 'POST',
      data: {
        id: that.data.shopid,
        location: that.data.houseInput,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function(res){
        if (res.data.code == 0) {
          that.setData({
            changeNum: false
          })
          wx.showToast({
            title: '更改门牌号成功',
            icon: 'success',
            duration: 2000,
          })
          that.onLoad();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'fail',
            duration: 2000,
          })
        }
      }
    })
  },
  // 修改商铺图像
  changeImage:function(){
    var that = this;
    var logoImgs = that.data.logoImage;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        var imgsrc = [];
        imgsrc = res.tempFilePaths;
        logoImgs = imgsrc.concat(logoImgs);
        that.setData({
          logoImage: logoImgs
        });
        wx.uploadFile({
          url: app.globalData.Api + '/oss/uploadImgs',
          filePath: logoImgs[0],
          name: 'imgs',
          success: function (res) {
            var successurl = []
            successurl = JSON.parse(res.data).data;
            wx.request({
              url: app.globalData.Api +'/store/updateStore',
              method: 'POST',
              data: {
                id: that.data.shopid,
                logoimgs: successurl,
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              success: function(res){
                if (res.data.code == 0) {
                  wx.showToast({
                    title: '更改成功',
                    icon: 'success',
                    duration: 2000,
                  })
                  that.onLoad();
                }else{
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'fail',
                    duration: 2000,
                  })
                }
              }
            })
          }
        })
      },
    })
  }
})