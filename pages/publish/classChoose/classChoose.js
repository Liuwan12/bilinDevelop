const app = getApp();
const wxreq = require('../../../utils/wxRequest.js');
Page({
  data: {
    Currentactive: -1,
    twoactive: -1,
    threeactive: -1,
    id:'',  // 一级参数id
    twooid: '', //二级参数id
    Threeid: '', // 三级参数ID
    active: true,
    oneList:'',  // 接收一级参数
    itemid: '',
    itemClasses: [],
    twoList: '', // 接收二级参数
    threeList: '',  // 接收三级参数
    twoid: '', // 请求二级列表的id
    canshuid:'', // 请求参数的id
    onepara: '', // 存放一级选择参数
    twopara:'', // 存放二级选择参数
    threepara: '', // 存放三级选择参数
    total: '',    
    onclass: true, // 显示分类页
    onpop: false , // 显示弹出层
    // 弹框
    itemid: '',
    paramYname: '', // 必须参数名
    paramNname: '', // 可选参数名
    paramY: '', // 必须参数
    paramN: '', // 可选参数
    arr1: [],
    index:false,
    oneActive1: [],
    current1: [],
    canshuname: '',
  },
  onLoad: function (options) {
    var that = this;
    that.getForums();
  },
  onactive: function(e){
     var that=this;
     var id = e.currentTarget.dataset.current;
     that.setData({
       id: id,
       Currentactive:id
     });
     that.setData({
       twoid: that.data.oneList[that.data.id].id,
     })
    that.data.onepara = that.data.oneList[that.data.id].name;
    that.setData({
      threepara: that.data.onepara
    })
    wx.setStorageSync('classify', that.data.threepara)
    if (that.data.oneList[that.data.id].isHaveParam){
      that.getItemParam1(that.data.oneList[that.data.id].id);
      that.setData({
        onclass: false,
        onpop: true
      })
    } else if (that.data.oneList[that.data.id].isHaveNext){
      that.getTwoForums(id);
    }else{
      wx.navigateBack({
        url: '/pages/publish/publishPage/publishPage',
      })
    }
  },
  twoactive: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.current;
    that.setData({
      twooid: id,
      twoactive: id,
    })
    that.data.twopara = that.data.onepara + ' ' + that.data.twoList[that.data.twooid].name;
    that.setData({
      threepara: that.data.twopara
    })
    wx.setStorageSync('classify', that.data.threepara);
    if (that.data.twoList[that.data.twooid].isHaveParam) {
      that.getItemParam1(that.data.twoList[that.data.twooid].id);
      that.setData({
        onclass: false,
        onpop: true
      })
    } else if (that.data.twoList[that.data.twooid].isHaveNext) {
      that.getThreeForums(that.data.twoList[that.data.twooid].id);
    } else {
      wx.navigateBack({
        url: '/pages/publish/publishPage/publishPage',
      })
    }
  },
  threeactive: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.current;
    that.setData({
      Threeid: id,
      threeactive: id,
    });
    that.data.threepara = that.data.twopara + ' ' + that.data.threeList[that.data.Threeid].name;
    wx.setStorageSync('classify', that.data.threepara);
    if (that.data.threeList[that.data.Threeid].isHaveParam) {
      that.getItemParam1(that.data.threeList[that.data.Threeid].id);
      that.setData({
        onclass: false,
        onpop: true
      })
    } else if (that.data.threeList[that.data.Threeid].isHaveNext) {
      that.getThreeForums(that.data.threeList[that.data.Threeid].id);
    } else {
      wx.navigateBack({
        url: '/pages/publish/publishPage/publishPage',
      })
    }
  },
  // 请求一级参数
  getForums: function(){
    var that = this;
    var url = app.globalData.Api + "/itemClass/getItemClass";
    var data = {
      parentId: 0,
      flag: 1
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        oneList: res.data.itemClasses,
      });
    })
  },
  // 请求二级参数
  getTwoForums: function(e) {
    var that = this;
    var url = app.globalData.Api + "/itemClass/getItemClass";
    var data = {
      parentId: that.data.twoid,
      flag: 1
    }
    wxreq.postRequest(url, data).then(res => {
      if (res.data.total == 0) {
        that.setData({
          itemid: that.data.oneList[e].id,
        })
        that.getItemParam();
      } else {
        that.setData({
          twoList: res.data.itemClasses,
          total: res.data.total,
          threeList: []
        })
      }
    })
  },
  // 请求三级参数
  getThreeForums: function (e) {
    var that = this;
    var url = app.globalData.Api + "/itemClass/getItemClass";
    var data = {
      parentId: e,
      flag: 1
    }
    wxreq.postRequest(url, data).then(res => {
      that.setData({
        threeList: res.data.itemClasses,
        canshuid: res.data.itemClasses[0].id,
      })
    })
  },
  // 弹窗js
  oneActive1: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.current;
    var idx = e.currentTarget.id;
    var crlArr = that.data.current1;
    for (var i = 0; i < crlArr.length; i++) {
      crlArr[current] = idx;
      that.data.oneActive1[current] = that.data.arr1[current].params[idx];
    }
    that.setData({
      current1: crlArr,
    })
  },

  getItemParam1: function (e) {
    var that = this;
    var url = app.globalData.Api + '/itemClass/getItemParam';
    var data={
      itemClassId: e
    }
    wxreq.postRequest(url, data).then(res => {
      var arr1 = res.data.paramDataY;
      that.setData({
        paramYname: res.data.paramDataY,
        paramNname: res.data.paramDataN,
        arr1: arr1,

      })
      var length = arr1.length;
      var s = that.data.current1;
      for (var i = 0; i < arr1.length; i++) {
        s[i] = -1;
      }
      that.setData({
        current1: s
      })
    })
  },
  overchoose: function () {
    var that = this;
    var active2 = '';
    for (var i = 0; i < that.data.oneActive1.length; i++) {
      if (that.data.oneActive1[i] !== undefined) {
        active2 = active2 + ' ' + that.data.oneActive1[i]
      }
    }
    that.setData({
      canshuname: that.data.threepara + active2
    })
    wx.setStorageSync('classify', that.data.canshuname);
    wx.navigateBack({
      url: '/pages/publish/publishPage/publishPage',
    })
  } 
})