const app = getApp();
Page({
  data: {
    myOpenid: '', // 我的openid
    myFollowArr: [], // 我关注的位置列表 
    plateId: '' ,
    nofocusplate:false
  },
  onLoad: function () {
    var that = this;
    // 获取本地缓存中的openid
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        console.log(res);
        that.setData({
          myOpenid: res.data,
        });
        that.searchFollowModel();
      }
    });
  },
  // 查询已关注的位置
  searchFollowModel: function() {
    var that = this;
    wx.request({
      url: app.globalData.Api + "/plate/getUserFocusPlate",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.myOpenid,
        targetOpenId: '',
        pageNum: 1,
        pageSize:20
      },
      success: function (res) {  
        if(res.data.data==0){
          that.setData({
            nofocusplate:true
          })
        }
        that.setData({
          myFollowArr: res.data.data
        })       
      }
    });
  },
  // 取消关注位置
  cancleFollow: function(e) {
    var that = this;
    var id = e.currentTarget.id;
    for (var i = 0; i < that.data.myFollowArr.length; i++) {
      if (i == id) {
        that.setData({
          plateId: that.data.myFollowArr[id].plate.id
        })
      }
    }
    wx.showModal({
      title: '提示',
      content: '确定取消对该位置的关注吗',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: app.globalData.Api + "/plate/focusPlate",
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            data: {
              openId: that.data.myOpenid,
              plateId: that.data.plateId
            },
            success: function (res) {
              wx.showToast({
                title: '取消关注成功',
                icon: 'success',
                duration: 2000
              })
              that.searchFollowModel();
            }
          });
        }else{
          retrun;
        }
      }
    })
  },
  // 前往位置详情
  // toHisFollowModel: function (e) {
  //   var that = this;
  //   var id = e.currentTarget.id;// 将点击的小区（版块）信息存到本地缓存
  //   wx.setStorage({
  //     key: 'regionInfo',
  //     data: that.data.myFollowArr[id]
  //   });
  //   wx.navigateTo({
  //     url: '/pages/myself/managePlate/PlateDetail/PlateDetail?plateId=' + that.data.myFollowArr[id].plate.id,
  //   });
  // }
})
