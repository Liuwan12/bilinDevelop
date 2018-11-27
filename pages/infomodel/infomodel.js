//index.js
//获取应用实例
var interval = null;
const api = require("../../utils/util.js");
const wxreq = require("../../utils/wxRequest.js");
const qqmap = require('../../utils/map.js');
const app = getApp()
Page({
  data: {
    tids: ['adunit-edac615734196277', 'adunit-0e25cd0cdd6e014c', 'adunit-67e49b2c9f8dd72c', 'adunit-b658d3a4503b3bb2'],
    redErrorText: '',
    moneyVal:'',
    moneyVals: '0.00',
    isMoney: false,
    isNum: false,
    isRedNum: '',
    redNum: '', // 输入的红包个数
    myOpenid: '', // 本人openid
    infoArr: [], // 帖子基本信息
    tieziId: '', // 帖子Id
    tieziFlag: '', //帖子Flag
    posterName: '', // 发帖人姓名
    n: 2, // 分页页码
    userIsPoster: false, //是否是发帖人
    isFristComment: false, // 抢沙发是否显示
    imgs: [],  // 图片信息
    commonMsgs: [], // 常用留言
    LVOneValue: '', // 输入的评论内容
    replayArr: [], // 得到的评论列表
    parentId: 0, // 回复的评论的id
    otherPeopleOpenid: '',
    NoSc: true,
    Sc: false,
    showPopBG: false, //是否显示pop背景层
    showPhoneNum: false, // 是否展示卖家电话
    showInputBar: false, // 是否显示输入工具栏
    hideInputBar: false,
    classDatas: [],
    state: '',
    transfer: '', // 显示闲置
    rent: '',  // 显示出租
    group: '', // 显示求助
    shop: '', // 显示优惠信息
    showvideo: true,
    formid: '',
    threeImage: false, //大于三张图片显示
    similarList: '', // 相似推荐列表
    hasSimilar: false,
    commentformId: '',
    replyOpenId: '', // 被回复人的openid
    showRedPaper: false, // 是否展示塞红包界面
    // 输入的红包参数
    oneMoney: '', // 输入的单个金额
    redTime: '', // 输入的拆红包时长
    isGetRed: false,//是否抢过红包
    money: '0.00', // 红包金额
    showRedDeal: false,
    redPacket: '',
    redpacket: '',
    countdown: 0,
    countTime: 0,
    redDeal: '',
    hasredpaper: '',
    token: '', // 抢红包凭证
    redid: '',
    hasRedPapers: '',// 已抢到红包
    replyNickName: '', //被回复人的姓名
    hidden: true,// 是否显示加载中
    length: 4,
    distance: '',
    getuser: false,
    redpaperTime: false, // 抢红包时间,
    lat: '',
    lon: '',
    noGetRed: false,
    redjiePackets: ''// 红包详情
  },
  onLoad: function (option) {
    var that = this;
    if (option && option.data) {
      let dataArr = option.data.split(',');

      that.setData({
        tieziId: dataArr[0],
        tieziFlag: dataArr[1],
        distance: dataArr[2]
      });
    }
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        if (res.latitude && res.longitude) {
          that.setData({
            latitude: Number(res.latitude),
            longitude: Number(res.longitude)
          })
          that.getOpId();
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '是否授权当前位置',
          content: '需要获取您的地理位置，请确认授权，否则淘比邻将无法使用',
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
                        that.setData({
                          latitude: res.latitude,
                          longitude: res.longitude
                        })
                        that.getOpId();
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
  getOpId: function () {
    var that = this;
    // 获取本地缓存中的本人openid
    that.setData({
      myOpenid: wx.getStorageSync('openid'),
      redPacket: wx.getStorageSync('redPacket')
    })
    var url = app.globalData.Api + '/red/getToken';
    var data = {
      openid: that.data.myOpenid,
      forumid: parseInt(that.data.tieziId),
      lat: that.data.latitude,
      lng: that.data.longitude,
    }
    wxreq.getRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.setData({
          token: res.data.data,
          hasredpaper: true,
          hasRedPapers: false,
          redpaperTime: true
        })
      } else if (res.data.msg == '用户已经抢过该红包') {
        that.setData({
          isGetRed: true,
          redpaperTime: false,
          hasredpaper: false,
          hasRedPapers: true
        })
      } else if (res.data.msg == '红包不存在') {
        that.setData({
          hasRedPapers: false,
          hasredpaper: false,
        })
      }
    })

    if (that.data.distance !== undefined) {
      that.data.distance = (that.data.distance / 1000).toFixed(2);
      that.setData({
        latitude: "",
        longitude: ""
      })
    }
    that.addLookNum();
    that.isCollectioned();
    that.getTieziInfo();
    that.getComment();
    that.getCommonMsgs();
    that.getUserInfo();
  },
  getUserInfo: function () {
    var that = this;
    var url = app.globalData.Api + '/user/getUserInfo';
    var data = { openId: that.data.myOpenid }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code !== 0) {
        that.setData({
          getuser: true,
        })
      } else {
        that.setData({
          formId: res.data.data[0].formid
        })
        wx.setStorageSync('nickName', res.data.data[0].nickname);
        wx.setStorageSync('isForbid', res.data.data.isForbid);
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
      if (that.data.myOpenid == undefined) {
        return;
      } else {
        that.addUser();
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '你拒绝了授权',
      })
    }
  },
  addUser: function (res) {
    var that = this;
    // 调用添加用户信息接口
    var personal = JSON.parse(that.data.personInfo);
    var url = app.globalData.Api + "/user/addUser";
    var data = {
      openId: that.data.myOpenid,
      nickname: personal.nickName,
      avatar: personal.avatarUrl,
      sex: personal.gender,
      province: personal.province,
      country: personal.country,
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.getUserInfo();
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
        })
      }
    })
  },
  // 提示语
  hasRedPapers: function () {
    var that = this;
    wx.showToast({
      title: '请戳左下角帮我转发群，让更多的人关注我的信息并得到我的感谢',
      icon: 'none',
      duration: 2000,
    })
  },
  // 显示抢红包界面
  toDeal: function () {
    var that = this;
    if (that.data.isGetRed) {
      wx.showModal({
        title: '提示',
        content: '您已成功参与过这个红包接龙，赶快转发继续红包接龙吧',
      })
      return;
    }
    if (that.data.redDeal == true) {
      that.setData({
        showRedDeal: true
      })
    }
  },
  // 抢红包
  LootRed: function () {
    var that = this;
    if (that.data.token) {
      that.loadingTap();
      var url = app.globalData.Api + '/red/graRedPacket';
      var data = {
        openid: that.data.myOpenid,
        forumid: parseInt(that.data.tieziId),
        redid: that.data.redid,
        token: that.data.token
      }
      wxreq.postRequest(url, data).then(res => {
        if (res.data.code == 0) {
          that.loadingChange();
          wx.showModal({
            title: '提示',
            content: `恭喜获得接龙红包￥${res.data.data}元,已为您存入微信钱包，赶快转发继续红包接龙吧`,
            success: function (res) {
              if (res.confirm) {
                that.onLoad();
              }
              that.setData({
                showRedDeal: false
              })
            }
          })
        } else if (res.data.msg == '抢红包失败:余额不足') {
          that.loadingChange();
          wx.showToast({
            title: '对不起，这个红包接龙已经被抢完了，赶快新发起红包接龙吧',
            icon: "none"
          })
          that.setData({
            showRedDeal: false
          })
          that.onLoad();
        } else if (res.data.msg == '无效的请求') {
          that.loadingChange();
          wx.showToast({
            title: '别着急，刷新一下再试试吧',
            icon: "none"
          })
          that.setData({
            showRedDeal: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
          that.setData({
            showRedDeal: false
          })
        }
      })
    } else {

    }
  },
  // 判断当前是否为自己发布的帖子
  getUserIsPoster: function () {
    var that = this;
    if (that.data.myOpenid == that.data.infoArr.openId) {
      this.setData({
        userIsPoster: true,
      });
    }
    else {
      this.setData({
        userIsPoster: false,
      });
    }
  },
  // 获取帖子详情
  getTieziInfo: function () {
    var that = this;
    var url = app.globalData.Api + "/forumMark/getForumMarkVO";
    var data={
      forumId: parseInt(that.data.tieziId),
      pageNum: 1,
      pageSize: 5,
      lat: wx.getStorageSync('lat'),
      lng: wx.getStorageSync('lon'),
      mylat: that.data.latitude,
      mylng: that.data.longitude,
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        redpacket: res.data.data.redPacket,
        redjiePackets: res.data.data.redjielongPackets
      })
      clearInterval(interval);
      if (res.data.data.redPacket !== null) {
        that.setData({
          countdown: res.data.data.redPacket.time,
          countTime: res.data.data.redPacket.time,
          redid: res.data.data.redPacket.id
        })
        interval = setInterval(function () {
          that.setData({
            countTime: that.data.countdown--
          });
          if (that.data.countTime <= 0) {
            clearInterval(interval);
            // 抢红包状态
            that.setData({
              redDeal: true,
              redpaperTime: false
            })
          }
        }, 1000);
      }
      if (res.data.data.distance !== null) {
        res.data.data.distance = (res.data.data.distance / 1000).toFixed(2);
        that.setData({
          distance: res.data.data.distance
        })
      }
      if (res.data.data.className !== "") {
        that.setData({
          classDatas: res.data.data.className.split(" "),
        })
      }
      that.setData({
        imgs: res.data.data.imgs.split(","),
        posterName: res.data.data.nickName
      });
      if (that.data.imgs.length > 1) {
        that.setData({
          threeImage: true
        })
      } else {
        that.setData({
          threeImage: false
        })
      }
      if (res.data.data.sex == 1) {
        res.data.data.sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
      } else if (res.data.data.sex == 0) {
        res.data.data.sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
      }
      res.data.data.createTime = api.changeTime(res.data.data.createTime);
      that.setData({
        infoArr: res.data.data,
        // Firimage: that.data.imgs[0]
      });
      if (!that.isInArray(that.data.infoArr.grabRedUser, that.data.myOpenid) && that.data.infoArr.grabRedUser.length > 0) {
        that.setData({
          noGetRed: true
        })
      } else {
        that.setData({
          noGetRed: false
        })

      }
      if (that.data.infoArr.lookNum == 1) {
        that.setData({
          showRedPaper: true,
          addInput1: 1 // 视频是否挡页面
        })
      } else {
        that.setData({
          addInput1: 0
        })
      }
      if (that.data.infoArr.similarForum.length > 0) {
        for (var i = 0; i < that.data.infoArr.similarForum.length; i++) {
          if (that.data.infoArr.similarForum[i].className.length > 0) {
            var strClassNames = that.data.infoArr.similarForum[i].className;
            that.data.infoArr.similarForum[i].setClassNames = strClassNames.split(" ");
            if (that.data.infoArr.similarForum[i].setClassNames.length > 3) {
              that.data.infoArr.similarForum[i].setClassNames = that.data.infoArr.similarForum[i].setClassNames.slice(0, 3);
            }
          }
          if (that.data.infoArr.similarForum[i].sex == 1) {
            that.data.infoArr.similarForum[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
          } else if (that.data.infoArr.similarForum[i].sex == 0) {
            that.data.infoArr.similarForum[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
          }
          // 判断是否有红包
          if (that.data.infoArr.similarForum[i].redPacket == null) {
            that.data.infoArr.similarForum[i].hassimredPaper = true
          }
          // 判断加不加广告
          if (i == 2) {
            that.data.infoArr.similarForum[i].showad = true
          } else {
            that.data.infoArr.similarForum[i].showad = false
          }
        }
        that.setData({
          similarList: that.data.infoArr.similarForum,
          hasSimilar: true,
        })
      }
      that.getUserIsPoster();
    })
  },
  isInArray: function (arr, value) {
    if (arr.indexOf && typeof (arr.indexOf) == 'function') {
      var index = arr.indexOf(value);
      if (index >= 0) {
        return true;
      }
    }
    return false;
  },
  onReady: function () {
    this.videoContext = wx.createVideoContext("myvideo");
  },
  playPause: function (e) {
    var that = this;
    this.videoContext.play();
    that.setData({
      showvideo: false
    })
  },
  chooseRed: function () {
    var that = this;
    that.setData({
      redErrorText: '',
      isMoney: false,
      isNum: false,
      redNum: '',
      moneyVal: '',
      moneyVals: '0.00'
    })
    wx.setStorageSync('isOpenMoney', '');
    wx.setStorageSync('isOpenNum', '');
    if (that.data.redpacket == null) {
      that.toredPaper();
    } else if (that.data.redpacket != null) {
      console.log(that.data.infoArr.cityname);
      console.log(wx.getStorageSync('city'));
      if (that.data.infoArr.cityname !== wx.getStorageSync('city')) {
        wx.showModal({
          title: '提示',
          content: '只能参与同城的红包接龙哦',
        })
        return;
      }
      console.log("fff");
      that.toDeal();
    }
  },
  // 展示塞红包页面
  toredPaper: function () {
    var that = this;
    // if (that.data.hasredpaper == true || that.data.hasRedPapers == true){
    //   wx.showToast({
    //     title: '已有红包，不可继续添加',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //     that.setData({
    //       addInput1: 0
    //     })
    //  }else{
    that.setData({
      showRedPaper: true,
      addInput1: 1
    })
    //}
  },
  // 取消塞红包页面
  cancelPedpaper: function () {
    var that = this;
    that.setData({
      showRedPaper: false,
      addInput1: 0
    })
  },
  // 取消抢红包页面
  LootRedcancel: function () {
    var that = this;
    that.setData({
      showRedDeal: false
    })
  },
  //检查输入文本，限制只能为数字并且数字最多带2位小数
  checkInputText: function (text) {
    var reg = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g; if (reg.test(text)) { //正则匹配通过，提取有效文本
      text = (text+'').replace(reg, '$2$3$4');
    } else { //正则匹配不通过，直接清空
      text = '';
    } 
    console.log(text);
    return text; //返回符合要求的文本（为数字且最多有带2位小数）
  },
  //金额条件
  inputMoney:function(money){
    var that = this;
    var errorText = '';
    var isMoney = false;
    console.log('money' + money);
    if (money > 200) {
      errorText = '红包总金额不低于0.31元，不超过200元';
      isMoney = false;
    }else if(money<=0.3){
      errorText ='红包总金额不低于0.31元，不超过200元';
      isMoney = false;
    }else{
      isMoney = true;
    }
    console.log('isMoney1'+isMoney);
    that.setData({
      redErrorText: errorText,
      isMoney: isMoney
    })
  },
  checkMoney(val){
    wx.setStorageSync('isOpenMoney', 'true');
    var that = this;
    var money = that.checkInputText(val);
    console.log('checkMoney'+money);
    that.setData({
      moneyVal: money,
      moneyVals: money ? money:'0.00'
    })
    that.inputMoney(Number(money));
  },
  // 获取金额
  inputRed: function (e) {
    var that = this;
    console.log(e);
    var type = e.currentTarget.dataset.name;
    var val = e.detail.value;
    if(type=='money'){ 
      that.checkMoney(val);
      if (that.data.isMoney){
        that.checkNum(that.data.redNum);
      }
    }else if(type=='num'){
      that.checkNum(val);
      console.log('that.data.isNum' + that.data.moneyVal);
      if (that.data.isNum){
        that.checkMoney(that.data.moneyVal);
      }
    }
  },
  // 获取红包个数
  checkNum: function (val) {
    wx.setStorageSync('isOpenNum', 'true');
    var redNum = val;
    var isNum = false;
    var that = this;
    var errorText = '';
   
    that.setData({
      redNum: redNum
    })
    var isRedNum = Math.floor((that.data.moneyVal * 0.99) / 0.3);
    console.log('isRedNum' + isRedNum);
    if (isRedNum > 100) {
      isRedNum = 100;
      errorText = '接龙红包个数不低于1个，不超过' + isRedNum + '个';
      isNum = false;
    }
    if (that.data.moneyVal >= 0.31) {
      errorText = '接龙红包个数不低于1个，不超过' + isRedNum + '个';
      isNum = false;
    }
    if (that.data.redNum <= isRedNum && that.data.redNum >= 1) {
      errorText = '';
      isNum = true;
    }
    that.setData({
      redErrorText: errorText,
      isNum: isNum
    })
  },
  // 获取拆红包时间
  redTime: function (e) {
    var that = this;
    that.setData({
      redTime: 10
    })
  },
  // 遮照
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
    }, 3000)
  },
  // 塞钱进红包
  FillMoney: function () {
    var that = this;
    if(that.data.redErrorText||that.data.moneyVal==''||that.data.redNum==''){
      return;
    }
    // if (!that.data.oneMoney) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '红包金额不能为空',
    //   })
    // } else if (that.data.oneMoney > 200 || that.data.oneMoney < 0) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '单次总金额不可超过200元',
    //   })
    // } else if (!that.data.redNum) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '红包个数不能为空',
    //   })
    // } 
    // else if (!that.data.redTime) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '拆红包时长不能为空',
    //   })
    // } 
    // else if ((that.data.oneMoney*0.99 / that.data.redNum) < 0.3) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '单个金额需大于0.3元',
    //   })
    // } else if (that.data.redNum < 1 || that.data.redNum > 100) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '至少添加一个红包，至多添加100个',
    //   })
    // } 
    // else if (that.data.redTime < 1 || that.data.redTime > 60) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '拆红包时长需大于1秒小于60秒',
    //   })
    // }
     //else {
      that.loadingTap();
      var url = app.globalData.Api + '/red/addRedPacket';
      var data= {
        money: that.data.moneyVal,
        number: that.data.redNum,
        time: 10,
        createuser: that.data.myOpenid,
        forumid: parseInt(that.data.tieziId),
      }
      wxreq.postRequest(url, data).then(res => {
        if (res.data.code == 0) {
          var url = app.globalData.Api + '/red/payRedPacket';
          var data = {
            redId: res.data.data.id,
          }
          wxreq.postRequest(url, data).then(res => {
            if (res.data.code == 0) {
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.package,
                signType: 'MD5',
                paySign: res.data.data.paySign,
                success(res) {
                  if (res.errMsg == "requestPayment:ok") {
                    that.loadingChange();
                    wx.showToast({
                      title: ' 恭喜你成功发起接龙红包，赶快转发开始红包接龙吧',
                      icon: 'success',
                      duration: 2000,
                    })
                    that.setData({
                      showRedPaper: false,
                      addInput1: 0
                    })
                    that.onLoad();
                  }
                },
                fail(res) {
                  if (res.errMsg == "requestPayment:fail cancel") {
                    that.loadingChange();
                    wx.showModal({
                      title: '提示',
                      content: '没有成功发起接龙红包，刷新一下再试试吧',
                    })
                  }
                }
              })
            }
          })
        }
      })
  },

  // 是否收藏
  isCollectioned: function () {
    var that = this;
    var url = app.globalData.Api + "/forumMark/isCollection";
    var data = {
      openId: that.data.myOpenid,
      forumId: parseInt(that.data.tieziId),
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.data == 0) {
        that.setData({
          NoSc: true,
          Sc: false
        });
      }
      else if (res.data.data == 1) {
        that.setData({
          NoSc: false,
          Sc: true
        });
      }
    })
  },
  comment: function () {
    var that = this;
    that.getComment();
  },
  // 增加浏览数接口
  addLookNum: function () {
    var that = this;
    var url = app.globalData.Api + "/forumMark/lookForumMark";
    var data = {
      forumId: parseInt(that.data.tieziId),
      openId: that.data.myOpenid
    }
    wxreq.postRequest(url, data).then(res => {
      console.log(res);
    })
  },
  // 获取帖子评论信息
  getComment: function () {
    var that = this;
    var url = app.globalData.Api + "/post/getPostReply";
    var data = {
      postId: parseInt(that.data.tieziId),
      pageNum: 1,
      pageSize: 5
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        replayArr: res.data.data[0]
      });
      for (var i = 0; i < that.data.replayArr.length; i++) {
        if (that.data.replayArr[i].childReplys.length !== 0) {
          that.setData({
            everyComments: that.data.replayArr[i].childReplys
          })
        }
        if (that.data.replayArr[i].reply.createBy == that.data.myOpenid) {
          that.data.replayArr[i].reply.deleteShow = true;
        } else {
          that.data.replayArr[i].reply.deleteShow = false;
        }
        for (var j = 0; j < that.data.replayArr[i].childReplys.length; j++) {
          if (that.data.replayArr[i].childReplys[j].createBy == that.data.myOpenid) {
            that.data.replayArr[i].childReplys[j].deleteShow = true;
          } else {
            that.data.replayArr[i].childReplys[j].deleteShow = false;
          }
        }
        that.data.replayArr[i].reply.publicTime = api.changeTime(that.data.replayArr[i].reply.createTime);
        if (that.data.replayArr[i].reply.sex == 1) {
          that.data.replayArr[i].reply.sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (that.data.replayArr[i].reply.sex == 0) {
          that.data.replayArr[i].reply.sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
      }
      that.setData({
        replayArr: that.data.replayArr,
        n: 2
      });
    })
  },

  // 上拉加载回调接口
  onReachBottom: function () {
    var that = this;
    var num = that.data.n;
    num = num + 1;
    var url = app.globalData.Api + "/post/getPostReply";
    var data = {
      postId: parseInt(that.data.tieziId),
      pageNum: that.data.n,
      pageSize: 5
    }
    wxreq.postRequest(url, data).then(res => {
      var dataListArr = res.data.data[0];
      if (dataListArr.length == 0) {
        return;
      }
      for (var i = 0; i < dataListArr.length; i++) {
        that.data.replayArr.push(dataListArr[i]);
        if (that.data.replayArr[i].childReplys == '') {
          that.data.replayArr[i].reply.isShow = false;
        } else {
          that.data.replayArr[i].reply.isShow = true;
        }
        if (that.data.replayArr[i].reply.createBy == that.data.myOpenid) {
          that.data.replayArr[i].reply.deleteShow = true;
        } else {
          that.data.replayArr[i].reply.deleteShow = false;
        }
        let timer = new Date(that.data.replayArr[i].reply.createTime);
        let publicTime = api.formatTime(timer);
        that.data.replayArr[i].reply.publicTime = publicTime;
      }
      that.setData({
        replayArr: that.data.replayArr,
        n: num
      });
    })
  },
  // 下拉刷新
  onPullDownRefresh: function (res) {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 5500);
    that.onLoad();
  },

  // 调用收藏帖子接口
  getCollection: function () {
    var that = this;
    that.isCollectioned();
    if (that.data.NoSc == true) {
      var url = app.globalData.Api + "/forumMark/collectionForumMark"
      var data = {
        flag: that.data.tieziFlag,
        openId: that.data.myOpenid,
        forumId: parseInt(that.data.tieziId),
      }
      wxreq.postRequest(url, data).then(res => {
        that.setData({
          NoSc: false,
          Sc: true
        });
        wx.showToast({
          title: '收藏成功',
        })
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确认取消收藏吗',
        success: function (res) {
          if (res.confirm) {
            var url = app.globalData.Api + "/forumMark/collectionForumMark";
            var data = {
              flag: that.data.tieziFlag,
              openId: that.data.myOpenid,
              forumId: parseInt(that.data.tieziId),
            }
            wxreq.postRequest(url, data).then(res => {
              wx.showToast({
                title: '取消收藏成功',
              })
              that.setData({
                NoSc: true,
                Sc: false
              });
            })
          } else {
            return;
          }
        }
      })
    }
  },

  // 点击出现一级评论输入框
  commentOfCard: function () {
    var that = this;
    if (that.data.userIsPoster == false) {
      that.setData({
        showInputBar: true, // 输入栏是否显示
        hideInputBar: false
      });
    } else {
      that.setData({
        showInputBar: false, // 输入栏是否显示
        hideInputBar: true
      });
    }
  },
  // 获取输入的一级评论内容
  bindInputLVOne: function (e) {
    var that = this;
    that.setData({
      LVOneValue: e.detail.value
    });
  },

  // 获取卖家联系电话
  getPosterPhoneNum: function () {
    this.setData({
      showPhoneNum: true,
      showPopBG: true
    });
  },

  // 成交帖子
  dealPoster: function () {
    var that = this;
    if (that.data.shop) {
      wx.showModal({
        title: '提示',
        content: '确定将该条发布设置为已成团状态吗',
        success: function (res) {
          if (res.confirm) {
            var url = app.globalData.Api + "/store/updateForumMarkToOutDate";
            var data = {
              forumId: parseInt(that.data.tieziId),
            }
            wxreq.postRequest(url, data).then(res => {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '设置成功',
                })
                that.getTieziInfo();
              }
            })
          }
        }
      })
    } else {
      var modelContent = '确认操作';
      if (that.data.transfer) {
        modelContent = '确认设置为已成交吗？';
      }
      else if (that.data.rent) {
        modelContent = '确认设置为已租赁吗？';
      }
      else if (that.data.group) {
        modelContent = '确认设置为已解决吗？';
      }
      else if (that.data.shop) {
        modelContent = '确认设置为已成团吗？';
      }
      wx.showModal({
        title: '提示',
        content: modelContent,
        success: function (res) {
          if (res.confirm) {
            var url = app.globalData.Api + "/forumMark/dealForumMark";
            var data = {
              forumId: parseInt(that.data.tieziId),
              openId: that.data.myOpenid
            }
            wxreq.postRequest(url, data).then(res => {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '设置成功',
                })
                that.getTieziInfo();
              }
            })
          } 
        }
      });
    }
  },
  // 隐藏pop
  hidePop: function () {
    this.setData({
      showPhoneNum: false,
      showPopBG: false,
    });
  },

  // 拨打卖家电话
  phonePoster: function () {
    var that = this;
    setTimeout(() => {
      wx.showToast({
        title: '联系邻粉时就说是从淘比邻小程序上看到的',
        icon: "none",
      });
      setTimeout(() => {
        wx.hideToast();
        wx.makePhoneCall({
          phoneNumber: that.data.infoArr.telphone,
          success: function () {
            console.log("拨打电话成功！")
          },
          fail: function () {
            console.log("拨打电话失败！")
          }
        })
      }, 500)
    }, 0);
  },

  // 显示输入工具栏
  showBottomInputBar: function () {
    var that = this;
    this.setData({
      showInputBar: true,
    });
  },

  // 删除帖子
  deletePoster: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除该信息吗',
      success: function (res) {
        if (res.confirm) {
          var url = app.globalData.Api + "/forumMark/delForumMark";
          var data = { forumId: parseInt(that.data.tieziId) }
          wxreq.postRequest(url, data).then(res => {
            if (res.data.code == 0) {
              var url = app.globalData.Api + '/forumMark/delForumNotice';
              var data = { forumId: parseInt(that.data.tieziId) }
              wxreq.postRequest(url, data).then(res => {
                wx.showToast({
                  title: '删除成功',
                })
                wx.setStorageSync('flag', true);
                wx.navigateBack();
              })
            } else {
              wx.showModal({
                title: '提示',
                content: res.data.msg,
              })
            }
          })
        } else {
          return;
        }
      }
    })
  },

  // 常用留言列表
  getCommonMsgs: function () {
    var that = this;
    var url = app.globalData.Api + "/forumMark/getForumWords";
    var data = {
      flag: parseInt(that.data.tieziFlag)
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.setData({
          commonMsgs: res.data.data
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
        })
      }
    })
  },

  common_msg_one: function () {
    var that = this;
    that.setData({
      LVOneValue: this.data.commonMsgs[0].content
    });
  },
  common_msg_two: function () {
    var that = this;
    that.setData({
      LVOneValue: this.data.commonMsgs[1].content
    });
  },
  common_msg_three: function () {
    var that = this;
    that.setData({
      LVOneValue: this.data.commonMsgs[2].content
    });
  },
  common_msg_four: function () {
    var that = this;
    that.setData({
      LVOneValue: this.data.commonMsgs[3].content
    });
  },
  common_msg_five: function () {
    var that = this;
    that.setData({
      LVOneValue: this.data.commonMsgs[4].content
    });
  },

  // 发布输入的一级评论
  releaseLVOne: function () {
    var that = this;
    var url = app.globalData.Api + '/user/getUserInfo';
    var data = { openId: that.data.infoArr.openId }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        that.setData({
          formId: res.data.data[0].formid
        })
      }
    })
    if (wx.getStorageSync('isForbid') == 1) {
      wx.showModal({
        title: '提示',
        content: '您已被禁言',
      })
      return;
    } else {
      if (that.data.parentId == 0) {
        var url = app.globalData.Api + "/post/forumReply";
        var data = {
          postId: parseInt(that.data.tieziId), // 帖子Id
          posterId: that.data.infoArr.openId, // 发帖人Id
          createBy: that.data.myOpenid, // 评论的人Id
          content: that.data.LVOneValue,
          parentId: ""
        }
        wxreq.postRequest(url, data).then(res => {
          if (res.data.code == 0) {
            wx.showToast({
              title: '留言成功',
            })
            var url = app.globalData.Api + "/template/send";
            var data = {
              touser: that.data.infoArr.openId, // 发帖子Id
              template_id: 0, // 发帖人Id
              keyword1: that.data.LVOneValue, // 评论的人Id
              keyword2: wx.getStorageSync('nickName'),
              form_id: that.data.formId,
              page: '/pages/infomodel/infomodel?data=' + [that.data.tieziId, that.data.tieziFlag]
            }
            wxreq.postRequest(url, data).then(res => {
              that.setData({
                LVOneValue: '', // 输入评论内容
              })
            })
            that.getComment();
            that.setData({
              showInputBar: false,
              hideInputBar: false,
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
            });
          }
        })
      }
      else {
        that.releaseLVTwo();
      }
    }
  },
  // 发布输入的二级评论
  releaseLVTwo: function (e) {
    var that = this;
    if (wx.getStorageSync('isForbid') == 1) {
      wx.showModal({
        title: '提示',
        content: '您已被禁言',
      })
      return;
    } else {
      var url = app.globalData.Api + "/post/forumReply";
      var data ={
        postId: parseInt(that.data.tieziId), // 帖子Id
        posterId: that.data.infoArr.openId, // 发帖人Id
        createBy: that.data.myOpenid, // 评论的人Id
        content: that.data.LVOneValue,
        parentId: that.data.parentId
      }
      wxreq.postRequest(url, data).then(res => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '留言成功',
          })
          var time = setTimeout(function () {
            that.tem();
          }, 2000)

          that.getComment();
          that.setData({
            parentId: 0,
            showInputBar: false,
            hideInputBar: false,
          });
        }
      })
    }
  },
  // 模板消息
  tem: function () {
    var that = this;
    var url = app.globalData.Api + "/template/send";
    var data = {
      touser: that.data.replyOpenId, // 发帖子Id
      template_id: 1, // 发帖人Id
      keyword1: wx.getStorageSync('nickName'), // 评论的人Id
      keyword2: that.data.LVOneValue,
      form_id: that.data.commentformId,
      page: '/pages/infomodel/infomodel?data=' + [that.data.tieziId, that.data.tieziFlag]
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        LVOneValue: '', // 输入的一级评论内容
      })
    })
  },
  // 点击使输入框消失
  inputDisplay: function () {
    var that = this;
    that.setData({
      parentId: 0,
      showInputBar: false,
      hideInputBar: false
    });
  },

  // 查看选择的图片
  previewImage: function (e) {
    var that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.imgs // 需要预览的图片http链接列表   
    })
  },
  // 到首页该位置
  toplateDetail: function () {
    var that = this;
    wx.getLocation({//获取当前经纬度
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息  
      success: function (res) {
        wx.openLocation({//​使用微信内置地图查看位置。
          latitude: Number(that.data.infoArr.lat),//要去的纬度-地址
          longitude: Number(that.data.infoArr.lon),//要去的经度-地址
          name: that.data.infoArr.plateQQName,
          address: that.data.infoArr.plateQQAddress
        })
      }
    })
  },

  // 前往发帖人的个人页面
  toHeInfo: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.infoArr.openId,
    });
  },
  // 前往别人的个人页面
  toRedHisInfo: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + e.currentTarget.dataset.name,
    });
  },
  // 点击砍价
  toBargin: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: 'max价1000元，白拿价60元，立减94%！确定发起砍价吗？',
      success: function(res){
        if(res.confirm){
          wx.showToast({
            title: '砍价发起成功',
            success: 'none'
          })
        }else{
          wx.showToast({
            title: '砍价发起失败，请重新发起',
            success: 'none'
          })
        }
      }
    })
  },
  // 跳到单买页面
  toBuyOne: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/infomodel/StartTeam/StartTeam?params=' + 1,
    })
  },
  // 跳到发起拼团页面
  toBuyTeam: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/infomodel/StartTeam/StartTeam?params=' + 2,
    })
  },
  // 分享
  onShareAppMessage: function (options) {
    var that = this;
    console.log(options);
    // if (options.from === 'button' && options.target.dataset.index==2){
    //   return{
    //     title: '您的好友' + wx.getStorageSync('nickName')+'邀您参与淘比邻第一团拼团',
    //     path: '/pages/infomodel/infomodel?data=' + [that.data.tieziId, that.data.tieziFlag],
    //     imageUrl: that.data.imgs[0]
    //   }
    // } 
    // else if (options.from === 'button' && options.target.dataset.index == 3){
    //   return {
    //     title: '您的好友' + wx.getStorageSync('nickName') + '邀您前往淘比邻砍价1团砍价',
    //     path: '/pages/infomodel/infomodel?data=' + [that.data.tieziId, that.data.tieziFlag],
    //     imageUrl: that.data.imgs[0]
    //   }
    // }
    // else if (options.from === 'button'){
      return {
        //title: wx.getStorageSync('nickName') + '邀你参与红包接龙赚现金，助力转发' + that.data.infoArr.nickName + '的'+that.getFlag(that.data.infoArr.flag) + '信息:' + that.getTilte(that.data.infoArr.title),
        title: '海量真红包，' + wx.getStorageSync('nickName') + '刚抢过，快来抢吧！',
        path: '/pages/infomodel/infomodel?data=' + [that.data.tieziId, that.data.tieziFlag],
        imageUrl: '/image/smallmodel/hongbao.png',
        success: function(res){
          wx.getShareInfo({
            shareTicket: shareTicket,
          })
        }
      }
    // }
  },
  getgiveUserName() {
    var that = this;
    for (var i = 0; i < that.data.redjiePackets.length;i++){
     var giveuserName=that.data.redjiePackets[that.data.redjiePackets.length-1].myWechat.nickname
    }
    return giveuserName;
  },
  getTilte(title) {
    if (title.length >= 10) {
      return title.substring(0, 10) + '...';
    } else {
      return title;
    }
  },
  getFlag(flag) {
    var markFlag = '';
    switch (flag) {
      case 1:
        markFlag = '闲置';
        break;
      case 2:
        markFlag = '租房';
        break;
      case 3:
        markFlag = '求助';
        break;
      case 4:
        markFlag = '拼团';
        break;
      default:
        markFlag = '拼团';
        break;
    }
    return markFlag;
  },
  //返回首页
  toIndex: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  // 一键复制
  copyTBL: function () {
    var that = this;
    wx.setClipboardData({
      data: that.data.infoArr.linkUrl
    });
  }
})
