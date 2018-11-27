const app = getApp();
Page({

  data: {
    packageList: [],
    active: -1, // 选择套餐
    shopId: '' ,//商铺id
    hidden: true, // 加载动画
    showfailed: false,
    paySuccess:false, // 缴费成功
    orderId: '', // 订单id
    hasPay: false,
    expirationdate: ''//过期时间
  },
  onLoad: function (options) {
     var that = this;
     that.getStore();
  },
  // 查询商铺id
  getStore: function(){
    var that = this;
    wx.request({
      url: app.globalData.Api + '/store/getStoreStateByOpenId',
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        openId: wx.getStorageSync('openid')
      },
      success:function(res){
        if(res.data.code==0){
          that.setData({
            shopId: res.data.data.id
          })
          if(res.data.data.state ==2){
            that.setData({
              hasPay:true
            })
            that.getExpirdate(res.data.data.expirationdate);
          }else{
            that.setData({
              hasPay: false
            })
          }
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
        wx.request({
          url: app.globalData.Api + '/store/getAllChargepackage',
          method: 'POST',
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: {
            storeId: that.data.shopId
          },
          success: function (res) {
            if (res.data.code == 0) {
              that.setData({
                packageList: res.data.data
              })
            }
          }
        })
      }
    })
  },
  // 转换过期时间
  getExpirdate: function(nS){
    var that = this;
    var time = new Date(nS);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var date = y+'年'+m+'月'+d+'日'
    that.setData({
      expirationdate: date
    })
    console.log(date);
  },
  loadingChange: function () {
    this.setData({
      hidden: true
    })
  },
  loadingTap: function () {
    this.setData({
      hidden: false
    })
    var that = this
    setTimeout(function () {
      that.setData({
        hidden: true
      })
    }, 5500)
  },
  // 查看套餐详情
  todetail: function(e){
    var that = this;
    var id = e.currentTarget.id;
    for (var i = 0; i < that.data.packageList.length;i++){
      if(id==i){
        wx.navigateTo({
          url: '/pages/shopping/packageDetail/packageDetail?detailpage=' + that.data.packageList[i].detailpage,
        })
      }
    }
    console.log(id);
  },
  // 选择套餐
  choosePack:function(e){
    var that = this;
    var id = e.currentTarget.id;
    that.setData({
      active: id
    })
  },
  toPayPackage:function(){
    var that=this;
    if(that.data.active!==-1){
      that.loadingTap();
      for(var i =0;i<that.data.packageList.length;i++){
        if(i==that.data.active){
          wx.request({
            url: app.globalData.Api +'/store/addStoreOrder',
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: {
              chargeid: that.data.packageList[i].id,
              chargename: that.data.packageList[i].name,
              money: that.data.packageList[i].money,
              payopenid: wx.getStorageSync('openid'),
              storeid: that.data.shopId
            },
            success: function(res){
              that.loadingChange();
              that.setData({
                orderId: res.data.data.id
              })
              if(res.data.code==0){
                wx.request({
                  url: app.globalData.Api + '/store/storeWxPay',
                  method: 'POST',
                  header: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  data: {
                    orderId: that.data.orderId 
                  },
                  success: function(res){
                    console.log(res);
                    if(res.data.code==0){
                      wx.requestPayment({
                        timeStamp: res.data.data.timeStamp,
                        nonceStr: res.data.data.nonceStr,
                        package: res.data.data.package,
                        signType: res.data.data.signType,
                        paySign: res.data.data.paySign,
                        success: function(res){
                          that.setData({
                            paySuccess: true,
                          });
                          that.onLoad();
                        },
                        fail:function(res){
                          wx.request({
                            url: app.globalData.Api +'/store/closeStoreOrder',
                            method: 'POST',
                            header: {
                            "Content-Type":"application/x-www-form-urlencoded",
                            },
                            data: {
                              orderId: that.data.orderId
                            },
                            success: function(res){
                              console.log(res);
                            }
                          })
                          that.setData({
                            showfailed:true
                          })
                        }
                      })
                    }else{
                      wx.showModal({
                        title: '提示',
                        content: '服务费未缴纳成功',
                      })
                    }
                  }
                })
              }else{
                wx.showModal({
                  title: '提示',
                  content: '服务费未缴纳成功',
                })
              }
            }
          })
        }
      }
    }else{
      wx.showModal({
        title: '提示',
        content: '请选择服务套餐',
      })
    }
  },
  toMypage: function(){
    wx.navigateTo({
      url: '/pages/myself/myself',
    })
  },
  cancelpay: function(res){
    var that = this;
    that.setData({
      showfailed:false
    })
  },
  payagain: function(res){
    var that = this;
    that.toPayPackage();
  }
})