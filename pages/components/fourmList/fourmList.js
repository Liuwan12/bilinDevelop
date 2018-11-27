// pages/components/fourmList/fourmList.js
const api = require("../../../utils/util.js");
const wxreq = require("../../../utils/wxRequest.js");
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "listArr":{
      type: Array
    },
    "pageFlag":{
      type: String 
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [
      {
        name: '闲置',
        deal: '已成交'
      },
      {
        name: '租房',
        deal: '已租赁'
      },
      {
        name: '求助',
        deal: '已解决'
      },
      {
        name: '拼团',
        deal: '已成团'
      },
    ],
  },
  onLoad: function () {
	},
  /**
   * 组件的方法列表
   */
  methods: {
    // 跳到用户详情页
    toUserDetail: function (e) {
      // wx.chooseAddress({
      //   success: function (res) {
      //     console.log(res)
      //     console.log(res.postalCode)
      //     console.log(res.provinceName)
      //     console.log(res.cityName)
      //     console.log(res.countyName)
      //     console.log(res.detailInfo)
      //     console.log(res.nationalCode)
      //     console.log(res.telNumber)
      //   }
      // })
      var that = this;
      var id = e.currentTarget.id;
      if (that.data.listArr[id].openId == wx.getStorageSync('openid')) {
        return;
      }
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + that.data.listArr[id].openId,
      })
    },
    // 跳转到帖子的详细页面
    toInfoModel: function (e) {
      var that = this;
      var id = e.currentTarget.id;
      if (that.data.listArr[id].redPacket !== null) {
        wx.setStorageSync('redPacket', that.data.listArr[id].redPacket);
      }
      wx.navigateTo({
        url: '/pages/infomodel/infomodel?data=' + [that.data.listArr[id].forumId, that.data.listArr[id].flag, that.data.listArr[id].distance],
      });
    },
  }
})
