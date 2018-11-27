const app = getApp();
const QQMapWX = require("../../../libs/qqmap-wx-jssdk.min.js")
var config = require('../../../libs/config.js');
var key = config.tencentConfig.key;
const wxreq = require('../../../utils/wxRequest.js');
var qqwxmap = new QQMapWX({
  key: key
});
var interval = null;
Page({
  data: {
    pics: [],
    imgs: '',
    phoneNum: '', //接收手机号
    hideName: false,
    bindlease: true,
    current: '',
    bindtrans: false,
    bindjoin: false,
    bindshop: false,
    bargain: false, //砍价
    verify: '', //接收验证码
    currentTime: 60,  //倒计时
    time: 60,
    monthprice: false, //显示月租金
    shade: false,
    ontime: false,
    verification: true,
    onHide: true,
    isshowvideo: false,
    content: '', //接受内容值
    month: '', // 月租金
    flag: 2,
    plateId: '', // 位置id
    plateList: [],  // 接收位置信息
    openId: '', //用户openId
    plateTitle: '', // 传入当前位置
    publishArr: [],  // 发布列表
    shownewprice: false,
    halfOldprice: '',//原价一半
    // 键盘
    keyboardShow: true,
    onkeyboard: false,
    imgurl3: [],
    videosrc: '',
    vediourl: '',// 上传视频后返回的url
    popaddphoto: false,
    platevalue: '',// 关注的位置
    nearPlate: [], // 附近位置列表
    noplate: true,
    hasplate: false,
    isShowfocus: true, // 是否焦点
    isShowfocus1: true,
    addInput1: 0,
    hidden: true,
    //关注的位置
    myfollowplate: false,
    plateName: '' ,// 位置名
    showsearch: false,
    userInfo: [],
    bosschatName: '',
    formId: '', // 用户发布的formId
    userformId: '', // 用户目前的formId
    cityname: '',
    plateQQName: '',
    plateQQAddress: '',
    forumlat: '',
    forumlon: '',
    distrValues: [
      {value: '用户自取'},
      {value: '商家送货'},
      {value: '都支持'}
    ],
    address: '', //收货地址
    unused: {
       newPrice: '' , // 卖价
       oldPrice: '' , // 原价
       linkUrl: '',
       title: '', //接收标题
       month: '', // 月租金
       classify: '', //获取二手交易的分类内容
       join: '', //获取房屋租赁的参数内容
       dates: '2018-10-20',
       time1: '00:00',
    } ,// 发布参数
    keyboard: ['1','2','3','4','5','6','7','8','9','.','0','X'],
    showKeyboard: false,
  },
  keyTap: function(e){
    var that = this;
    let keys = e.currentTarget.dataset.keys,
      price1 = this.data.unused.newPrice,
      len = price1.length;
    switch (keys) {
      case '·':
        if (len < 11 && price1.indexOf('.') == -1) {//如果字符串里有小数点了，则不能继续输入小数点，且控制最多可输入10个字符串
          if (price1.length < 1) {//如果小数点是第一个输入，那么在字符串前面补上一个0，让其变成0.
            price1 = '0.';
          } else {//如果不是第一个输入小数点，那么直接在字符串里加上小数点
            price1 += '.';
          }
        }
        break;
      case 'X'://如果点击删除键就删除字符串里的最后一个
        price1 = price1.substr(0, price1.length - 1);
        break;
      default:
        let Index = price1.indexOf('.');//小数点在字符串中的位置
        if (Index == -1 || len - Index != 3) {//这里控制小数点只保留两位
          if (len < 11) {//控制最多可输入10个字符串
            price1 += keys;
          }
        }
        break
    }
    this.setData({ 
      'unused.newPrice': price1
    })
  },
  keyTap2: function (e) {
    var that = this;
    let keys = e.currentTarget.dataset.keys,
      price2 = this.data.unused.oldPrice,
    len = price2.length;
    switch (keys) {
      case '·':
        if (len < 11 && price2.indexOf('.') == -1) {//如果字符串里有小数点了，则不能继续输入小数点，且控制最多可输入10个字符串
          if (price2.length < 1) {//如果小数点是第一个输入，那么在字符串前面补上一个0，让其变成0.
            price2 = '0.';
          } else {//如果不是第一个输入小数点，那么直接在字符串里加上小数点
            price2 += '.';
          }
        }
        break;
      case 'X'://如果点击删除键就删除字符串里的最后一个
        price2 = price2.substr(0, price2.length - 1);
        break;
      default:
        let Index = price2.indexOf('.');//小数点在字符串中的位置
        if (Index == -1 || len - Index != 3) {//这里控制小数点只保留两位
          if (len < 11) {//控制最多可输入10个字符串
            price2 += keys;
          }
        }
        break
    }
    this.setData({
      'unused.oldPrice': price2
    })
  },
  Another: function(){
    var that = this;
    that.setData({
      showKeyboard: true
    })
  },
  distrWay: function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var arr = this.data.distrValues;
    for (var id in arr) {
      if (id == index) {
        arr[id].selected = true;
      } else {
        arr[id].selected = false;
      }
    }
    this.setData({
      distrValues: arr
    })
  },
  onLoad: function (options) {
    var that = this;
    that.getFocusPlate();
    that.setData({
      cityname: options.cityname ? options.cityname : wx.getStorageSync('city')
    });
    if (options.plateId) {
      that.setData({
        focusPlate: options.plateId
      })
    }
    wx.setStorageSync('join', "");
    wx.setStorageSync('publishcity', "");
    wx.setStorageSync('classify', "");
    that.getUserInfo();
    that.searchplate();
  },
  // 跳到城市列表
  tocitylist: function () {
    wx.navigateTo({
      url: '/pages/cityList/cityList?page=publish',
    })
  },
  toQQMap: function(){
    this.moveToLocation();
  },
  //移动选点
  moveToLocation: function () {
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
  // 查看用户信息
  getUserInfo: function () {
    var that = this;
    var url = app.globalData.Api + '/user/getUserInfo';
    var data = {
      openId: wx.getStorageSync('openid')
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        if (res.data.data[0].sex == 1) {
          res.data.data[0].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.data[0].sex == 0) {
          res.data.data[0].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        that.setData({
          userInfo: res.data.data[0]
        })
      }
      if (res.data.data[0].telphone !== "") {
        that.setData({
          phoneNum: res.data.data[0].telphone,
          userformId: res.data.data[0].formid
        });
      }
      if (that.data.phoneNum == "") {
        that.setData({
          hideName: true,
          shade: true,
          addInput1: 1
        })
      } else {
        that.setData({
          hideName: false,
          shade: false,
          addInput1: 0
        })
      }
    })
  },
  toAddress: function(){
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
  loadingChange: function () {
    this.setData({
      hidden: true
    })
  },
  loadingTap: function () {
    this.setData({
      hidden: false
    })
    var that = this
    setTimeout(function () {
      that.setData({
        hidden: true
      })
    }, 5500)
  },
  platecancel: function () {
    var that = this;
    that.setData({
      showsearch: false,
      addInput1: 0
    })
  },
  tosearch: function() {
    var that = this;
    that.setData({
      showsearch: true,
      addInput1: 1,
    })
  },
  toweizhi: function(){
    var that = this;
    that.setData({
      showsearch: false,
      addInput1: 0
    })
  },
  // 输入框搜索位置
  input1: function (e) {
    var that = this;
    that.setData({
      showsearch: true,
      addInput1: 1
    })
    that.onsearch(e.detail.value);
  },
  confirm1: function (e) {
    var that = this;
    this.onsearch(e.detail.value);
  },
  searchplate: function () {
    var that = this;
    that.setData({
      hasplate: true,
      addInput1: 1
    })
    that.searchPlateByUserLocation();
  },
  choosePlate: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    for (var i = 0; i < that.data.nearPlate.length; i++) {
      if (id == i) {
        that.setData({
          platevalue: that.data.nearPlate[i].plate.title,
          showsearch: false,
          plateId: that.data.nearPlate[i].plate.id,
          addInput1: 0
        })
        if (that.data.nearPlate[i].isFocus == 0) {
          var url = app.globalData.Api + '/plate/focusPlate';
          var data = {
            openId: that.data.openId,
            plateId: that.data.plateId
          }
          wxreq.postRequest(url, data).then(res => {
            console.log(res)
          })
        }
      }
    }
  },
  // 点击关注
  isFocus: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.current;
    for (var i = 0; i < that.data.nearPlate.length; i++) {
      if (i == id) {
        that.setData({
          plateId1: that.data.nearPlate[i].plate.id
        })
      }
    }
    var url = app.globalData.Api + "/plate/focusPlate";
    var data = {
      openId: that.data.openId,
      plateId: that.data.plateId1
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < that.data.nearPlate.length; i++) {
        if (i == id) {
          that.setData({
            ['nearPlate[' + i + '].onfocus']: false,
            ['nearPlate[' + i + '].nonfocus']: true,
          })
        }
      }
      that.getFocusPlate();
    })
  },
  // 根据标题模糊搜索
  onsearch: function (e) {
    var that = this;
    if (e == '') {
      that.searchPlateByUserLocation();
      return;
    }
    var url = app.globalData.Api + "/plate/seletByUserNearLocation";
    var data = {
      openId: that.data.getopenid,
      name: e,
      pageNum: 1,
      pageSize: 10,
      city: wx.getStorageSync('publishcity') ? wx.getStorageSync('publishcity') : wx.getStorageSync('city')
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.data.length; i++) {
        if (res.data.data[i].isFocus == 1) {
          res.data.data[i].onfocus = false;
          res.data.data[i].nonfocus = true;
        } else if (res.data.data[i].isFocus == 0) {
          res.data.data[i].onfocus = true;
          res.data.data[i].nonfocus = false;
        }
      }
      that.setData({
        nearPlate: res.data.data,
      })
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
            that.setData({
              city: res.data,
            })
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
                city: wx.getStorageSync('publishcity') ? wx.getStorageSync('publishcity') : wx.getStorageSync('city')
              },
              success: function (res) {
                for (var i = 0; i < res.data.data.length; i++) {
                  if (res.data.data[i].isFocus == 1) {
                    res.data.data[i].onfocus = false;
                    res.data.data[i].nonfocus = true;
                  } else if (res.data.data[i].isFocus == 0) {
                    res.data.data[i].onfocus = true;
                    res.data.data[i].nonfocus = false;
                  }
                }
                for (var i = 0; i < res.data.data.length; i++) {
                  if (res.data.data[i].isFocus == 1) {
                    that.setData({
                      showguide: false,
                      showList: true
                    })
                  }
                }
                that.setData({
                  nearPlate: res.data.data,
                  platevalue0: res.data.data[0].plate.title,
                  plateId: res.data.data[0].plate.id,
                })
              }
            });
          }
        })
      },
    })
  },
  // 已关注的位置
  myfollowplate: function(){
    var that = this;
    that.setData({
      myfollowplate: true,
      showsearch: false,
      addInput1: 1
    })
  },
  platecancel:function(){
    var that = this;
    that.setData({
      myfollowplate: false,
      addInput1: 0
    })
  },
  toChooseDetail: function(idx){
     var that = this;
     var id = idx.currentTarget.id;
     that.setData({
      platevalue: that.data.plateList[id].plate.title,
      showsearch: false,
      plateId: that.data.plateList[id].plate.id,
      addInput1: 0
     })
  },
  // 查看关注的位置
  getFocusPlate: function (e) {
    var that = this;
    that.setData({
      openId: wx.getStorageSync('openid')
    })
    var url = app.globalData.Api + '/plate/getUserFocusPlate';
    var data = {
      openId: that.data.openId,
      targetOpenId: '',
      pageNum: 1,
      pageSize: 100
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        plateList: res.data.data,
      })
      for (var i = 0; i < that.data.plateList.length; i++) {
        if (that.data.focusPlate == that.data.plateList[i].plate.id) {
          that.setData({
            platevalue: that.data.plateList[i].plate.title,
            showsearch: false,
            noplate: false,
            hasplate: true,
            plateId: that.data.plateList[i].plate.id
          })
        } else {
          that.setData({
            noplate: true,
            hasplate: false
          })
        }
      }
    })
  },
  menuTap: function (e) {
    var that = this;
    that.setData({
      current: e.currentTarget.dataset.current
    })
    //改变menuTapCurrent的值为当前选中的menu所绑定的数据
    that.setData({
      selectTapCurrent: that.data.current,
    });
    if (that.data.current == 0) {
      that.data.flag = 1
      that.setData({
        bindtrans: true
      })
    } else{
      that.setData({
        bindtrans: false
      })
    }
    if (that.data.current == 1) {
      that.data.flag = 2
      that.setData({
        bindlease: true
      })
    } else{
      that.setData({
        bindlease: false
      })
    }
    if (that.data.current == 2) {
      that.data.flag = 3
      that.setData({
        bindjoin: true
      })
    }else{
      that.setData({
        bindjoin: false
      })
    } 
     if(that.data.current == 3) {
      that.data.flag = 4
       that.setData({
         bindshop: true
       })
    } else {
       that.setData({
         bindshop: false
       })
    }
    if (that.data.current == 4){
      that.data.flag = 5
      that.setData({
        bargain: true
      })
    }else{
      that.setData({
        bargain: false
      })
    }
  },
  onaddPhoto: function (res) {
    var that = this;
    that.setData({
      popaddphoto: true,
      shade: true,
      addInput1: 1
    })
  },
  // 上传图片
  popphoto: function () {
    var that = this;
    var pics = that.data.pics;
    wx.chooseImage({
      count: 8,
      success: function (res) {
        var imgsrc = [];
        imgsrc = res.tempFilePaths;
        pics = imgsrc.concat(pics);
        that.setData({
          pics: pics
        });
        that.upload();
      },
    })
    that.setData({
      popaddphoto: false,
      shade: false,
      addInput1: 0
    })
  },
  // 上传视频
  popvideo: function () {
    var that = this;
    wx.chooseVideo({
      success: function (res) {
        if (res.size > 20971520) {
          wx.showToast({
            title: '视频文件过大',
            image: '../../images/fail.png'
          })
        }
        else {
          var video = res.tempFilePath;
          that.setData({
            videosrc: video,
            isshowvideo: true,
          });
          wx.uploadFile({
            url: app.globalData.Api + '/oss/uploadVideo',
            filePath: res.tempFilePath,
            name: 'video',
            formData: null,//这里是上传图片时一起上传的数据
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: function (res) {
              console.log(res);
              var videosrc = JSON.parse(res.data).data;
              that.setData({
                vediourl: videosrc
              })
            }
          })
        }
      },
    })
    that.setData({
      popaddphoto: false,
      shade: false,
      addInput1: 0
    })
  },
  // 取消上传
  popcancel: function () {
    var that = this;
    that.setData({
      popaddphoto: false,
      shade: false,
      addInput1: 0
    })
  },
  // 删除该图片
  cuowu: function (e) {
    var that = this;
    var imgs = that.data.pics
    var current = e.currentTarget.id;
    imgs.splice(current, 1);
    that.setData({
      pics: imgs,
      imgurl3: []
    });
    that.upload();
  },
  upload: function () {
    var that = this;
    var pics = that.data.pics;
    if (that.data.pics.length > 0) {
      that.setData({
        hasPhotos: true
      })
    } else {
      that.setData({
        hasPhotos: false
      })
    }
    if (that.data.pics.length == 1) {
      wx.uploadFile({
        url: app.globalData.Api + '/oss/uploadImgs',
        filePath: pics[0],
        name: 'imgs',
        success: function (res) {
          var successurl = []
          successurl = JSON.parse(res.data).data;
          that.setData({
            imgurl3: that.data.imgurl3.concat(successurl)
          })
        }
      })
    } else {
      that.setData({
        imgurl3: []
      })
      for (var i = 0; i < that.data.pics.length; i++) {
        wx.uploadFile({
          url: app.globalData.Api + '/oss/uploadImgs',
          filePath: pics[i],
          name: 'imgs',
          success: function (res) {
            var successurl = []
            successurl = JSON.parse(res.data).data;
            that.setData({
              imgurl3: that.data.imgurl3.concat(successurl)
            })
          }
        })
      }
    }
  },

  // 获取title
  titleInput: function (e) {
    var that = this;
    that.setData({
      'unused.title': e.detail.value.replace(/\s+/g, '')
    })
  },
  // 获取内容值
  contentInput: function (e) {
    var that = this;
    that.setData({
      content: e.detail.value
    })
  },
  linkurl: function (e) {
    var that = this;
    that.setData({
      'unused.linkUrl': e.detail.value
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
      var url = app.globalData.Api + '/sms/sendSmsCode';
      var data = {
        phone: this.data.phoneNum
      }
      wxreq.postRequest(url, data).then(res => {
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
    that.setData({
      addInput1: 1
    })
    if (that.data.phoneNum && that.data.verify) {
      var url = app.globalData.Api + '/sms/checkSmsCode';
      var data = {
        phone: that.data.phoneNum,
        smsCode: that.data.verify
      }
      wxreq.postRequest(url, data).then(res => {
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
            addInput1: 0
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '验证码错误',
          })
        }
      })
    }
  },
  // 发布
  onrealese: function () {
    var that = this;
    if (wx.getStorageSync('isForbid') == 1) {
      wx.showModal({
        title: '提示',
        content: '您已被禁言',
      })
      return;
    } else {
      if (that.data.unused.title && that.data.plateId && that.data.imgurl3.length!=0) {
          if (that.data.flag == 1) {
            if (that.data.unused.classify == "") {
              wx.showModal({
                title: '提示',
                content: '请选择参数',
              })
            } else if (that.data.unused.newPrice == '' || that.data.unused.oldPrice == '') {
              wx.showModal({
                title: '提示',
                content: '请输入交易价格',
              })
            } else if (that.data.unused.newPrice == 0 || that.data.unused.oldPrice == 0) {
              wx.showModal({
                title: '提示',
                content: '交易价格不能为0',
              })
            } else {
              that.loadingTap();
              wx.request({
                url: app.globalData.Api + '/forumMark/addForumMark',
                data: {
                  flag: 1,
                  openId: that.data.openId,
                  plateId: that.data.plateId,
                  title: that.data.unused.title,
                  imgs: that.data.imgurl3,
                  content: that.data.content,
                  newPrice: that.data.unused.newPrice,
                  className: that.data.unused.classify,
                  oldPrice: that.data.unused.oldPrice,
                  linkUrl: that.data.unused.linkUrl,
                  videos: that.data.vediourl,
                  lat: that.data.forumlat + '',
                  lon: that.data.forumlon + '',
                  plateQQName: that.data.plateQQName,
                  plateQQAddress: that.data.plateQQAddress
                },
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                method: 'POST',
                fail: function (fres) {
                  that.loadingChange();

                  wx.showModal({
                    title: '提示',
                    content: '发布失败',
                  })
                },
                success: function (res) {
                  if (res.data.code == 0) {
                    that.getForumMark();
                  } else if (res.data.code == 500) {
                    that.loadingChange();

                    wx.showModal({
                      title: '提示',
                      content: '发布失败',
                    })
                  }
                }
              })
            }
          } else if (that.data.flag == 2 || that.data.flag == 3) {
            if (that.data.flag == 2 && that.data.unused.month == "") {
              wx.showModal({
                title: '提示',
                content: '请输入月租金',
              })
            } else if (that.data.flag == 2 && that.data.unused.join == "") {
              wx.showModal({
                title: '提示',
                content: '请选择租赁参数',
              })
            } else {
              that.loadingTap();

              wx.request({
                url: app.globalData.Api + '/forumMark/addForumMark',
                data: {
                  flag: that.data.flag,
                  openId: that.data.openId,
                  plateId: that.data.plateId,
                  title: that.data.unused.title,
                  imgs: that.data.imgurl3,
                  content: that.data.content,
                  className: that.data.unused.join,
                  oldPrice: that.data.unused.month,
                  linkUrl: that.data.unused.linkUrl,
                  videos: that.data.vediourl,
                  lat: that.data.forumlat+'',
                  lon: that.data.forumlon+'',
                  plateQQName: that.data.plateQQName,
                  plateQQAddress: that.data.plateQQAddress
                },
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                method: 'POST',
                fail: function (fres) {

                  that.loadingChange();

                  wx.showModal({
                    title: '提示',
                    content: '发布失败',
                  })
                },
                success: function (res) {
                  if (res.data.code == 0) {
                    that.getForumMark();
                    // that.menuTap();
                  } else if (res.data.code == 500) {
                    wx.showModal({
                      title: '提示',
                      content: res.data.msg,
                    })
                  }
                }
              })
            }
          }else if(that.data.flag == 4) {
            if (that.data.unused.dates==''){
              wx.showModal({
                title: '提示',
                content: '请选择过期日期',
              })
            } else if (that.data.unused.time1==''){
              wx.showModal({
                title: '提示',
                content: '请选择过期时间',
              })
            } else if (that.data.unused.classify == "") {
              wx.showModal({
                title: '提示',
                content: '请选择参数',
              })
            }else{
              that.loadingTap();
              var time = '',
                time = that.data.unused.dates + " " + that.data.unused.time1 + ":00"
              wx.request({
                url: app.globalData.Api + '/forumMark/addForumMark',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                method: 'POST',
                data: {
                  flag: that.data.flag,
                  openId: that.data.openId,
                  plateId: that.data.plateId,
                  title: that.data.unused.title,
                  imgs: that.data.imgurl3,
                  content: that.data.content,
                  videos: that.data.vediourl,
                  updateTime: time,
                  className: that.data.unused.classify,
                  lat: that.data.forumlat+'',
                  lon: that.data.forumlon+'',
                  plateQQName: that.data.plateQQName,
                  plateQQAddress: that.data.plateQQAddress
                },
                fail: function (fres) {

                  that.loadingChange();

                  wx.showModal({
                    title: '提示',
                    content: '发布失败',
                  })
                },
                success: function (res) {
                  if (res.data.code == 0) {
                    that.getForumMark();
                    // that.menuTap();
                  } else if (res.data.code == 500) {
                    wx.showModal({
                      title: '提示',
                      content: res.data.msg,
                    })
                  }
                }
              })
            }
          }
        } else {
          if (!that.data.plateId) {
            wx.showModal({
              title: '提示',
              content: '请选择你要发布的位置',
            })
          }else if (that.data.imgurl3.length == 0) {
            wx.showModal({
              title: '提示',
              content: '请添加至少一张图片',
            })
          } else if (!that.data.unused.title || that.data.unused.title==' ') {
            wx.showModal({
              title: '提示',
              content: '请输入发布标题',
            })
          }
        }
    }
  },
  // 提交formid
  submit: function(e) {
    var that = this;
    that.setData({
      formId: e.detail.formId
    })
  },
  getForumMark: function () {
    var that = this;
    if (that.data.formId !== that.data.userformId){
      var url = app.globalData.Api + '/user/updateUser';
      var data={
        openId: that.data.openId,
        formid: that.data.formId
      }
      wxreq.postRequest(url, data).then(res => {
        console.log(res);
      })
    }
    var url = app.globalData.Api + "/forumMark/getForumMarkList";
    var data = {
      flag: that.data.flag,
      pageNum: 1,
      pageSize: 5
    }
    wxreq.postRequest(url, data).then(res => {
      that.loadingChange();
      for (let i = 0; i < res.data.forumMarks.length; i++) {
        that.setData({
          publishArr: res.data.forumMarks[0],
        });
      }
      wx.redirectTo({
        url: '/pages/infomodel/infomodel?data=' + [that.data.publishArr.forumId, that.data.flag]
      })
      wx.setStorageSync('flag', true);
      wx.setStorageSync('join', "");
      wx.setStorageSync('classify', "");
    }).catch(res=>{
      that.loadingChange();
      wx.showModal({
        title: '提示',
        content: '发布失败',
      })
    })
  },
  // 二手交易分类参数
  onClassify: function (res) {
    var that = this;
    wx.navigateTo({
      url: '/pages/publish/classChoose/classChoose',
    });
  },
  // 房屋租赁参数
  lease: function (res) {
    var that = this;
    wx: wx.navigateTo({
      url: '/pages/publish/parameter/parameter',
    })
  },
  // 隐藏月输入价格
  prihide: function () {
    var that = this;
    if (this.data.unused.month<=0){
      wx.showModal({
        title: '提示',
        content: '请输入正确价格',
      })
      return false;
    }
    that.setData({
      shade: false,
      monthprice: false,
      addInput1: 0
    })
  },
  // 删除该视频
  delvideo: function () {
    var that = this;
    that.setData({
      isshowvideo: false
    });
  },
  // 获取输入想卖的价钱
  // newprice: function (e) {
  //   var that = this;
  //   console.log(e)
  //   that.setData({
  //     'unused.newPrice': e.detail.value,
  //   });
  //   console.log(that.data.unused.newPrice)
  // },
  onNewPrice: function(){
    var that = this;
    that.setData({
      showKeyboard: !that.data.showKeyboard
    })
  },
  onoldprice: function(e){
    var that = this;
    that.setData({
      showKeyboard: !that.data.showKeyboard
    })
  },
  // 获取输入的原价
  // oldprice: function (e) {
  //   var that = this;
  //   that.setData({
  //     'unused.oldPrice': e.detail.value
  //   })
  //   var halfOldprice = Math.round(that.data.unused.oldPrice / 2);
  //   that.setData({
  //     halfOldprice: halfOldprice
  //   })
  // },
  Another: function(){
    var that = this;
    that.setData({
      showKeyboard: !that.data.showKeyboard
    })
  },
  // 输入价格
  inputPrice: function () {
    this.setData({
      onkeyboard: true,
      addInput1: 1
    })
  },
  // 获取输入的月租金
  month: function (e) {
    var that = this;
    that.setData({
      'unused.month': e.detail.value,
    })
  },
  // 显示月租金
  monthPrice: function () {
    var that = this;
    that.setData({
      monthprice: true,
      shade: true,
      addInput1: 1
    })
  },
  // 发布截止日期
  bindDateChange: function(e){
    console.log(e);
    this.setData({
      'unused.dates': e.detail.value
    })
  },
  // 发布截止时间
  bindTimeChange: function(e){
    this.setData({
      'unused.time1': e.detail.value
    })
  },
  onShow() {
    var that = this;
    if (wx.getStorageSync('publishcity')){
      that.setData({
        cityname: wx.getStorageSync('publishcity')
      })
    }
    if (wx.getStorageSync('classify')) {
      that.setData({
        'unused.classify': wx.getStorageSync('classify'),
      })
    } 
    if (wx.getStorageSync('join')) {
      that.setData({
        'unused.join': wx.getStorageSync('join'),
      })
    } 
  },
  switchBoard: function (e) {
    var that = this;
    if (that.data.unused.oldPrice == '') {
      wx.showModal({
        title: '提示',
        content: '请正确输入该物品原价',
      })
      that.setData({
        onkeyboard: true,
        addInput1: 1
      })
    } else if (that.data.unused.newPrice == undefined || that.data.unused.newPrice == '') {
      wx.showModal({
        title: '提示',
        content: '请正确输入想卖的价钱',
      })
      that.setData({
        onkeyboard: true,
        addInput1: 1,
        isShowfocus1: true,
        isShowfocus: false
      })
    }
    else {
      that.setData({
        onkeyboard: false,
        addInput1: 0,
      })
    }
  }
})