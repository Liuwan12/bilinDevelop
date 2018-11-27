//app.js
App({
  onLaunch: function () {

    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showToast({
              title: '淘比邻需要重启以体验新功能',
              icon: 'success',
              duration: 2000,
            })
            updateManager.applyUpdate()
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  globalData:{
    //  Api: 'https://54bilin.rbson.net/prod' // 正式地址
     Api: 'https://54bilin.rbson.net/dev' // 测试
    // Api: 'https://h5.faye.rbson.net/54bilin', // 3.0.0新版测试
  },
  // onLaunch: function (options) {
  //   this.globalData.shareInfo = null;
  // },
  onShow: function (options) {
    console.log(options);
    console.log(options.shareTicket)
  },  
})