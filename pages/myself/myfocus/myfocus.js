const app = getApp();
Page({
  data: {
    myOpenid: '', // 本人的openid
    hisOpenid: '', // 取消关注之人的openid
    followInfoArr: [], //我关注的人的信息
    commendList: [], // 推荐列表
    showList: [], // 显示列表
    flag: 1,// 接收flag
    onfocus: true,
    nonfocus: false,
    nofocusUser: false, //关注邻居列表为空
    noUserFocus: false,// 被邻居关注列表为空
    menuTapCurrent: 0, // 关注和推荐的状态
    winHeight: "",//窗口高度
    scrollLeft: 0, //tab标题的滚动条位置
  },
  
  onLoad: function (option) {
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
    that.setData({
      flag: option.flag
    })
    // 获取本地缓存中的本人openid
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          myOpenid: res.data,
        });
        that.getFollowInfo();
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
    console.log( e);
  },
  // 关注和推荐的人切换
  selectTap: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    console.log(current);
    console.log(this.data.menuTapCurrent);
    if (this.data.menuTapCurrent == current) { return false; }
    else {
      this.setData({
        menuTapCurrent: current
      })
    }
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
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.menuTapCurrent > 1) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  // 获取我的关注和粉丝列表
  getFollowInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.Api + "/user/getUserFocusFans",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        flag: that.data.flag,
        openId: that.data.myOpenid,
        pageNum: 1,
        pageSize: 200
      },
      success: function (res) {
        for (var i = 0; i < res.data.userList.length; i++) {
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
          followInfoArr: res.data.userList
        });
        that.setData({
          showList: that.data.followInfoArr
        })
      }
    });
  },

  // 获取附近推荐用户
  getAboutUser: function () {
    var that = this;
    wx.request({
      url: app.globalData.Api + '/user/getAboutUser',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.myOpenid,
        pageNum: 1,
        pageSize: 50,
        lat: wx.getStorageSync('lat'),
        lng: wx.getStorageSync('lon')
      },
      success: function (res) {
        console.log(res.data.data);
        for (var i = 0; i < res.data.data.aboutUser.length; i++) {
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
      }
    })
  },
  // 点击取消关注或者关注
  giveup(e) {
    var that = this;
    var id = e.currentTarget.id;
    if (that.data.menuTapCurrent == 0) {
      if (that.data.followInfoArr[id].isFocus == 1) {
        wx.showModal({
          title: '提示',
          content: `确定取消对${that.data.followInfoArr[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              wx.request({
                url: app.globalData.Api + "/user/isFocusUser",
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                  openId: that.data.myOpenid,
                  targetOpenId: that.data.followInfoArr[id].openId
                },
                success: function (res) {
                  wx.showToast({
                    title: '取消关注成功',
                  })
                  that.getFollowInfo();
                }
              });
            } else {
              return;
            }
          }
        })
      } else if (that.data.followInfoArr[id].isFocus == 0) {
        wx.showModal({
          title: '提示',
          content: `确定对${that.data.followInfoArr[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              wx.request({
                url: app.globalData.Api + "/user/isFocusUser",
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                  openId: that.data.myOpenid,
                  targetOpenId: that.data.followInfoArr[id].openId
                },
                success: function (res) {
                  wx.showToast({
                    title: '关注成功',
                  })
                  that.getFollowInfo();
                }
              });
            } else {
              return;
            }
          }
        })
      }
    } else if (that.data.menuTapCurrent == 1) {
      if (that.data.commendList[id].followOpenId == 1) {
        wx.showModal({
          title: '提示',
          content: `确定取消对${that.data.commendList[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              wx.request({
                url: app.globalData.Api + "/user/isFocusUser",
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                  openId: that.data.myOpenid,
                  targetOpenId: that.data.commendList[id].openId
                },
                success: function (res) {
                  wx.showToast({
                    title: '取消关注成功',
                  })
                  that.getAboutUser();
                }
              });
            } else {
              return;
            }
          }
        })
      } else if (that.data.commendList[id].followOpenId == 0) {
        wx.showModal({
          title: '提示',
          content: `确定对${that.data.commendList[id].nickname}关注吗`,
          success: function (res) {
            if (res.confirm) {
              wx.request({
                url: app.globalData.Api + "/user/isFocusUser",
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                  openId: that.data.myOpenid,
                  targetOpenId: that.data.commendList[id].openId
                },
                success: function (res) {
                  wx.showToast({
                    title: '关注成功',
                  })
                  that.getAboutUser();
                }
              });
            } else {
              return;
            }
          }
        })
      }
    }
  },

  // 前往关注的人的个人页面
  toHisInfo: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    if (that.data.menuTapCurrent == 0) {
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.followInfoArr[id].openId
      });
    } else if (that.data.menuTapCurrent == 1) {
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.commendList[id].openId
      });
    }
  },

})