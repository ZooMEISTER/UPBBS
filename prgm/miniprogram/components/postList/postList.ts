// components/postList/postList.ts
Component({
  /* 组件的属性列表 */
  properties: {
    allPostList:{
      type: Array,
      value: [],
    }
  },

  /* 组件的初始数据 */
  data: {
    postPublisherAvatarURL: "",  //发布该帖子的用户的头像url
  },

  /* 组件的方法列表 */
  methods: {
    UserClickPost:function(e:any){
      console.log("jump to post_id: " + e.target.dataset.info)
      wx.setStorageSync("targetPostID",e.target.dataset.info)
      wx.navigateTo({url: "/pages/showPostPage/showPostPage"})
    },
  }
})
