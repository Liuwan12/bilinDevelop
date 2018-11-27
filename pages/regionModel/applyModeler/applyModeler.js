const app = getApp();
var interval = null;
Page({
  data: {
    myOpenid: '', // 我的openid
    paperlist: ['二代身份证','学生证'],
    personallist: ['普通用户','其他版主'],
    idCardClass: '二代身份证',
    identity: '普通用户',
    imglist: '',
    imgisShow: false,
    chooseShow: true,
    workimgisShow: false,
    chooseWorkShow: true,
    xuanze: true,
    paperClassShow: false,
    personalClassShow: false,
    idImg: '', // 身份证照片
    workImg: '', // 工作证照片
    email: '', // 邮箱
    placeValue: '', // 地址
    trueName: '', // 真实姓名
    idNum: '', // 证件号
    phoneValue: '', // 输入的手机号
    smsValue: '', // 获取输入的验证码
    currentTime: 60,  //倒计时
    time: 60,
    ontime: false,
    verification: true,
    plateId: ''
    // smsValue
  },
  onLoad: function (option) {
    var that = this;
    // 获取本地缓存中的本人openid
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        console.log(res);
        that.setData({
          myOpenid: res.data,
        });
      }
    });
    that.setData({
      plateId: option.plateId
    })
  },

  everyBtn() {
    this.setData({
      paperClassShow: false,
      personalClassShow: false
    })
  },
  // 获取邮箱
  emailValue: function (e) {
    var that = this;
    that.setData({
      email: e.detail.value
    });
  },
  // 获取地址
  placeValue: function (e) {
    var that = this;
    that.setData({
      placeValue: e.detail.value
    });
  },
  // 获取姓名
  trueNameValue: function (e) {
    var that = this;
    that.setData({
      trueName: e.detail.value
    });
  },
  // 获取证件号
  idNumValue: function (e) {
    var that = this;
    that.setData({
      idNum: e.detail.value
    });
  },

  uploadIdCardPic() {
    var that = this;
    var num = 0;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        that.setData({
          imglist: tempFilePaths,
          imgisShow: true,
          chooseShow: false
        });
        // 上传图片到云服务器
        wx.uploadFile({
          url: app.globalData.Api +'/oss/uploadImgs',
          filePath: tempFilePaths[0],
          name: 'imgs',
          success: function (res) {
            var newRes = JSON.parse(res.data).data;
            that.setData({
              idImg: newRes
            });
          }
        });
      }
    })
  },

  previewImage: function (e) {
    var that=this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.imglist // 需要预览的图片http链接列表  
    })
  },

  // // // // // // // // // // // // // // // //
  // 上传证件照
  uploadWorkPic() {
    var that = this;
    var num = 0;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        that.setData({
          workimglist: tempFilePaths,
          workimgisShow: true,
          chooseWorkShow: false
        });
        // 上传图片到云服务器
        wx.uploadFile({
          url: app.globalData.Api + '/oss/uploadImgs',
          filePath: tempFilePaths[0],
          name: 'imgs',
          success: function (res) {
            var newRes = JSON.parse(res.data).data;
            that.setData({
              workImg: newRes
            });
          }
        });
      }
    })
  },

  previewWorkImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.workimglist // 需要预览的图片http链接列表
    })
  },

  // // // // // // // // // // // //
  xuanzeBtn() {
    this.setData({
      xuanze: !this.data.xuanze
    })
  },

// 证件选择
  beginPaperChoose() {
    this.setData({
      paperClassShow: true,
      containerShow: false
    })
  },

  paperChoose:function(e) {
    var that = this;
    var id = e.currentTarget.id;
    console.log(id);
    that.setData({
      idCardClass: that.data.paperlist[id],
      paperClassShow: false,
      containerShow: true
    })
  },

// 身份选择
  beginPersonalChoose() {
    this.setData({
      personalClassShow: true,
      containerShow: false
    })
  },

  personalChoose: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    console.log(id);
    that.setData({
      identity: that.data.personallist[id],
      personalClassShow: false,
      containerShow: true
    })
  },
  verifyEmail: function(){
    var that = this;
    let str = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (str.test(that.data.email)) {
      return true
    } else {
      wx.showModal({
        title: '提示',
        content: '请填写正确的邮箱',
      })
      return false
    }
  },
  verifyidcard: function(){
    var that = this;
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (reg.test(that.data.idNum) === false) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的证件号',
      })
      return false;
    }else{
      return true;
    }
  },
  // 调用申请位置管理员接口
  authentication: function() {
    var that = this;
    if (that.data.trueName == '') {
      wx.showModal({
        title: '提示',
        content: '请输入姓名！',
        success: function (res) {
          if (res.confirm) {
            console.log(res);
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.data.phoneValue == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号！',
        success: function (res) {
          if (res.confirm) {
            console.log(res);
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.data.placeValue == '') {
      wx.showModal({
        title: '提示',
        content: '请输入地址！',
        success: function (res) {
          if (res.confirm) {
            console.log(res);
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.data.email == '') {
      wx.showModal({
        title: '提示',
        content: '请输入email！',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.data.idNum == '') {
      wx.showModal({
        title: '提示',
        content: '请输入身份证号！',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.data.idImg == '') {
      wx.showModal({
        title: '提示',
        content: '请添加身份证照片！',
        success: function (res) {
          if (res.confirm) {
            console.log(res);
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.data.xuanze == true) {
      wx.showModal({
        title: '提示',
        content: '请同意《版主认证协议》！',
        success: function (res) {
          if (res.confirm) {
            console.log(res);
            console.log('用户点击确定');
          } else {
            console.log('用户点击取消');
          }
        }
      });
    } else if (that.verifyEmail() && that.verifyidcard()){
      wx.request({
        url: app.globalData.Api + "/plate/applyPlateAdmin",
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data: {
          openId: that.data.myOpenid,
          plateId: that.data.plateId,
          realName: that.data.trueName,
          address: that.data.placeValue,
          email: that.data.email,
          card: that.data.idNum,
          cardImg: that.data.idImg,
          identityImg: that.data.workImg,
          code: that.data.smsValue,
          phone: that.data.phoneValue
        },
        success: function (res) {
          console.log(res);
          if (res.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: '申请成功！请等候审核...',
              success: function (res) {
                if (res.confirm) {
                  console.log(res);
                  console.log('用户点击确定');
                  wx.navigateBack({
                    delta: 1
                  });
                } else {
                  console.log('用户点击取消');
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success: function (res) {
                if (res.confirm) {
                  console.log(res);
                  console.log('用户点击确定');
                  wx.navigateBack({
                    delta: 1
                  });
                } else {
                  console.log('用户点击取消');
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            });
          }
        }
      });
    } 
  },
  //获取验证码
  phoneValue:function(e){
    var that = this;
    that.setData({
      phoneValue: e.detail.value
    })
    console.log(that.data.phoneValue);
  },
  smsValue: function(e){
    var that = this;
    that.setData({
      smsValue: e.detail.value
    })
  },
  getVerificationCode: function (res) {
    var that = this;
    let currentTime = that.data.currentTime;
    clearInterval(interval);
      wx.request({
        url: app.globalData.Api + '/sms/sendSmsCode',
        data: {
          phone: that.data.phoneValue
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
  },
  // 确认验证码
  onconfirm: function (res) {
    var that = this;
    if (that.data.phoneValue && that.data.smsValue) {
      wx.request({
        url: app.globalData.Api + '/sms/checkSmsCode',
        data: {
          phone: that.data.phoneValue,
          smsCode: that.data.smsValue
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: 'POST',
        success: function (res) {
          if (that.data.smsValue == res.data.data) {
            wx.showToast({
              title: '手机号认证成功',
              icon: 'success',
              duration: 2000,
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '验证码错误',
            })
          }
        }
      });
    }
  },
})