var template = require('../../pages/tabBar/tabBar.js')
const app = getApp()
var interval=null;
Page({
  data: {
    pics: [],
    phoneNum: '', //接收手机号
    hideName: false,
    bindlease: false,
    current: '',
    bindtrans: true,
    bindjoin: false,
    verify: '', //接收验证码
    currentTime: 60,  //倒计时
    time: 60,
    photo:'photo',
    onprice: false,
    shade: false,
    ontime: false,
    verification: true,
    onHide: true,
    title: '', //接收标题
    isshowphoto: true,
    content: '', //接受内容值
    classify: '', //获取二手交易的分类内容
    class1: true,
    class2: false,
    join:'', //获取房屋租赁的参数内容
    class3: true,
    class4: false,
    class5: true,
    newPrice: '', // 卖价
    oldPrice: '', // 原价
    flag: 1,
    plateId: '10170725446229595389', // 位置id
    plateList: [],  // 接收位置信息
    openId: '', //用户openId
    plateTitle: '' // 传入当前位置
  },

  onLoad: function (options) {
    template.tabbar("tabBar", 1, this)//0表示第一个tabbar
    var that = this;
 
  },
 
  // 查看关注的位置
  getFocusPlate: function(e) {
    console.log(e);
    var that = this;
    that.setData({
      openId: wx.getStorageSync('openid')
    })
    wx.request({
      url: app.globalData.Api +'/plateForum/getFollowingPlateForums',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.openId,
      },
      success: function(res){
        that.setData({
          plateList: res.data.data
        })
        if(e){
          for (let i = 0; i < res.data.data.length; i++) {
            that.setData({
              plateTitle: res.data.data[e].title,
              plateId: res.data.data[e].plateId
            })
        }
        }
        console.log(that.data.plateId);
      }
    })
  },
  menuTap: function (e) {
    var that = this;
    that.setData({
      current: e.currentTarget.dataset.current
    })
    // var current = e.currentTarget.dataset.current;//获取到绑定的数据
    //改变menuTapCurrent的值为当前选中的menu所绑定的数据
    that.setData({
      selectTapCurrent: that.data.current,
      selectdefault: 0
    });
    if(that.data.current==0){
      that.data.flag=1
      // that.onrealese();
    } else if (that.data.current == 1) {
      that.data.flag = 2
      // that.onrealese();
    } else if (that.data.current == 2){
      that.data.flag = 3
      // that.onrealese();
    }
    that.bindtrans(); // 发布二手交易
    that.bindlease(); // 发布房屋租赁
    that.bindjoin(); // 发布拼团信息
  },
  onaddPhoto: function (res) {
    var that = this;
    var pics=that.data.pics;
    wx.chooseImage({
      count: 9,
      success: function(res) {
        var imgsrc=res.tempFilePaths;
        pics = pics.concat(imgsrc);
        that.setData({
          pics: pics
        })
      },
    })
  },
  uploadimg: function (){
    console.log(that.data.pics);
    var pics=this.data.pics;
    app.uploadimg({
      url: app.globalData.api + '/oss/uploadImgs',
      path:pics
    })
  },
  // 获取title
  titleInput: function(e){
    console.log(e);
    var that = this;
    that.setData({
      title: e.detail.value
    })
    console.log(that.data.title);
  },
  // 获取内容值
  contentInput: function (e) {
    var that = this;
    that.setData({
      content: e.detail.value
    })
    console.log(that.data.content);
  },
  // 手机号部分
  inputPhoneNum: function(e) {
     var that=this;
     if(e.detail){
       let phoneNum = e.detail.value; 
     }
     if(phoneNum.length === 11) {
       let checkedNum = this.checkPhoneNum(phoneNum);
       if(checkedNum) {
          that.setData({
            phoneNum: phoneNum
          })
       }
     }
  },
  checkPhoneNum: function(phoneNum) {
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
  getVerificationCode: function(res) {
    var that = this;
    var phoneNum = this.data.phoneNum;
    let currentTime = that.data.currentTime;
    clearInterval(interval);
    if(that.data.phoneNum){
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
                time: 60
              })
            }
          }, 1000);
        }
      })   
    }
  },
  // 输入验证码
  onverify: function(res) {
     var that = this;
     let verify = res.detail.value;
     that.setData({
       verify: verify,
     });
  },
  // 确认验证码
  onconfirm: function(res) {
     var that = this;
     if(that.data.phoneNum&&that.data.verify){
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
           if(that.data.verify===res.data){
             wx.showModal({
               title: '提示',
               content: '验证码错误',
             })
           } else {
             wx.showToast({
               title: '绑定成功',
               icon: 'success',
               duration: 2000,
             })
           }
           that.setData({
             hideName: false,
             shade: false
           })
         }
       })
       wx.setStorageSync('telphone', that.data.phoneNum);
       wx.setStorage({
         key: 'telphone',
         data: that.data.phoneNum,
       })
     }

    console.log(that.data.phoneNum);
  },
  // 点击隐藏弹窗
  hide: function (e) {
    this.setData({
      hideName: false,
      shade: false
    });
  },
  // 发布
  onrealese: function() {
    var that=this;
    console.log(that.data.classify);
      wx.getStorage({
        key: 'myPersonalInfo',
        success: function(res) {
          if (that.data.phoneNum==undefined){
            that.setData({
              hideName: true,
              shade: true
            })
          } else if (that.data.title && that.data.newPrice&&that.data.oldPrice&&that.data.plateId){
            console.log(111);
              wx.request({
                url: app.globalData.Api +'/forumMark/addForumMark',
                data: {
                  flag: that.data.flag,
                  openId: that.data.openId,
                  plateId: that.data.plateId,
                  title: that.data.title,
                  imgs: that.data.pics,
                  content: that.data.content,
                  newPrice: that.data.newPrice,
                  className: that.data.classify,
                  oldPrice: that.data.oldPrice
                },
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                method: 'POST',
                success: function(res){
                  console.log(res);
                   console.log('发布成功');
                    wx.showToast({
                      title: '发布成功',
                      icon: 'success',
                      duration: 1000,
                      mask: true
                    });
                    // that.setData({
                    //   title: "",
                    //   content: "",
                    //   classify: "",
                    //   newPrice: "",
                    // })
                }                
              })
          }else {
            wx.showModal({
              title: '提示',
              content: '请输入发布参数',
              success: function (res) {
              }
            })
          }
        },
      })
  },
  // 二手交易分类参数
  onClassify: function(res) {
    var that = this;
    console.log(that.data.classify);
    wx.navigateTo({
      url: '/pages/publish/classChoose/classChoose',
    });
    that.setData({
      classify: wx.getStorageSync('parameter'),
      class1: false,
      class2: true
    })
    console.log(that.data.class2)
  },
  // 房屋租赁参数
  lease:function(res) {
    var that = this;
     wx: wx.navigateTo({
       url: '/pages/publish/parameter/parameter',
     })
    that.setData({
      // join: wx.getStorageSync('join'),
      class3: false,
      class4: true
    })
  },
  //  改变tab栏切换
  bindtrans: function(e) {
    var that = this;
    if (that.data.current == 0) {
      that.setData({
        bindtrans: true
      })
    } else {
      that.setData({
        bindtrans: false
      })
    }
  },
  bindlease: function(e) {
    var that=this;
     if(that.data.current == 1){
        that.setData({
          bindlease: true
        })
     }else {
       that.setData({
         bindlease: false
       })
     }
  },
  bindjoin: function(e) {
     var that = this;
    if (that.data.current == 2) {
      that.setData({
        bindjoin: true
      })
    } else {
      that.setData({
        bindjoin: false
      })
    }
  },
  // 隐藏价格
  prihide: function(){
    this.setData({
      onprice: false,
      shade: false
    })
  },
  // 删除该图片
  cuowu: function(e){
    var that = this;
    var imgs = that.data.pics
    var current=e.currentTarget.id;
    imgs.splice(current,1);
    that.setData({
      pics: imgs
    });
  },
  // 获取输入想卖的价钱
  newprice: function(e) {
    var that = this;
    that.setData({
      newPrice: e.detail.value,
      class5: false
    });
    console.log(that.data.newPrice);
  },
  // 获取输入的原价
  oldprice: function(e) {
     var that = this;
     that.setData({
       oldPrice: e.detail.value
     })
     console.log(that.data.oldPrice);
  },
  // 输入价格
  inputPrice: function() {
     this.setData({
       onprice: true,
       shade: true
     })
  },
  onhide: function(e) {
    console.log(e);
    var that=this;
    that.setData({
      onHide: false
    })
  },
  onShow() {
     var that = this;
     wx.navigateTo({
       url: '/pages/publish/publishPage/publishPage',
     }) 
    
  },
  onUnload(){
     var that = this;
    wx.switchTab({
       url: '/pages/index/index',
     });
    //  that.onHide();
  },
  onHide(){
    wx.switchTab({
      // url: '/pages/index/index',
    });
  },
  onphoto: function() {
    var that=this;
    that.setData({
      photo: 0
    })
  }
})