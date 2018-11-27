const app = getApp();
const wxreq = require("../../../utils/wxRequest.js");
Page({
  data: {
    myOpenid: '', // 本人的openid
    hisOpenid: '', // 取消关注之人的openid
    followInfoArr: [], //我关注的人的信息
    commendList: [], // 推荐列表
    showList: [], // 显示列表
    flag: '' ,// 接收flag
    onfocus: true,
    nonfocus: false,
    nofocusUser:false, //关注邻居列表为空
    noUserFocus:false ,// 被邻居关注列表为空
    menuTapCurrent: 0, // 关注和推荐的状态
    winHeight: "",//窗口高度
    scrollLeft: 0, //tab标题的滚动条位置
    myFollow: '', // 关注的人
    myFans: '',  // 我的邻粉
    n: 2
  },
  onLoad: function () {
    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        console.log(calc)
        that.setData({
          winHeight: calc
        });
      }
    });

    // 获取本地缓存中的本人openid
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          myOpenid: res.data,
        });
        that.getFollowInfo();
        that.getFansInfo();
      }
    });
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    var that = this;
    that.setData({
      menuTapCurrent: e.detail.current
    });
    var current = e.detail.current;
    if (current == 0) {
      that.setData({
        showList: that.data.followInfoArr
      })
      that.getFollowInfo();
    } else if (current == 1) {
      that.setData({
        showList: that.data.commendList
      })
      that.getAboutUser();
    }
    this.checkCor();
  },
  // 关注和推荐的人切换
  selectTap: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    if (this.data.menuTapCurrent == current) { return false; }
    else {
      this.setData({
        menuTapCurrent: current
      })
    }
    if (current == 0) {
      that.getFollowInfo();
      that.setData({
        showList: that.data.followInfoArr
      })
    } else if(current==1){
      that.getFansInfo();
      that.setData({
        showList: that.data.FansList
      })
    }else if (current == 2) {
      that.setData({
        showList: that.data.commendList
      })
      that.getAboutUser();
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  // checkCor: function () {
  //   if (this.data.menuTapCurrent > 1) {
  //     this.setData({
  //       scrollLeft: 300
  //     })
  //   } else {
  //     this.setData({
  //       scrollLeft: 0
  //     })
  //   }
  // },
  // 获取我的关注列表
  getFollowInfo: function() {
    var that = this;
    var url = app.globalData.Api + "/user/getUserFocusFans";
    var data = {
      flag: 1,
      openId: that.data.myOpenid,
      pageNum: 1,
      pageSize: 200
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.userList.length; i++) {
        if (i && i % 5 == 0) {
          res.data.userList[i - 3].adshow = true
        }
        if (res.data.userList[i].sex == 1) {
          res.data.userList[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.userList[i].sex == 0) {
          res.data.userList[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        that.setData({
          hisOpenid: res.data.userList[i].openId
        })

        if (res.data.userList[i].isFocus == 1) {
          res.data.userList[i].nonfocus = true;
          res.data.userList[i].onfocus = false;
        } else if (res.data.userList[i].isFocus == 0) {
          res.data.userList[i].nonfocus = false;
          res.data.userList[i].onfocus = true;
        }
      }
      that.setData({
        followInfoArr: res.data.userList,
        myFollow: res.data.count
      });
      that.setData({
        showList: that.data.followInfoArr
      })
    })
  },
  // 邻粉列表
  getFansInfo: function () {
    var that = this;
    var url = app.globalData.Api + "/user/getUserFocusFans";
    var data = {
      flag: 2,
      openId: that.data.myOpenid,
      pageNum: 1,
      pageSize: 200
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.userList.length; i++) {
        if (i && i % 5 == 0) {
          res.data.userList[i - 3].adshow = true
        }
        if (res.data.userList[i].sex == 1) {
          res.data.userList[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.userList[i].sex == 0) {
          res.data.userList[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        that.setData({
          hisOpenid: res.data.userList[i].openId
        })

        if (res.data.userList[i].isFocus == 1) {
          res.data.userList[i].nonfocus = true;
          res.data.userList[i].onfocus = false;
        } else if (res.data.userList[i].isFocus == 0) {
          res.data.userList[i].nonfocus = false;
          res.data.userList[i].onfocus = true;
        }
      }
      that.setData({
        FansList: res.data.userList,
        myFans: res.data.count
      })
    })
  },
  // 获取附近推荐用户
  getAboutUser: function(){
    var that =this;
    var url = app.globalData.Api + '/user/getAboutUser';
    var data={
      openId: that.data.myOpenid,
      pageNum: 1,
      pageSize: 200,
      lat: wx.getStorageSync('lat'),
      lng: wx.getStorageSync('lon')
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.data.aboutUser.length; i++) {
        if (i && i % 5 == 0) {
          res.data.data.aboutUser[i - 3].adshow = true
        }
        if (res.data.data.aboutUser[i].sex == 1) {
          res.data.data.aboutUser[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else if (res.data.data.aboutUser[i].sex == 0) {
          res.data.data.aboutUser[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        that.setData({
          hisOpenid: res.data.data.aboutUser[i].openId
        })
        if (res.data.data.aboutUser[i].followOpenId == 1) {
          res.data.data.aboutUser[i].nonfocus = true;
          res.data.data.aboutUser[i].onfocus = false;
        } else if (res.data.data.aboutUser[i].followOpenId == 0) {
          res.data.data.aboutUser[i].nonfocus = false;
          res.data.data.aboutUser[i].onfocus = true;
        }
      }
      that.setData({
        commendList: res.data.data.aboutUser
      });
      that.setData({
        showList: that.data.commendList
      })
    })
  },
  // 点击取消关注或者关注
  giveup(e) {
    var that = this;
    var id = e.currentTarget.id;
    if (that.data.menuTapCurrent==0){
      if (that.data.followInfoArr[id].isFocus == 1) {
        wx.showModal({
          title: '提示',
          content: `确定取消对${that.data.followInfoArr[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              var url = app.globalData.Api + "/user/isFocusUser";
              var data = {
                openId: that.data.myOpenid,
                targetOpenId: that.data.followInfoArr[id].openId
              }
              wxreq.postRequest(url, data).then(res => {
                wx.showToast({
                  title: '取消关注成功',
                })
                that.getFollowInfo();
              })
            } else {
              return;
            }
          }
        })
      } else if (that.data.followInfoArr[id].isFocus == 0) {
        var url = app.globalData.Api + "/user/isFocusUser";
        var data = {
          openId: that.data.myOpenid,
          targetOpenId: that.data.followInfoArr[id].openId
        }
        wxreq.postRequest(url, data).then(res => {
            wx.showToast({
              title: '关注成功',
            })
            that.getFollowInfo();
        })
      }
    } else if (that.data.menuTapCurrent == 1) {
      if (that.data.FansList[id].isFocus == 1) {
        wx.showModal({
          title: '提示',
          content: `确定取消对${that.data.FansList[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              var url = app.globalData.Api + "/user/isFocusUser";
              var data  = {
                openId: that.data.myOpenid,
                targetOpenId: that.data.FansList[id].openId
              }
              wxreq.postRequest(url, data).then(res => {
                wx.showToast({
                  title: '取消关注成功',
                })
                that.getFansInfo();
                that.setData({
                  showList: that.data.FansList
                })
              })
            } else {
              return;
            }
          }
        })
      } else if (that.data.FansList[id].isFocus == 0) {
        var url = app.globalData.Api + "/user/isFocusUser";
        var data = {
          openId: that.data.myOpenid,
          targetOpenId: that.data.FansList[id].openId
        }
        wxreq.postRequest(url, data).then(res => {
          wx.showToast({
            title: '关注成功',
          })
          that.getFansInfo();
        })
      }
    }else if(that.data.menuTapCurrent == 2){
      if (that.data.commendList[id].followOpenId == 1) {
        wx.showModal({
          title: '提示',
          content: `确定取消对${that.data.commendList[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              var url = app.globalData.Api + "/user/isFocusUser";
              var data = {
                openId: that.data.myOpenid,
                targetOpenId: that.data.commendList[id].openId
              }
              wxreq.postRequest(url, data).then(res => {
                wx.showToast({
                  title: '取消关注成功',
                })
                that.getAboutUser();
              })
            } else {
              return;
            }
          }
        })
      } else if (that.data.commendList[id].followOpenId == 0) {
        var url = app.globalData.Api + "/user/isFocusUser";
        var data = {
          openId: that.data.myOpenid,
          targetOpenId: that.data.commendList[id].openId
        }
        wxreq.postRequest(url,data).then(res => {
          wx.showToast({
            title: '关注成功',
          })
          that.getAboutUser();
        })
      }
    }
  },

  // 前往关注的人的个人页面
  toHisInfo: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    if (that.data.menuTapCurrent==0){
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.followInfoArr[id].openId
      });
    } else if(that.data.menuTapCurrent == 1){
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.FansList[id].openId
      });
    } else if (that.data.menuTapCurrent == 2) {
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.commendList[id].openId
      });
    }
  },
  //上拉加载
  // onReachBottom: function (plateId) {
  //   var that = this;
  //   var num = that.data.n;
  //   num = num + 1;
  //   wx.request({
  //     url: app.globalData.Api + "/forumMark/getForumMarkList",
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded' // 默认值
  //     },
  //     data: {
  //       openId: that.data.myOpenid,
  //       flag: that.data.flag,
  //       pageNum: that.data.n,
  //       pageSize: 5
  //     },
  //     success: function (res) {
  //       for (var i = 0; i < res.data.forumMarks.length; i++) {
  //         if (res.data.forumMarks[i].imgs.length > 0) {
  //           var strImgs = res.data.forumMarks[i].imgs;
  //           res.data.forumMarks[i].setFirstImgs = strImgs.split(",");
  //         }
  //         else {
  //           res.data.forumMarks[i].setFirstImgs = '';
  //         }

  //         if (res.data.forumMarks[i].className.length > 0) {
  //           var strClassNames = res.data.forumMarks[i].className;
  //           res.data.forumMarks[i].setClassNames = strClassNames.split(" ");
  //         }
  //         res.data.forumMarks[i].setIsShow = true;
  //         res.data.forumMarks[i].setIsBody = true;
  //         res.data.forumMarks[i].setOpenBodyShow = false;
  //         res.data.forumMarks[i].yzr = false;
  //         res.data.forumMarks[i].yzrh = false;
  //       }
  //       var dataListArr = res.data.forumMarks;
  //       if (res.data.forumMarks.length == 0) {
  //         return;
  //       }
  //       for (var i = 0; i < dataListArr.length; i++) {
  //         that.data.publishArr.push(dataListArr[i]);
  //       }
  //       for (var i = 0; i < that.data.publishArr.length; i++) {
  //         if (that.data.publishArr[i].isDeal == 1) {
  //           that.setData({
  //             ['publishArr[' + i + '].yzr']: true,
  //             ['publishArr[' + i + '].yzrh']: false,
  //           })
  //         }
  //         if (that.data.publishArr[i].flag == 1) {
  //           that.setData({
  //             transfer: true,
  //             rent: false,
  //             group: false,
  //             newprice: true,
  //             oldprice: false
  //           })
  //         } else if (that.data.publishArr[i].flag == 2) {
  //           that.setData({
  //             transfer: false,
  //             rent: true,
  //             group: false,
  //             oldprice: true,
  //             newprice: false
  //           })
  //         } else if (that.data.publishArr[i].flag == 3) {
  //           that.setData({
  //             transfer: false,
  //             rent: false,
  //             group: true,
  //             oldprice: false,
  //             newprice: false
  //           })
  //         };
  //       };
  //       that.setData({
  //         publishArr: that.data.publishArr,
  //         n: num
  //       });
  //     }
  //   });
  // },
})
