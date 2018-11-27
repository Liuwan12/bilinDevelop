const app = getApp();
var template = require('../../../tabBar/tabBar.js')
Page({
  data: {
    platedatail: [], // 位置详情
    plateId: '',
    openid:'',
    arr:[],
    n:2, // 加载页数
    ForumMarkList:[], //帖子列表
    focusUserList: [], // 关注该位置的用户列表
    flag: 4,
    onImg: true,
    fold: true,
    onfold: false,
    waitapply: false,
    manageApply: true,
    avatermanage: false , //显示管理图像
    nofocus:false,
    hasfocus: false,
    focusUseravater:[],
    cancelFocus:false,
    toFocus:false,
    isleasepublish:false,  // 是否有闲置发布
    ishousepublish:false,  // 是否有房屋直租发布
    isjoinpublish:false,  // 是否有直拼信息发布
    isshoppublish: false, //  是否有底商信息
    delForum: false, 

    noticeListArr: [], //公告栏消息
    forumNoticesList: [],// 公告信息列表
    quzd: true,
    quzk: false,
    hasList: true,
    newprice: false,
    oldprice: false,

    // 经纬度
    lat: '',
    lng: '' 
   },
  onLoad: function (options) {
    template.tabbar("tabBar", 0, this)//0表示第一个tabbar
     var that = this;
     that.setData({
       plateId: options.plateId,
       openid: wx.getStorageSync('openid')
     })
    that.getPlateDetail();
  },
  // 调取位置详情
  getPlateDetail: function(res) {
    var that = this;
    wx.request({
      url: app.globalData.Api + "/plate/getPlateDetail",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        plateId: that.data.plateId,
        openId: that.data.openid
      },
      success: function (res) {
        that.setData({
          arr: []
        })
        that.data.arr = that.data.arr.concat(res.data.data);
        that.setData({
          platedetail: that.data.arr,
          focusUserList: that.data.arr[0].focusUserList,
        })
        if (that.data.platedetail[0].adminOpenId == that.data.openid) {
          that.setData({
            delForum: true
          })
        }
        var focusUseravater = [];
        for (var i = 0; i < that.data.focusUserList.length; i++) {
          focusUseravater = focusUseravater.concat(that.data.focusUserList[i].avater);
        }
        if (res.data.data.forumNum == 0 && res.data.data.isFocus == 1) {
          wx.showToast({
            title: '您所关注的位置还是无人探索的新大陆，快来踩踩发布一条信息吧',
            duration: 2000,
            icon: 'none',
          })
        }
        that.setData({
          focusUseravater: focusUseravater.slice(0, 3),
          lat: that.data.platedetail[0].plate.lat,
          lng: that.data.platedetail[0].plate.lng
        })
        that.searchEverymodal();
        if (res.data.data.focusNum == 0) {
          that.setData({
            nofocus: true,
            hasfocus: false
          })
        } else {
          that.setData({
            nofocus: false,
            hasfocus: true
          })
        }
        if (res.data.data.isFocus == 1) {
          that.setData({
            cancelFocus: true,
            toFocus: false
          })
        } else {
          that.setData({
            cancelFocus: false,
            toFocus: true
          })
        }
        if (that.data.platedetail[0].adminAvater !== "") {
          that.setData({
            avatermanage: true,
            manageApply: false
          })
        }
        that.getNoticeList();
      }
    })
  },

   // 获取公告信息
  getNoticeList: function () {
    var that = this;
    var cpId = that.data.platedetail[0].plate.id
    wx.request({
      url: app.globalData.Api + "/forumMark/getForumNoticeList",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        pageNum: 1,
        pageSize: 10,
        plateId: cpId,
        isHomePage: false
      },
      success: function (res) {
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
      }
    });
  },
  // 公告栏跳到帖子详情页
  tonoticeModel:function(e){
    var that = this;
    var id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/infomodel/infomodel?data=' + [that.data.forumNoticesList[id].forumId, that.data.forumNoticesList[id].flag],
    });
  },
  // 申请管理员
  toapply: function(){
    var that=this;
     wx.navigateTo({
       url: '/pages/regionModel/applyModeler/applyModeler?plateId='+that.data.plateId,
     })
  },
  selectTap2: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;//获取到绑定的数据
    if (that.data.quzd == true) {
      that.setData({
        quzd: false,
        quzk: true,
      })
      that.scragCenter();
    } else if (that.data.quzk == true) {
      that.setData({
        quzd: true,
        quzk: false,
      })
      that.scragRight();
    }
  },
  // 管理员删除该位置帖子
  delforum:function(id){
    var that = this;
    var id = id.currentTarget.id;
    for (var i = 0; i < that.data.ForumMarkList.length;i++){
      if(id==i){
        var currentForumId = that.data.ForumMarkList[i].forumId;

        wx.showModal({
          title: '提示',
          content: '确认删除该信息吗',
          success: function (res) {
            if (res.confirm) {
              wx.request({
                url: app.globalData.Api + "/forumMark/delForumMark",
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                  forumId: currentForumId
                },
                success: function (res) {
                  console.log(res);
                  if (res.data.code == 0) {
                    wx.request({
                      url: app.globalData.Api + '/forumMark/delForumNotice',
                      method: 'POST',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                      },
                      data: {
                        forumId: currentForumId
                      },
                      success: function (res) {
                        that.searchEverymodal();
                      }
                    })
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: res.data.msg,
                    })
                  }
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
  //跳到管理员详情页
  toadminAvater:function(r){
    var that = this;
    wx.navigateTo({
      url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.platedetail[0].adminOpenId,
    })
  },
  // 全部折叠
  scragCenter() {
    var that = this;
    that.setData({
      iszhankaiHuiShow: true,
      iszhankaiBaiShow: false,
      iszhedieHuiShow: false,
      iszhedieBaiShow: true,
    })
    for (var i = 0; i < that.data.ForumMarkList.length; i++) {
      that.setData({
        ['ForumMarkList[' + i + '].setIsShow']: false,
        ['ForumMarkList[' + i + '].setIsBody']: false,
        ['ForumMarkList[' + i + '].setOpenBodyShow']: true,

      })
      if (that.data.ForumMarkList[i].isDeal == 1) {
        that.setData({
          ['ForumMarkList[' + i + '].yzr']: false,
          ['ForumMarkList[' + i + '].yzrh']: true,
        })
      }
    }

  },
  // 全部展开
  scragRight() {
    var that = this;
    this.setData({
      iszhankaiHuiShow: false,
      iszhankaiBaiShow: true,
      iszhedieHuiShow: true,
      iszhedieBaiShow: false,
    })
    for (var i = 0; i < this.data.ForumMarkList.length; i++) {
      this.setData({
        ['ForumMarkList[' + i + '].setIsShow']: true,
        ['ForumMarkList[' + i + '].setIsBody']: true,
        ['ForumMarkList[' + i + '].setOpenBodyShow']: false,
      })
      if (that.data.ForumMarkList[i].isDeal == 1) {
        that.setData({
          ['ForumMarkList[' + i + '].yzr']: true,
          ['ForumMarkList[' + i + '].yzrh']: false,
        })
      }
    }
  },

  menuTap: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    this.setData({
      menuTapCurrent: current,
      selectDefault: 0,
      n:2
    })
    if (current == 0) {
      that.data.flag = 1
    } else if (current == 1) {
      that.data.flag = 2
    } else if (current == 2) {
      that.data.flag = 3
    } else if(current ==3){
      that.data.flag = 4
    }
    that.searchEverymodal(); 
  },
  // 调取所有帖子接口
  searchEverymodal: function (res) {
    var that = this;
    wx.request({
      url: app.globalData.Api + "/forumMark/getForumMarkList",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        flag: that.data.flag,
        pageNum: 1,
        pageSize: 5,
        plateId: that.data.plateId,
        lat: that.data.lat,
        lng: that.data.lng
      },
      success: function (res) {
        if(res.data.count==0&&that.data.flag==1){
           that.setData({
             isleasepublish: true,
             ishousepublish: false,
             isjoinpublish: false,
             isshoppublish: false,
             hasList: false
           }) 
        } else if (res.data.count == 0 && that.data.flag == 2){
          that.setData({
            isleasepublish: false,
            ishousepublish: true,
            isjoinpublish: false,
            isshoppublish: false,
            hasList: false
          }) 
        } else if (res.data.count == 0 && that.data.flag == 3) {
          that.setData({
            isleasepublish: false,
            ishousepublish: false,
            isjoinpublish: true,
            isshoppublish: false,
            hasList: false
          })
        } else if (res.data.count == 0 && that.data.flag == 4) {
          that.setData({
            isleasepublish: false,
            ishousepublish: false,
            isjoinpublish: false,
            isshoppublish: true,
            hasList: false
          })
        }else{
          that.setData({
            isleasepublish: false,
            ishousepublish: false,
            isjoinpublish: false,
            isshoppublish: false,
            hasList: true
          })
        }
        that.setData({
          quzk: false,
          quzd: true
        })
        for (var i = 0; i < res.data.forumMarks.length; i++) {
          if (res.data.forumMarks[i].imgs.length > 0) {
            var strImgs = res.data.forumMarks[i].imgs;
            res.data.forumMarks[i].setFirstImgs = strImgs.split(",");
          }
          else {
            res.data.forumMarks[i].setFirstImgs = '';
          }

          if (res.data.forumMarks[i].className.length > 0) {
            var strClassNames = res.data.forumMarks[i].className;
            res.data.forumMarks[i].setClassNames = strClassNames.split(" ");
          }
          res.data.forumMarks[i].setIsShow = true;
          res.data.forumMarks[i].setIsBody = true;
          res.data.forumMarks[i].setOpenBodyShow = false;
          res.data.forumMarks[i].yzr = false;
          res.data.forumMarks[i].yzrh = false;
        }
        that.setData({
          ForumMarkList: res.data.forumMarks,
        });
        for (var i = 0; i < that.data.ForumMarkList.length; i++) {
          if (that.data.ForumMarkList[i].isDeal == 1) {
            that.setData({
              ['ForumMarkList[' + i + '].yzr']: true,
              ['ForumMarkList[' + i + '].yzrh']: false,
            })
          }
          if (that.data.ForumMarkList[i].flag == 1) {
            that.setData({
              transfer: true,
              rent: false,
              group: false,
              newprice: true,
              oldprice: false
            })
          } else if (that.data.ForumMarkList[i].flag == 2) {
            that.setData({
              transfer: false,
              rent: true,
              group: false,
              oldprice: true,
              newprice: false
            })
          } else if (that.data.ForumMarkList[i].flag == 3) {
            that.setData({
              transfer: false,
              rent: false,
              group: true,
              oldprice: false,
              newprice: false
            })
          };
        };
      }
    });
  },
  // 上拉加载函数
  onReachBottom: function() {
    var that = this;
    var num = that.data.n;
    num = num + 1;
    wx.request({
      url: app.globalData.Api + "/forumMark/getForumMarkList",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        flag: that.data.flag,
        pageNum: that.data.n,
        pageSize: 5,
        plateId: that.data.plateId
      },
      success: function (res) {
        for (var i = 0; i < res.data.forumMarks.length; i++) {
          if (res.data.forumMarks[i].imgs.length > 0) {
            var strImgs = res.data.forumMarks[i].imgs;
            res.data.forumMarks[i].setFirstImgs = strImgs.split(",");
          }
          else {
            res.data.forumMarks[i].setFirstImgs = '';
          }

          if (res.data.forumMarks[i].className.length > 0) {
            var strClassNames = res.data.forumMarks[i].className;
            res.data.forumMarks[i].setClassNames = strClassNames.split(" ");
          }
          res.data.forumMarks[i].setIsShow = true;
          res.data.forumMarks[i].setIsBody = true;
          res.data.forumMarks[i].setOpenBodyShow = false;
        }
        var dataListArr = res.data.forumMarks;
        if (dataListArr.length == 0) {
          return;
        }
        for (var i = 0; i < dataListArr.length; i++) {
          that.data.ForumMarkList.push(dataListArr[i]);
        }
        that.setData({
          ForumMarkList: that.data.ForumMarkList,
          n: num
        });
      }
    });
  },
  // 折叠
  smallPucker: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    for (var i = 0; i < that.data.ForumMarkList.length; i++) {
      if (i == id) {
        that.setData({
          ['ForumMarkList[' + i + '].setIsShow']: false,
          ['ForumMarkList[' + i + '].setIsBody']: false,
          ['ForumMarkList[' + i + '].setOpenBodyShow']: true,
        })
        if (that.data.ForumMarkList[i].isDeal == 1) {
          that.setData({
            ['ForumMarkList[' + i + '].yzr']: false,
            ['ForumMarkList[' + i + '].yzrh']: true,
          })
        }
      }
    }
  },

  // 展开
  smallOpen: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    for (var i = 0; i < that.data.ForumMarkList.length; i++) {
      if (i == id) {
        that.setData({
          ['ForumMarkList[' + i + '].setIsShow']: true,
          ['ForumMarkList[' + i + '].setIsBody']: true,
          ['ForumMarkList[' + i + '].setOpenBodyShow']: false,
        })
        if (that.data.ForumMarkList[i].isDeal == 1) {
          that.setData({
            ['ForumMarkList[' + i + '].yzr']: true,
            ['ForumMarkList[' + i + '].yzrh']: false,
          })
        }
      }
    }
  },
  // 跳转帖子详情页
  onpubDetail:function(e){
    var that = this;
    var id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/infomodel/infomodel?data=' + [that.data.ForumMarkList[id].forumId, that.data.ForumMarkList[id].flag],
    })
  },
  // 取消关注
  oncancel: function(){
    var that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
         that.setData({
           openid: res.data
         })
      },
    })
    wx.request({
      url: app.globalData.Api +'/plate/focusPlate',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        plateId: that.data.plateId,
        openId: that.data.openid
      },
      success: function(){
        that.getPlateDetail();
      }
    })
  },
  // 未关注位置跳转发布
  release: function(){
    var that = this;
    if (that.data.platedetail[0].isFocus==0){
      wx.request({
        url: app.globalData.Api +'/plate/focusPlate',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data:{
          plateId: that.data.plateId,
          openId: that.data.openid 
        },
        success: function(res){
          wx.redirectTo({
              url: '/pages/publish/publishPage/publishPage?plateId='+that.data.plateId,
          })
        }
      })
    }else{
      wx.redirectTo({
        url: '/pages/publish/publishPage/publishPage?plateId=' + that.data.plateId,
      })
    }
  },
  touserInfo:function(id){
    var that = this;
    var id = id.currentTarget.id;
    for(var i=0;i<that.data.focusUserList.length;i++){
      if(i==id){
        wx.navigateTo({
          url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.focusUserList[i].openId,
        })
      }
    }
  }
})