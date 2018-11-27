const app = getApp();
var interval = null;
Page({

  data: {
    city: '',
    Name: '',  // 商铺负责人姓名
    shopName: '',  // 商铺名称
    platevalue: '',  // 商铺位置
    shopSite: '', // 商铺具体地址
    bindPhone: false, // 未绑定手机号
    myPhone: '',// 用户绑定的电话号
    phoneNum: '', // 用户输入的手机号
    hideName: false,
    ontime: false, // 倒计时
    verification: true, // 验证码
    verify:'', // 输入的验证码
    time: 60,
    currentTime: 60,
    nickName: '',
    pics: [],
    logoImgs: [],
    imgurl: '',
    logourl: '',
    plateId: '',
    noAgree: true // 同意入驻协议
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      city: wx.getStorageSync('city')
    })
    that.getUserInfo();
  },
  // 查看用户信息
  getUserInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.Api + '/user/getUserVo',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: wx.getStorageSync('openid')
      },
      success: function (res) {
        that.setData({
          nickName: res.data.data.nickname
        })
        if (res.data.data.telphone == "") {
          that.setData({
            bindPhone: true,
            bindhasPhone: false
          })
        } else {
          that.setData({
            myPhone: res.data.data.telphone,
            bindPhone: false,
            bindhasPhone: true,
          })
        }
      }
    })
  },
  // 上传商铺logo
  addlogo: function(){
    var that = this;
    var logoImgs = that.data.logoImgs;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        var imgsrc = [];
        imgsrc = res.tempFilePaths;
        logoImgs = imgsrc.concat(logoImgs);
        that.setData({
          logoImgs: logoImgs
        });
        wx.uploadFile({
          url: app.globalData.Api + '/oss/uploadImgs',
          filePath: logoImgs[0],
          name: 'imgs',
          success: function (res) {
            var successurl = []
            successurl = JSON.parse(res.data).data;
            that.setData({
              logourl: successurl
            })
          }
        })
      },
    })
  },
  // 上传营业执照
  uploading: function () {
    var that = this;
    var pics = that.data.pics;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        var imgsrc = [];
        imgsrc = res.tempFilePaths;
        pics = imgsrc.concat(pics);
        that.setData({
          pics: pics
        });
        wx.uploadFile({
          url: app.globalData.Api + '/oss/uploadImgs',
          filePath: pics[0],
          name: 'imgs',
          success: function (res) {
            var successurl = []
            successurl = JSON.parse(res.data).data;
            that.setData({
              imgurl: successurl
            })
          }
        })
      },
    })
  },
  // 隐藏绑定手机号弹框
  hide:function(){
    var that = this;
    that.setData({
      hideName: false,
    })
  },
  // 获取商铺名称
  onshopName: function(e){
    var that = this;
    that.setData({
      shopName: e.detail.value
    })
  },
  // 获取商铺位置
  onPosition:function(e){
    var that = this;
    that.setData({
      shopPosition: e.detail.value
    })
  },
  // 获取具体地址
  onSite:function(e) {
    var that = this;
    that.setData({
      shopSite: e.detail.value
    })
  },
  // 获取商铺负责人姓名
  onName:function(e){
    var that = this;
    that.setData({
      Name: e.detail.value
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
            wx.showToast({
              title: '绑定成功',
              icon: 'success',
              duration: 2000,
            })
            wx.request({
              url: app.globalData.Api + '/user/updateUser',
              method: 'POST',
              data: {
                openId: that.data.openId,
                tel: that.data.phoneNum,
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              success: function (res) {
                console.log(res);
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
  // 绑定手机号
  BindPhone:function(){
    var that = this;
    if (that.data.myPhone == "") {
      that.setData({
        hideName: true
      })
    }
  },
  searchplate:function(){
    var that = this;
    that.setData({
      showsearch: true,
    })
    that.searchPlateByUserLocation();
  },
  // 输入框搜索位置
  input1: function (e) {
    var that = this;
    that.onsearch(e.detail.value);
  },
  confirm1: function (e) {
    var that = this;
    this.onsearch(e.detail.value);
  },
  // 根据标题模糊搜索
  onsearch: function (e) {
    var that = this;
    if (e == '') {
      that.searchPlateByUserLocation();
      return;
    }
    wx.request({
      url: app.globalData.Api + "/plate/seletByUserNearLocation",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.getopenid,
        name: e,
        pageNum: 1,
        pageSize: 20,
        city: that.data.city
      },
      success: function (res) {
        that.setData({
          nearPlate: res.data.data,
        })
      }
    })
  },
  // 用户附近位置查询
  searchPlateByUserLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        wx.request({
          url: app.globalData.Api + '/plate/getCityNameByTencentPoi',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          data: {
            location: that.data.latitude + ',' + that.data.longitude,
          },
          success: function (res) {
            wx.request({
              url: app.globalData.Api + "/plate/seletByUserNearLocation",
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              data: {
                openId: that.data.openId,
                lat: that.data.latitude,
                lng: that.data.longitude,
                pageNum: 1,
                pageSize: 10,
                city: res.data.data
              },
              success: function (res) {
                that.setData({
                  nearPlate: res.data.data,
                })
              }
            });
          }
        })
      },
    })
  },
  // 选择经营位置
  choosePlate: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    wx.showModal({
      title: '提示',
      content: `确认选取的位置为${that.data.nearPlate[id].plate.title}吗？提交并审核通过后将不能修改`,
      success: function(res){
        if(res.confirm){
          that.setData({
            platevalue: that.data.nearPlate[id].plate.title,
            showsearch: false,
            plateId: that.data.nearPlate[id].plate.id,
          })
          if (that.data.nearPlate[i].isFocus == 0) {
            wx.request({
              url: app.globalData.Api + '/plate/focusPlate',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              data: {
                openId: that.data.openId,
                plateId: that.data.plateId
              },
              success: function (res) {
                console.log(res)
              }
            })
          }
        }else{
          return
        }
      }
    })
  },
  // 同意入驻协议
  agreeProto:function(){
    var that = this;
    that.setData({
      noAgree: false
    })
  },
  // 提交审核
  submit:function(){
    var that = this;
    if (that.data.shopName==''){
      wx.showModal({
        title: '提示',
        content: '请输入商铺名称',
      })
    } else if (that.data.platevalue==''){
      wx.showModal({
        title: '提示',
        content: '请选择商铺位置',
      })
    } else if (that.data.shopSite==''){
      wx.showModal({
        title: '提示',
        content: '请输入商铺具体地址',
      })
    }else if(that.data.Name == ''){
      wx.showModal({
        title: '提示',
        content: '请输入商铺负责人姓名',
      })
    } else if (that.data.imgurl==''){
      wx.showModal({
        title: '提示',
        content: '请上传商铺执照',
      })
    } else if (that.data.noAgree==true){
      wx.showModal({
        title: '提示',
        content: '请同意淘比邻入驻协议',
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '请确认信息无误，提交后将不可更改',
        success:function(res){
          if(res.confirm){
            wx.request({
              url: app.globalData.Api + '/store/addStore',
              data: {
                location: that.data.shopSite,
                name: that.data.shopName,
                bossname: that.data.Name,
                phone: that.data.myPhone,
                licenseimgs: that.data.imgurl,
                createuser: wx.getStorageSync('openid'),
                plateid: that.data.plateId,
                logoimgs: that.data.logourl,
                wechatid: that.data.nickName
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              method: 'POST',
              success: function (res) {
                if (res.data.code == 0) {
                  wx.showToast({
                    title: res.data.msg,
                  })
                  wx.navigateTo({
                    url: '/pages/shopping/ServiceFee/ServiceFee',
                  })
                } else if (res.data.code!==0) {
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                  })
                }
                console.log(res);
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: '确认退出吗？退出后需重新填写资料',
            })
          }
        },
        fail: function(){
          wx.showModal({
            title: '提示',
            content: '确认退出吗？退出后需重新填写资料',
          })
        }
      })
    }
  }
})