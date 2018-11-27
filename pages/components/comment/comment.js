const wxreq = require("../../../utils/wxRequest.js");
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "replayArr": {
      type: Array
    },
    "posterName":{
      type: String
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
  },
  onLoad:function(){
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击使输入框消失
    inputDisplay: function () {
      var that = this;
      that.setData({
        parentId: 0,
        showInputBar: false,
        hideInputBar: false
      });
    },
    // 前往别人的个人页面
    toHisInfo: function (e) {
      var that = this;
      var id = e.currentTarget.id;
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.replayArr[id].reply.createBy,
      });
    },
    // 前往别人的个人主页
    toHisInfoSec: function (e) {
      var that = this;
      var i = e.currentTarget.dataset.current;
      var id = e.currentTarget.id
      var childReplys = [];
      var hisopenid = that.data.replayArr[i].childReplys[id].createBy
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + hisopenid,
      })
    },
    // 删除二级留言
    commentDelete: function (e) {
      var that = this;
      var i = e.currentTarget.dataset.current;
      var id = e.currentTarget.id
      var childReplys = [];
      var hisopenid = that.data.replayArr[i].childReplys[id].id
      wx.showModal({
        title: '提示',
        content: '确认删除？',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
              mask: true
            });
            var url = app.globalData.Api + "/forumMark/delForumMarkReply";
            var data = {
              replyId: hisopenid
            }
            wxreq.postRequest(url, data).then(res => {
              if (res.data.code == 0) {
                wx.hideLoading();
                wx.showToast({
                  title: '删除成功！',
                  icon: 'success',
                  duration: 1000
                });
                that.triggerEvent('comment');
              }
            })
          } else {
            console.log('用户点击取消');
          }
        }
      });
    },
    // 点击二级评论
    commentOfComment: function (e) {
      var that = this;
      var id = e.currentTarget.id;
      that.setData({
        parentId: that.data.replayArr[id].reply.id,
      });
      var url = app.globalData.Api + '/user/getUserInfo';
      var data = {
        openId: that.data.replayArr[id].reply.createBy
      }
      wxreq.postRequest(url, data).then(res => {
        if (res.data.code == 0) {
          that.setData({
            commentformId: res.data.data[0].formid,
            replyOpenId: res.data.data[0].openId,
            replyNickName: res.data.data[0].nickname
          })
        }
      })
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
    // 删除评论
    commentOfDelete(e) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });;
      var that = this;
      var id = e.currentTarget.id;
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '确认删除？',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
              mask: true
            });
            var url = app.globalData.Api + "/forumMark/delForumMarkReply";
            var data = {
              replyId: that.data.replayArr[id].reply.id
            }
            wxreq.postRequest(url, data).then(res => {
              if (res.data.code == 0) {
                wx.hideLoading();
                wx.showToast({
                  title: '删除成功！',
                  icon: 'success',
                  duration: 1000
                });
                that.triggerEvent('comment');
              }
            })
          } else {
            console.log('用户点击取消');
          }
        }
      });
    },
  }
})
