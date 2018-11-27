const app = getApp();
Page({

  data: {
    name: '',
    logoImage: '',
    haslogoImage: true
  },

  onLoad: function (options) {
      var that=this;
      that.getStoreById();
  },
  getStoreById:function(){
     var that = this;
     wx.request({
       url: app.globalData.Api +'/store/getStoreStateByOpenId',
       method: 'POST',
       header: {
         'content-type': 'application/x-www-form-urlencoded' // 默认值
       },
       data: {
         openId: wx.getStorageSync('openid')
       },
       success: function(res){
         if (res.data.data.logoimgs){
           that.setData({
             logoImage: res.data.data.logoimgs
           })
         }else {
           that.setData({
             haslogoImage: false
           })
         }
         that.setData({
           name: res.data.data.name,
         })
       }
     }) 
  },
  // 到商铺详情
  toshopDetail: function(){
    wx.navigateTo({
      url: '/pages/shopping/shoppingDetail/shoppingDetail',
    })
  },
  // 到我商铺的发布
  toMyshopList: function(){
    var that =this;
    var openId = wx.getStorageSync('openid')
    wx.navigateTo({
      url: '/pages/shopping/shoppingList/shoppingList?openId='+openId,
    })
  }
})