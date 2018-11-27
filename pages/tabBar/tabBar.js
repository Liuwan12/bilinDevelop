 //初始化数据
function tabbarinit() {
  return [
    {
      "current": 0,
      "index": 0,
      "pagePath": "/pages/index/index",
      "iconPath": "/image/smallmodel/hasredpaper.png",
      "selectedIconPath": "/image/smallmodel/hasredpaper.png",
      "text": "首页",
    },
    // {
    //   "current": 0,
    //   "index": 1,
    //   "pagePath": "/pages/publish/publishPage/publishPage",
    //   "iconPath": "/image/tabBar/fabu@2x.png",
    //   "selectedIconPath": "/image/tabBar/fabu@2x.png",
    //   "text": "发布",
    //   "pageTum": "navigate",
    // },
    {
      "current": 0,
      "index": 1,
      "pagePath": "/pages/myself/myself",
      "pagePath1": "",
      "iconPath": "/image/tabBar/wode.jpg",
      "selectedIconPath": "/image/tabBar/wode.jpg",
      "text": "我的"
    }
  ]
}
//tabbar 主入口
function tabbarmain(bindName = "tabdata", id, target) {
  var that = target;
  var bindData = {};
  var otabbar = tabbarinit();
  otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath']//换当前的icon
  otabbar[id]['current'] = 1;
  bindData[bindName] = otabbar
  that.setData({ bindData }); 
}
module.exports = {
  tabbar: tabbarmain,
}

