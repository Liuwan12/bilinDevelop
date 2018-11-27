const api = require("../../../utils/util.js");
var wxreq = require('../../../utils/wxRequest.js');
const app = getApp();
Page({
  data: {
    list: [
      {
        name: '全部',
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
    n: 2,
    myOpenid: '', // 本人的openid
    collectionArr: [], // 收藏贴子信息的列表
    flag: 4, // 收藏类型切换
    classData: [],
    onImg: true,
    fold: true,
    onfold: false,
    transfer: '', // 显示转让
    rent: '',  // 显示出租
    group: '', // 显示成团
    newprice: false,
    oldprice: false,
    hasList: true,
    menuTapCurrent: 0,
    winHeight: "",//窗口高度
    scrollLeft: 0, //tab标题的滚动条位置
  },
  onLoad: function () {
    var that = this;
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });
    that.lineInfo(0);
    // 获取本地缓存中的本人openid
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          myOpenid: res.data,
        });
        that.getCollection();
      }
    });
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
    console.log('index' + index);
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
      selectDefault: 0,
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
    _this.getCollection();
  },
  // 切换
  menuTap: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    if (this.data.menuTapCurrent == current) { return false; }
    else {
      this.setData({
        menuTapCurrent: current,
        quzk: false,
        quzd: true
      })
      if (current == 2) {
        that.data.flag = 1
      } else if (current == 1) {
        that.data.flag = 2
      } else if (current == 3) {
        that.data.flag = 3
      } else if (current == 0) {
        that.data.flag = 4
      }
      that.onLoad();
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
  // 调用我的收藏接口
  getCollection: function () {
    var that = this;
    var url = app.globalData.Api + "/forumMark/getCollectionForumMarkList";
    var data = {
      openId: that.data.myOpenid,
      flag: that.data.flag,
      pageNum: 1,
      pageSize: 5
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.forumMarks.length; i++) {

        if (res.data.forumMarks[i].className.length > 0) {
          var strClassNames = res.data.forumMarks[i].className;
          res.data.forumMarks[i].setClassNames = strClassNames.split(" ");
        }
        res.data.forumMarks[i].setIsShow = true;
        res.data.forumMarks[i].setIsBody = true;
        res.data.forumMarks[i].setOpenBodyShow = false;
        res.data.forumMarks[i].yzr = false;
        res.data.forumMarks[i].yzrh = false;
        if (res.data.forumMarks[i].redPacket == null) {
          res.data.forumMarks[i].hasredPaper = true
        }
        if (res.data.forumMarks[i].sex == 1) {
          res.data.forumMarks[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else {
          res.data.forumMarks[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
      }
      that.setData({
        collectionArr: res.data.forumMarks
      });
      if (that.data.collectionArr.length == 0 && that.data.flag == 1) {
        that.setData({
          isleasepublish: true,
          ishousepublish: false,
          isjoinpublish: false,
          isshoppublish: false,
          hasList: false
        })
      } else if (that.data.collectionArr.length == 0 && that.data.flag == 2) {
        that.setData({
          isleasepublish: false,
          ishousepublish: true,
          isjoinpublish: false,
          isshoppublish: false,
          hasList: false
        })
      } else if (that.data.collectionArr.length == 0 && that.data.flag == 3) {
        that.setData({
          isleasepublish: false,
          ishousepublish: false,
          isjoinpublish: true,
          isshoppublish: false,
          hasList: false
        })
      } else if (that.data.collectionArr.length == 0 && that.data.flag == 4) {
        that.setData({
          isleasepublish: false,
          ishousepublish: false,
          isjoinpublish: false,
          isshoppublish: true,
          hasList: false
        })
      } else {
        that.setData({
          isleasepublish: false,
          ishousepublish: false,
          isjoinpublish: false,
          isleasepublish: false,
          hasList: true
        })
      }
      for (var i = 0; i < that.data.collectionArr.length; i++) {
        if (that.data.collectionArr[i].isDeal == 1) {
          that.setData({
            ['collectionArr[' + i + '].yzr']: true,
            ['collectionArr[' + i + '].yzrh']: false,
          })
        }
        if (that.data.collectionArr[i].flag == 1) {
          that.setData({
            transfer: true,
            rent: false,
            group: false,
            newprice: true,
            oldprice: false
          })
        } else if (that.data.collectionArr[i].flag == 2) {
          that.setData({
            transfer: false,
            rent: true,
            group: false,
            oldprice: true,
            newprice: false
          })
        } else if (that.data.collectionArr[i].flag == 3) {
          that.setData({
            transfer: false,
            rent: false,
            group: true,
            oldprice: false,
            newprice: false
          })
        }
      }
    })
  },
  // 上拉加载回调接口
  onReachBottom: function () {
    var that = this;
    var num = that.data.n;
    num = num + 1;
    var url = app.globalData.Api + "/user/getMyCollection";
    var data={
      openId: that.data.myOpenid,
      pageNum: that.data.n,
      pageSize: 5
    }
    wxreq.postRequest(url, data).then(res => {
      for (var i = 0; i < res.data.data; i++) {
        if (res.data.data[i].url == '') {
          res.data.data[i].user.imgIsShow = false;
        } else {
          res.data.data[i].user.imgIsShow = true;
        }
        res.data.data[i].user.isShow = true;
        res.data.data[i].user.isBody = true;
        res.data.data[i].user.openBodyShow = false;
        let timer = new Date(res.data.data[i].forumPost.createTime);
        let publicTime = api.formatTime(timer);
        res.data.data[i].forumPost.publicTime = publicTime;
        if (res.data.data[i].sex == 1) {
          res.data.data[i].sex = 'https://fy-img.oss-cn-shanghai.aliyuncs.com/img/20180227/a94e640c-f05a-4ab4-9cda-70daf079c0e9.jpg'
        } else {
          res.data.data[i].sex = 'https://lbs-img.oss-cn-shanghai.aliyuncs.com/img/20180129/179ecff0-947f-4103-9b86-ebf256d4fb3f.jpg'
        }
        that.data.collectionArr.push(res.data.data[i]);
      }
      that.setData({
        collectionArr: that.data.collectionArr
      });
    })
    that.setData({
      n: num
    });
  },
  // 跳转他人主页
  toUserDetail: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.collectionArr[0].openId,
    })
  },
  // 跳转到帖子的详细页面
  toInfoModel: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    var detail = [that.data.collectionArr[0].forumId, that.data.flag]
    wx.navigateTo({
      url: '/pages/infomodel/infomodel?data=' + detail,
    });
  },

  // 取消收藏
  defultCollection: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    var url = app.globalData.Api + "/post/cancelCollectPost";
    var data={
      openId: that.data.myOpenid,
      forumPostId: that.data.collectionArr[id].forumPost.id
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.code == 0) {
        wx.showModal({
          title: '提示',
          content: '取消收藏成功',
          success: function (res) {
            if (res.confirm) {
              that.onLoad();
            } else {
              that.onLoad();
            }
          }
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '取消收藏失败，服务器错误，请稍后再试',
        });
      }
    })
  },
})
