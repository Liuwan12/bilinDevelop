const api = require("../../../utils/util.js");
const wxreq = require("../../../utils/wxRequest.js");
const APPLY_URL = '/plate/applicationPlate';
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "cityname": {
      type: String,
      value: ""
    },
    "openid": {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    phoneinput: '',
    posinput: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    positioninput: function (e) {
      var that = this;
      var posinput = e.detail.value;
      that.setData({
        posinput: posinput
      })
    },
    phoneinput: function (e) {
      var that = this;
      var phoneinput = e.detail.value;
      that.setData({
        phoneinput: phoneinput
      })
    },
    toapply: function () {
      var that = this;
      if (that.data.posinput == "") {
        wx.showModal({
          title: '提示',
          content: '请输入申请位置',
        })
      } else if (that.data.phoneinput == "") {
        wx.showModal({
          title: '提示',
          content: '请输入联系人电话',
        })
      } else {
        var url = app.globalData.Api + APPLY_URL;
        var data = {
          plateName: that.data.posinput,
          cityName: that.data.cityname,
          phone: that.data.phoneinput,
          openId: that.data.openid
        }
        wxreq.postRequest(url, data).then(res => {
          wx.showModal({
            title: '提示',
            content: '您的位置申请已提交，我们将于24小时内为您审核并开通相关位置',
          })
          // that.searchPlateByUserLocation();
          // that.setData({
          //   showApplication: false,
          //   showreview: false,
          //   showList: true,
          //   showsearch: false,
          // })
        })
        that.triggerEvent('toApply');
      }
    },
  }
})
