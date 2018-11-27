const app = getApp()

Page({
  data: {
    winHeight: 0,
    page: ''
  },
  //监听传值
  cityTap(e) {
    var that = this;
    console.log(e);
    const cityName = e.detail.cityname.namecn ? e.detail.cityname.namecn : e.detail.cityname;
    console.log('选择城市为：' + cityName);
    if (that.data.page==='index'){
      wx.reLaunch({
        url: '/pages/index/index?cityname=' + cityName,
      })
    } else if (that.data.page === 'publish'){
      wx.setStorageSync('publishcity', cityName);
      wx.navigateBack({
        url: '/pages/publish/publishPage/publishPage'
      })
    }
    
    console.log('此处选择后，跳转页面');

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const win = wx.getSystemInfoSync();
    console.log(win);
    this.setData({
      winHeight: win.windowHeight
    });
    console.log(options.page);
    if (options.page==='index'){
      this.setData({
        page: 'index'
      });
    } else if (options.page === 'publish'){
      this.setData({
        page: 'publish'
      });
    }
  }
})
