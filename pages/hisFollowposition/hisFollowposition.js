const app = getApp();
Page({

  data: {
     openid: '',
     targetOpenId: '',
     positionList: [],  // 他关注的位置列表
     nofocus: false, // 显示关注
     hasfocus:false,// 已关注显示取消关注
     plateId:'',// 位置id
     nofocusPlate:false
  },

  onLoad: function (options) {
     var that = this;
     that.setData({
        openid: wx.getStorageSync('openid'),
       targetOpenId: options.hisOpenid
     }),
     that.getUserFocusPlate();
  },
  getUserFocusPlate: function(){
    var that=this;
    wx.request({
      url: app.globalData.Api +'/plate/getUserFocusPlate',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.openid,
        targetOpenId: that.data.targetOpenId,
        pageNum: 1,
        pageSize: 10,
      },
      success: function(res){
        if (res.data.data.length==0){
          that.setData({
            nofocusPlate: true
          })
        }
        for(var i=0;i<res.data.data.length;i++){
          res.data.data[i].nofocus=true;
          res.data.data[i].hasfocus=false
          if (res.data.data[i].isFocus == 1) {
            res.data.data[i].hasfocus = true;
            res.data.data[i].nofocus = false;
          } else {
            res.data.data[i].hasfocus = false;
            res.data.data[i].nofocus = true;
          }
        }
        that.setData({
          positionList: res.data.data
        })
      }
    })
  },
  focus:function(e){
    var id = e.currentTarget.id;
    var that = this;
    wx.request({
      url: app.globalData.Api +'/plate/focusPlate',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data:{
        openId:that.data.openid,
        plateId: that.data.positionList[id].plate.id
      },
      success:function(res){
        that.getUserFocusPlate();
      }
    })
  },
  // toplateinfo: function(e){
  //   var id = e.currentTarget.id;
  //   var that = this;
  //   wx.navigateTo({
  //     url: '/pages/myself/managePlate/PlateDetail/PlateDetail?plateId=' + that.data.positionList[id].plate.id
  //   });
  // }
})