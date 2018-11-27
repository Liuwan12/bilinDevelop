const app = getApp()
Page({
  data: {
    openId: '',
    storeId: '',
    shopDetail: [],
    plateId: '' ,// 商铺Id
    plateName: ''
  },

  onLoad: function (options) {
    var that = this;
    console.log(options);
    that.setData({
      openId: options.openId
    })
    that.getStore();
  },
  getStore: function(){
    var that = this;
    wx.request({
      url: app.globalData.Api + "/store/getStoreStateByOpenId",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.openId,
      },
      success:function(res){
        if(res.data.code==0){
          that.setData({
            storeId: res.data.data.id,
            shopDetail: res.data.data,
            plateId: res.data.data.plateid
          })
          that.getplate();
          that.getStoreForum();
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      }
    })
  },
  // 查询位置详情
  getplate:function(){
    var that = this;
    wx.request({
      url: app.globalData.Api +'/plate/getPlateDetail',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        plateId: that.data.plateId,
      },
      success: function(res){
        if(res.data.code==0){
          that.setData({
            plateName: res.data.data.plate.title
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      }
    })
  },
  // 查询商铺对应的帖子集合
  getStoreForum: function(){
    var that = this;
    wx.request({
      url: app.globalData.Api + '/store/getStoreAndForumById',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        storeId: that.data.storeId,
        pageNum: 1,
        pageSize: 10
      },
      success: function (res) {
        console.log(res);
      }
    })
  }
})