const app = getApp();
Page({
  data: {
    myOpenid: '', // 我的openid
    myFollowArr: [], // 我关注的版块列表 
    plateId: [],
    nomanage:false
  },
  onLoad: function () {
    var that = this;
    // 获取本地缓存中的openid
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          myOpenid: res.data,
        });
        that.searchFollowModel();
      }
    });
  },
  // 查询管理位置
  searchFollowModel: function() {
    var that = this;
    wx.request({
      url: app.globalData.Api + "/plate/getPlateAdminList",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        openId: that.data.myOpenid,
        pageNum: 1,
        pageSize: 10,

      },
      success: function (res) {
        if(res.data.data.length==0){
          that.setData({
            nomanage: true
          })
        }else{
          that.setData({
            nomanage: false
          })
        }
        that.setData({
          myFollowArr: res.data.data,
        })     
      }
    });
  },
  // 取消管理权限
  cancleFollow: function(e) {
    var that = this;
    var id = e.currentTarget.id;
    for (var i = 0; i < that.data.myFollowArr.length;i++){
      if(i==id){
        that.setData({
          plateId:that.data.myFollowArr[i].platerApply.id
        })
      }
    }
    wx.showModal({
      title: '提示',
      content: '确认取消该位置的管理权限吗',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: app.globalData.Api + "/plate/checkPlateAdmin",
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            data: {
              applyId: that.data.plateId,
              status: 3
            },
            success: function (res) {
              wx.showModal({
                title: '提示',
                content: '操作成功',
              })
              that.searchFollowModel();
            }
          });
        }else{
          return; 
        }
      }
    })
  },
  // 前往他关注的版块
  // toHisFollowModel: function (e) {
  //   var that = this;
  //   var id = e.currentTarget.id;// 将点击的小区（版块）信息存到本地缓存
  //   wx.setStorage({
  //     key: 'regionInfo',
  //     data: that.data.myFollowArr[id],
  //     plateId: that.data.plateId
  //   });
  //   wx.navigateTo({
  //     url: '/pages/myself/managePlate/PlateDetail/PlateDetail?plateId=' + that.data.myFollowArr[id].platerApply.plateId,
  //   });
  // }
})
