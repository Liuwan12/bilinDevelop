// pages/components/bindphone/bindphone.js
Component({
  properties: {

  },

  data: {

  },

  methods: {
    picture: function(){
      let that= this;
      let p1 = new Promise(function(resolve,reject){
        wx.getImageInfo({
          src: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1542976843101&di=a5215b8292340488af766fcd8de2f2d1&imgtype=0&src=http%3A%2F%2Fg.hiphotos.baidu.com%2Fzhidao%2Fpic%2Fitem%2F63d0f703918fa0ec96d9de71249759ee3d6ddbb4.jpg',
        })
      })
    }
  }
})
