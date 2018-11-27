// pages/components/similarList/similarList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "similarList": {
      type: Array
    }
  },

  data: {
    list: [
      {
        name: '闲置',
        unitid: 'adunit-edac615734196277'
      },
      {
        name: '租房',
        unitid: 'adunit-0e25cd0cdd6e014c'
      },
      {
        name: '求助',
        unitid: 'adunit-67e49b2c9f8dd72c'
      },
      {
        name: '拼团',
        unitid: 'adunit-b658d3a4503b3bb2'
      },
    ],
  },

  methods: {
    // 跳到个人主页
    toUserDetail: function (e) {
      var that = this;
      var id = e.currentTarget.id;
      wx.navigateTo({
        url: '/pages/hisHomepage/hisHomepage?hisOpenid=' + [that.data.similarList[id].openId],
      })
    },
    // 跳转进帖子详情
    toInfoModel: function (e) {
      var that = this;
      var id = e.currentTarget.id;
      wx.navigateTo({
        url: '/pages/infomodel/infomodel?data=' + [that.data.similarList[id].forumId, that.data.similarList[id].flag],
      })
    },
  }
})
