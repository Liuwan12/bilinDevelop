Component({
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  onLoad: function (options) {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    ToJoin: function () {
      var that = this;
      wx.navigateTo({
        url: '/pages/infomodel/teamPay/teamPay',
      })
    }
  }
})
