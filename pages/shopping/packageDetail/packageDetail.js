
Page({
  data: {
    imgSrc: '' // 详情
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      imgSrc: options.detailpage
    })
    console.log(options.detailpage);
  }

})