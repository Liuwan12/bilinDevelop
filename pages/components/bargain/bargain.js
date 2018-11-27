// pages/components/bindphone/bindphone.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    data1: 20, // 进度条
    hasbargin: false, // 是否砍过
    alreadyBargin:false //是否已砍过一刀
  },
  onLoad: function (options) {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    Tooneknife: function () {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确定帮王波砍一刀吗',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              data1: that.data.data1 + 20
            })
            wx.showToast({
              title: '您已成功帮助用户王波砍了一刀',
              icon: 'none'
            })

          } else {
            wx.showToast({
              title: '砍价失败',
              icon: 'none'
            })
          }
        }
      })
    }
  }
})