//index.js
//获取应用实例
const api = require("../../utils/util.js");
var template = require('../../pages/tabBar/tabBar.js');
const wxreq = require("../../utils/wxRequest.js");
const app = getApp()
Page({
  data: {
    list: [
      {
        name:'全部',
      },
      {
        name: '拼团',
      },
      {
        name: '租房',
      },
      {
        name: '闲置',
      },
      {
        name: '求助',
      },
    ],
    line: {
      width: 40,
      left: 0,
      oldActive: 0,
      swipeIndex: 0,
      scrLeft: 0,
      timeOut: ''
    },
    scrollHeight: 0,
    getopenid: '', // 本人的open
    n: 2,
    iszhankaiHuiShow: true,
    iszhankaiBaiShow: false,
    iszhedieHuiShow: true,
    iszhedieBaiShow: false,
    listArr: [],
    publicTime: '', // 发布时间
    loadingShow: true, // 加载是否显示
    item: '公告栏',
    flag: '',
    noticeListArr: [], //公告栏消息
    forumNoticesList: [],// 公告信息列表
    showsearch: false,  // 搜索附近位置
    plateList: [], // 附近位置列表
    name: '',
    plateId: '', // 位置id
    latitude: '', // 附近位置的纬度
    longitude: '', // 用户附近位置的经度
    showList: true,
    showplate: true,
    showreview: false, // 显示审核弹框
    showApplication: false,
    pageList:[] , // 引导页列表
    showguide: false,  //是否展示引导页
    // myfollowplate: false,
    followPlateList: [], // 已关注位置列表
    city: '',  // 用户城市
    transfer: false, // 显示转让
    rent: false,  // 显示出租
    group: false, // 显示成团
    expire: false, // 显示过期
    posinput: '',// 申请位置的名称
    phoneinput: '', // 申请位置的电话
    newprice:false,
    oldprice:false,
    getuser:false,
    isForbid:'', // 是否禁言
    nolease: false,
    plateValue: '',
    plateNum: '',
    showmask: false,
    formId: '',
    nopubish: false,
    redPacket: '',
    cityname: '',
    platename: '',
    clientHeight: '',
    menuTapCurrent: 0,
    winHeight: "",//窗口高度
    scrollLeft: 0, //tab标题的滚动条位置
    scrollTop: 0,
  },
  onLoad: function (option) {
    template.tabbar("tabBar", 0, this)//0表示第一个tabbar
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });
    that.lineInfo(0);
    wx.setStorageSync('flag', false);
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        if (!wx.getStorageSync('lon')) {
          that.setData({
            showmask: true
          })
        }
        if (res.latitude == wx.getStorageSync('lat') && res.longitude == wx.getStorageSync('lon')) {
        } else {
          wx.setStorageSync('lat', res.latitude);
          wx.setStorageSync('lon', res.longitude);
        }
        var url = app.globalData.Api + '/plate/getCityNameByTencentPoi';
        var data = {
          location: wx.getStorageSync('lat') + ',' + wx.getStorageSync('lon'),
        }
        wxreq.postRequest(url, data).then(res => {
          wx.setStorageSync('city', res.data.data);
          if (that.data.cityname) {
            that.setData({
              cityname: that.data.cityname
            })
          } else {
            that.setData({
              cityname: option.cityname ? option.cityname : res.data.data
            })
          }
          that.getOpId();
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '是否授权当前位置',
          content: '请确认授权淘比邻知悉您的地理信息，以为您直接跳转所在城市首页',
          success: function (res) {
            if (res.cancel) {
              that.onLoad();
            } else if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  if (res.authSetting["scope.userLocation"] == false) {
                    that.onLoad();
                  } else {
                    wx.getLocation({
                      success: function (res) {
                        // 将经度纬度存储到本地缓存
                        wx.setStorageSync('lat', res.latitude);
                        wx.setStorageSync('lon', res.longitude);
                        var url = app.globalData.Api + '/plate/getCityNameByTencentPoi'
                        var data = {
                          location: wx.getStorageSync('lat') + ',' + wx.getStorageSync('lon'),
                        }
                        wxreq.postRequest(url, data).then(res => {
                          wx.setStorageSync('city', res.data.data);
                          that.setData({
                            cityname: option.cityname ? option.cityname : res.data.data
                          })
                          that.getOpId();
                        })
                      },
                    })
                  }
                }
              });
            }
          }
        })
      }
    })
  },
  //滑屏
  swipeChange: function (res) {
    var _this = this;
    if (res.detail.source == 'touch') {
      if (_this.data.line.timeOut) { clearTimeout(_this.data.line.timeOut) }
      _this.data.line.timeOut = setTimeout(function () {
        _this.lineInfo(res.detail.current, true)
      }, 10)
    }
  },
  //选项卡切换
  lineInfo: function (even, type) {
    var _this = this;
    var index = even >= 0 ? even : even.currentTarget.id;
    index = parseInt(index);
    console.log('index'+index);
    wx.getSystemInfo({
      success: function (info) {
        wx.createSelectorQuery().selectAll('.tabBtn').boundingClientRect(function (rect) {
          wx.createSelectorQuery().select('#tabButtonAll').scrollOffset(function (res) {
            var WinWidth = info.windowWidth;
            var width = rect[index].width;
            var left = rect[index].left;
            var scrLeft = res.scrollLeft;
            _this.setData({ 'line.width': width, 'line.left': left + scrLeft })
            if (_this.data.line.oldActive == index) {
            } else if (_this.data.line.oldActive < index) {
              if (left + width + (WinWidth / 750 * 72) > WinWidth) {
                _this.setData({ 'line.scrLeft': rect[index - 3].left + scrLeft })
              }
            } else {
              console.log(left)
              console.log(scrLeft)
              if (scrLeft > left + scrLeft - (WinWidth / 750 * 72)) {
                var i = index - 1 > 0 ? rect[index - 1].left + scrLeft : 0;
                _this.setData({ 'line.scrLeft': i })
              }
            }
            if (!type) {
              _this.setData({ 'line.swipeIndex': index })
            }
            _this.setData({ 'line.oldActive': index })
          }).exec()
        }).exec()
      }
    })
    _this.setData({
      flag: 2,
      n: 2
    });
    if (index == 3) {
      _this.data.flag = 1
    } else if (index == 2) {
      _this.data.flag = 2
    } else if (index == 4) {
      _this.data.flag = 3
    } else if (index == 1) {
      _this.data.flag = 4
    } else if (index == 0) {
      _this.data.flag = ''
    }
    _this.data.city = wx.getStorageSync('city');
    _this.searchEverymodal();
  },
  // 切换
  tongCheng: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
      this.setData({
        menuTapCurrent: current,
        flag: 2,
        n: 2
      });
      if (current == 3) {
        that.data.flag = 1
      } else if (current == 2) {
        that.data.flag = 2
      } else if (current == 4) {
        that.data.flag = 3
      } else if (current == 1) {
        that.data.flag = 4
      } else if (current == 0) {
        that.data.flag = ''
      }
      that.data.city = wx.getStorageSync('city');
      that.searchEverymodal();
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.menuTapCurrent > 5) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  // 到首页该位置
  // toplateDetail: function (e) {
  //   var that = this;
  //   wx.getLocation({//获取当前经纬度
  //     type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息  
  //     success: function (res) {
  //       wx.openLocation({//​使用微信内置地图查看位置。
  //         latitude: Number(res.latitude),//要去的纬度-地址
  //         longitude: Number(res.longitude),//要去的经度-地址
  //         name: that.data.infoArr.plateName,
  //         address: that.data.infoArr.plateName
  //       })
  //     }
  //   })
  // },
  getUserInfo:function(){
    var that = this;
    var url = app.globalData.Api + '/user/getUserInfo';
    var data = {
      openId: that.data.getopenid
    }
    wxreq.postRequest(url,data).then(res => {
      if (res.data.code !== 0) {
        that.setData({
          getuser: true,
        })
      } else {
        wx.setStorageSync('nickName', res.data.data[0].nickname);
        wx.setStorageSync('isForbid', res.data.data.isForbid);
        that.updateTime();
        if (res.data.data[0].activeAddress == null) {
          var url = app.globalData.Api + '/user/updateUser'
          var data = {
            openId: that.data.getopenid,
            activeAddress: that.data.city
          }
          wxreq.postRequest(url, data).then(res => {
            if (res.data.code == 0) {
              console.log(res);
            }
          })
        }
      }
    }).catch(err=>{
      cnsole.log(err)
    })
  },
  onGotUserInfo: function (res) {
    var that = this;
    if (res.detail.errMsg == "getUserInfo:ok") {
      wx.setStorageSync('personInfo', res.detail.rawData);
      that.setData({
        getuser: false,
        personInfo: res.detail.rawData
      })
      if (that.data.getopenid==undefined){
        return;
      }else{
        that.addUser(); 
      }
    }else {
      wx.showModal({
        title: '提示',
        content: '你拒绝了授权',
      })
    }
  },
  // 添加用户接口
  addUser: function () {
    var that = this;
    // 调用添加用户信息接口
    var personal = JSON.parse(that.data.personInfo);
    var url = app.globalData.Api + "/user/addUser";
    var data = {
      openId: that.data.getopenid,
      nickname: personal.nickName,
      avatar: personal.avatarUrl,
      sex: personal.gender,
      province: personal.province,
      country: personal.country,
    }
    wxreq.postRequest(url, data).then(res => {
      if(res.data.code==0){
        that.getUserInfo();
      }else{
        wx.showModal({
          title: '提示',
          content: res.data.msg,
        })
      }
    })
  },
  // 调用获取openid接口
  getOpId: function () {
    var that = this;
    wx.login({
      success: function (res) {
        // 用code获取openid
        var url = app.globalData.Api + "/user/getOpenId";
        var data = {
          code: res.code
        }
        wxreq.postRequest(url, data).then(res => {
          // 将openid存储到本地缓存
          that.setData({
            getopenid: res.data.openId
          });
          wx.setStorage({
            key: 'openid',
            data: that.data.getopenid
          });
          that.toweizhi();
          that.searchPlateByUserLocation();
          that.getNoticeList();
          that.searchEverymodal();
        })
      },
    });
  },
  cancelMask() {
    var that = this;
    that.setData({
      showmask: false
    })
  },
  // 用户的最后登陆时间
  updateTime() {
    var that = this;
    var time = api.formatTime(new Date()); 
    if(time){
      var url = app.globalData.Api + "/user/updateLastTimeByOpenId";
      var data = { openId: that.data.getopenid }
      wxreq.postRequest(url, data).then(res => {
        console.log(res);
      })
    }
  },
  input1:function(e){
    var that = this;
    that.onsearch(e.detail.value);
  },
  confirm1:function(e){
    var that = this;
    this.onsearch(e.detail.value);
  },
  // 根据标题模糊搜索
  onsearch: function(e){
    var that = this;
    if(e==''){
      that.searchPlateByUserLocation();
      return; 
    }
    var url = app.globalData.Api + "/plate/seletByUserNearLocation";
    var data = {
      openId: that.data.getopenid,
      name: e,
      pageNum: 1,
      pageSize: 10,
      city: that.data.city,
      lat: wx.getStorageSync('lat'),
      lng: wx.getStorageSync('lon'),
    }
    wxreq.postRequest(url, data).then(res => {
      if(res.data.code==0){
        for (var i = 0; i < res.data.data.length; i++) {
          console.log(res.data.data[i].plate.distance);
          res.data.data[i].plate.distance = (res.data.data[i].plate.distance / 1000).toFixed(2);
          console.log(res.data.data[i].plate.distance);
          if (res.data.data[i].isFocus == 1) {
            res.data.data[i].onfocus = false;
            res.data.data[i].nonfocus = true;
          } else if (res.data.data[i].isFocus == 0) {
            res.data.data[i].onfocus = true;
            res.data.data[i].nonfocus = false;
          }
        }
        that.setData({
          plateList: res.data.data,
        })
      }
      if (that.data.plateList.length == 0) {
        that.setData({
          showApplication: true
        })
      } else {
        that.setData({
          showApplication: false
        })
      }
    }) 
  },
  // 公告信息列表(单个)
  getNoticeList: function () {
    var that = this;
    var url = app.globalData.Api + "/forumMark/getForumNoticeList";
    var data = {
      pageNum: 1,
      pageSize: 10,
      plateName: that.data.cityname,
      isHomePage: true
    }
    wxreq.postRequest(url, data).then(res => {
      var nla = new Array();
      for (var i = 0; i < res.data.forumNotices.length; i++) {
        var strImgs = res.data.forumNotices[i].content;
        that.setData({
          forumNoticesList: res.data.forumNotices
        })
        nla[i] = strImgs;
      }
      that.setData({
        noticeListArr: nla
      });
    }).catch(err=>{
      console.log(err);
    })
  },

  // 跳到search搜索关注附近位置
  tosearch: function(){
    var that = this;
    // that.searchPlateByUserLocation();
    that.setData({
      showsearch: true,
      showApplication: false
    })
  },
  // 跳到城市列表
  tocitylist: function () {
    wx.navigateTo({
      url: '/pages/cityList/cityList?page=index',
    })
  },
  // 跳到首页
  toweizhi: function(){
    var that = this;
    that.getFocusPlate();
    that.setData({
        showsearch: false,
        showList: true,
        showApplication: false,
        showreview:false,
    })
  },
  // 点击该位置搜索该位置
  choosePlate:function(e){
    var that = this;
    var id = e.currentTarget.id
    that.setData({
      plateValue: that.data.plateList[id].plate.title,
      plateNum: that.data.plateList[id].plate.focusnumber,
      showsearch: false,
      latitude: that.data.plateList[id].plate.lat,
      longitude: that.data.plateList[id].plate.lng
    })
    that.searchEverymodal();
  },
  followPlate: function(e) {
    var that = this;
    var id = e.currentTarget.id
    that.setData({
      plateValue: that.data.followPlateList[id].plate.title,
      plateNum: that.data.followPlateList[id].plate.focusnumber,
      showsearch: false,
      latitude: that.data.followPlateList[id].plate.lat,
      longitude: that.data.followPlateList[id].plate.lng
    })
    that.searchEverymodal();
  },
  // 点击关注
  isFocus: function(e){
    var that = this;   
    var id = e.currentTarget.dataset.current;
    if (that.data.plateId==""){
      that.setData({
        plateId: that.data.plateList[0].plate.id
      })
    }
    for (var i = 0; i < that.data.plateList.length; i++) {
      if (i == id) {
        that.setData({
          plateId: that.data.plateList[i].plate.id
        })
      }
    }
    if (that.data.getopenid!==undefined){
      var url = app.globalData.Api + "/plate/focusPlate"
      var data = {
        openId: that.data.getopenid,
        plateId: that.data.plateId,
      }
      wxreq.postRequest(url,data).then(res=>{
        if(res.data.code==0){
          that.getFocusPlate();
          that.setData({
            showList: true,
            showguide: false
          })
          for (var i = 0; i < that.data.plateList.length; i++) {
            if (i == id) {
              that.setData({
                ['plateList[' + i + '].onfocus']: false,
                ['plateList[' + i + '].nonfocus']: true,
                plateId: that.data.plateList[id].plate.id
              })
            }
          }
        }
      }).catch(err => {
        console.log(err)
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '系统异常，请重试',
      })
      return;
    }
  },
  // 获取关注的位置
  getFocusPlate: function () {
    var that = this;
    var url = app.globalData.Api + "/plate/getUserFocusPlate";
    var data = {
      openId: that.data.getopenid,
      targetOpenId: "",
      pageNum: 1,
      pageSize: 100
    }
    wxreq.postRequest(url, data).then(res => {
      if(res.data.code==0){
        that.setData({
          followPlateList: res.data.data,
        })
      }
    }).catch(err=>{
      console.log(err);
    })
  },
  // 用户所在城市查询
  searchPlateByUserLocation: function () {
    var that = this;
    var url = app.globalData.Api + "/plate/seletByUserNearLocation";
    var data={
      openId: that.data.getopenid,
      lat: wx.getStorageSync('lat'),
      lng: wx.getStorageSync('lon'),
      pageNum: 1,
      pageSize: 10,
      city: that.data.cityname
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.data.length; i++) {
        res.data.data[i].plate.distance = (res.data.data[i].plate.distance / 1000).toFixed(2);
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
        plateValue: res.data.data[0].plate.title,
        plateList: res.data.data,
        plateNum: res.data.data[0].plate.focusnumber
      })
      wx.setStorageSync('plateValue', res.data.data[0].plate.title);
    })
    that.getUserInfo();
  },
  // 上拉加载函数
  onReachBottom: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var num = that.data.n;
    num = num + 1;
    var latitude = '';
    var longitude = '';
    if (that.data.latitude && that.data.longitude) {
      latitude = that.data.latitude;
      longitude = that.data.longitude
    } else {
      latitude = wx.getStorageSync('lat');
      longitude = wx.getStorageSync('lon')
    }
    var url = app.globalData.Api + "/forumMark/getForumMarkList";
    var data={
      flag: that.data.flag,
      plateId: '',
      pageNum: that.data.n,
      pageSize: 5,
      cityName: that.data.cityname,
      lat: latitude,
      lng: longitude,
      openId: that.data.getopenid
    }
    wxreq.postRequest(url, data).then(res => {
      wx.hideNavigationBarLoading() //完成停止加载

      for (var i = 0; i < res.data.forumMarks.length; i++) {
        res.data.forumMarks[i].distance = (res.data.forumMarks[i].distance / 1000).toFixed(2);
        if (res.data.forumMarks[i].flag == 4) {
          if (that.data.listArr[i].pastDue == true) {
            that.setData({
              ['listArr[' + i + '].yzr']: true,
            })
          }
        }
        if (res.data.forumMarks[i].flag == 3) {
          if (that.data.listArr[i].isDeal == 1) {
            that.setData({
              ['listArr[' + i + '].yzr']: true,
            })
          }
        }
        if (res.data.forumMarks[i].flag == 2) {
          res.data.forumMarks[i].hasoldpice = true
          if (that.data.listArr[i].isDeal == 1) {
            that.setData({
              ['listArr[' + i + '].yzr']: true,
            })
          }
        } else {
          res.data.forumMarks[i].hasoldpice = false
        }
        if (res.data.forumMarks[i].flag == 1) {
          res.data.forumMarks[i].hasnewprice = true
          if (that.data.listArr[i].isDeal == 1) {
            that.setData({
              ['listArr[' + i + '].yzr']: true,
            })
          }
        } else {
          res.data.forumMarks[i].hasnewprice = false
        }
        // 判断是不是本人发帖
        if (res.data.forumMarks[i].openId == that.data.getopenid) {
          res.data.forumMarks[i].isopenId = true
        } else {
          res.data.forumMarks[i].isopenId = false
        }
        if (res.data.forumMarks[i].className.length > 0) {
          var strClassNames = res.data.forumMarks[i].className;
          res.data.forumMarks[i].setClassNames = strClassNames.split(" ");
        }
        if (res.data.forumMarks[i].sex == 1) {
          res.data.forumMarks[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.forumMarks[i].sex == 0) {
          res.data.forumMarks[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        if (i == 2) {
          res.data.forumMarks[i].showad = true
        } else {
          res.data.forumMarks[i].showad = false
        }
        if (res.data.forumMarks[i].redPacket == null) {
          res.data.forumMarks[i].hasredPaper = true
        }
        res.data.forumMarks[i].yzr = false;
      }
      var dataListArr = res.data.forumMarks;
      if (res.data.forumMarks.length == 0) {
        return;
      }
      for (var i = 0; i < dataListArr.length; i++) {
        that.data.listArr.push(dataListArr[i]);
      }
      that.setData({
        listArr: that.data.listArr,
        n: num
      });
    }).catch(res=>{
      wx.hideNavigationBarLoading() //完成停止加载
    })
  },
  searchEverymodal: function(){
    var that = this;
    var latitude = '';
    var longitude = '';
    if (that.data.latitude && that.data.longitude) {
      latitude = that.data.latitude;
      longitude = that.data.longitude
    }else{
      latitude = wx.getStorageSync('lat');
      longitude = wx.getStorageSync('lon')
    }
    var url = app.globalData.Api + "/forumMark/getForumMarkList";
    var data={
      flag: that.data.flag,
      plateId: '',
      pageNum: 1,
      pageSize: 5,
      cityName: that.data.cityname,
      lat: latitude,
      lng: longitude,
      openId: wx.getStorageSync('openid')
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.forumMarks.length == 0) {
        that.setData({
          nopubish: true,
          showad: false
        })
      } else {
        that.setData({
          nopubish: false,
          showad: true
        })
      }
      for (var i = 0; i < res.data.forumMarks.length; i++) {
        res.data.forumMarks[i].distance = (res.data.forumMarks[i].distance / 1000).toFixed(2);
        if (res.data.forumMarks[i].flag == 4) {
          if (res.data.forumMarks[i].pastDue == true) {
            res.data.forumMarks[i].yzr = true
          }
        }
        if (res.data.forumMarks[i].flag == 3) {
          if (res.data.forumMarks[i].isDeal == 1) {
            res.data.forumMarks[i].yzr = true
          }
        }
        if (res.data.forumMarks[i].flag == 2) {
          res.data.forumMarks[i].hasoldpice = true
          if (res.data.forumMarks[i].isDeal == 1) {
            res.data.forumMarks[i].yzr = true
          }
        } else {
          res.data.forumMarks[i].hasoldpice = false
        }
        if (res.data.forumMarks[i].flag == 1) {
          res.data.forumMarks[i].hasnewprice = true
          if (res.data.forumMarks[i].isDeal == 1) {
            res.data.forumMarks[i].yzr = true
          }
        } else {
          res.data.forumMarks[i].hasnewprice = false
        }
        // 判断列表
        if (i == 2) {
          res.data.forumMarks[i].showad = true
        } else {
          res.data.forumMarks[i].showad = false
        }
        // 判断是不是本人发帖
        if (res.data.forumMarks[i].openId == that.data.getopenid) {
          res.data.forumMarks[i].isopenId = true
        } else {
          res.data.forumMarks[i].isopenId = false
        }
        if (res.data.forumMarks[i].className.length > 0) {
          var strClassNames = res.data.forumMarks[i].className;
          res.data.forumMarks[i].setClassNames = strClassNames.split(" ");
        }
        if (res.data.forumMarks[i].sex == 1) {
          res.data.forumMarks[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.forumMarks[i].sex == 0) {
          res.data.forumMarks[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        if (res.data.forumMarks[i].redPacket == null) {
          res.data.forumMarks[i].hasredPaper = true
        }
        res.data.forumMarks[i].yzr = false;
      }
      that.setData({
        loadingShow: false,
        listArr: res.data.forumMarks
      });
    })
  },
  toTop: function(e){
    this.setData({
      scrollTop: 0
    })
  },
  // 分享
  onShareAppMessage: function () {
    var that = this;
    return {
      // title: '拼团 | 租房 | 闲置 | 求助',
      title: wx.getStorageSync('nickName')+'@了你并给你发了一个红包 ',
      path: '/pages/index/index',
      // imageUrl:'/image/share.png'
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.searchPlateByUserLocation();
    //模拟加载
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 5000);
    that.setData({
      n: 2,
      loadingShow: true,
      // plateValue: wx.getStorageSync('plateValue'),
      latitude: wx.getStorageSync('lat'),
      longitude: wx.getStorageSync('lon'),
      cityname: wx.getStorageSync('city')
    });
    if (that.data.followPlateList.length == 0 && that.data.showcity == true) {
      that.setData({
        listArr: [],
        loadingShow:false
      })
    } else {
      that.searchEverymodal();
    }
    that.onLoad();
  },
  
  // 跳转到帖子的详细页面
  toInfoModel: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    if (that.data.listArr[id].redPacket!==null){
      wx.setStorageSync('redPacket', that.data.listArr[id].redPacket);
    }
    wx.navigateTo({
      url: '/pages/infomodel/infomodel?data=' + [that.data.listArr[id].forumId, that.data.listArr[id].flag, that.data.listArr[id].distance],
    });
  },

  // 有公告栏进入帖子详情
  tonoticeModel:function(e){
    var that = this;
    var id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/infomodel/infomodel?data=' + [that.data.forumNoticesList[id].forumId, that.data.forumNoticesList[id].flag],
    });
  },
  // 显示列表页
  showList: function() {
    var that = this;
    that.setData({
      showList: true,
      showplate: false,
      showsearch: false,
      showApplication: false
    })
  },
  // 显示审核弹框
  application: function() {
    var that = this;
    that.setData({
      showreview: true
    })
  },

  //我的关注
  // myfollowplate: function() {
  //   var that = this;
  //   if (that.data.followPlateList.length > 0) {
  //         that.setData({
  //           myfollowplate: true
  //         })
  //       } else if (that.data.followPlateList.length == 0) {
  //         that.setData({
  //           myfollowplate: false
  //       })
  //   }
  // },
  // 取消对已关注位置的关注
  cancelfollow: function(e){
    var id = e.target.dataset.current;
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消关注该位置吗',
      success: function (res) {
        if (res.confirm) {
          var url = app.globalData.Api + '/plate/focusPlate';
          var data = {
            openId: that.data.getopenid,
            plateId: that.data.followPlateList[id].plate.id
          }
          wxreq.postRequest(url, data).then(res => {
            that.getFocusPlate();
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    }) 
  },
  toshopDetail:function(e){
    var that = this;
    var id = e.currentTarget.id;
    for(var i=0;i<that.data.listArr.length;i++){
      if(i==id){
        wx.navigateTo({
          url: '/pages/shopping/shoppingList/shoppingList?openId='+that.data.listArr[i].openId,
        })
      }
    }
  },
  // platecancel:function(){
  //   var that = this;
  //   that.setData({
  //     myfollowplate: false
  //   })
  // },
  positioninput: function(e){
    var that=this;
    var posinput=e.detail.value;
    that.setData({
      posinput: posinput
    })
  },
  phoneinput: function(e){
    var that = this;
    var phoneinput = e.detail.value;
    that.setData({
      phoneinput: phoneinput
    })
  },
  toApply: function(){
        var that =  this;
        that.searchPlateByUserLocation();
        that.setData({
          showApplication: false,
          showreview: false,
          showList: true,
          showsearch: false,
        })
  },
  onShow:function(){
    var that = this;
    if(wx.getStorageSync('flag')==true){
      that.onLoad();
      wx.setStorageSync('flag',false);
    }
    if (wx.getStorageSync('redPacket')!==null){
      wx.setStorageSync('redPacket', null)
    }
  }
})