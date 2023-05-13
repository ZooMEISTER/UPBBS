// pages/myPostPage/myPostPage.ts
const app_myPostPage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_myPostPage = wx.cloud.database();

Page({

  /* 页面的初始数据 */
  data: {
    //决定了myPostPage页面所显示的内容的分变量 与全局变量myPostPageStatus同步 mypost显示用户的帖子，history显示浏览历史
    myPostPageStatus_myPostPage: "", 
    needGetPosts:[],  //包含了要从哪些里面抽取记录
    showPostsList:[] as any[],  //要展示的帖子的数组 乱序的
    showPostsList2:[] as any[],  //要展示的帖子的数组 顺序的 无法用于mustach显示
    showPostsList3:[] as any[],  //要展示的帖子的数组 顺序的 用于mustach显示
    singleMyPost:[],  //单个帖子的信息
  },

  //调整帖子数组内部数据的顺序 用于显示
  setshowPostsList3:function(){
    //现在我们有俩东西
    //一个是needGetPosts里面存放的是要显示的帖子的id且顺序正确
    //一个是showPostsList里面存放的是要显示的帖子的信息但是乱序
    // console.log(this.data.needGetPosts)
    // console.log(this.data.showPostsList)
    //先根据needGetPosts把showPostsList里的数据按正确数据放到showPostsList2
    for(var p = 0;p < this.data.needGetPosts.length;p++){
      for(var q = 0;q < this.data.showPostsList.length;q++){
        if(this.data.showPostsList[q]._id == this.data.needGetPosts[p]){
          this.data.showPostsList2.push(this.data.showPostsList[q])
          break
        }
      }
      
    }
    //console.log(this.data.showPostsList2)

    //将showPostsList2倒序赋给showPostsList3 让最新的帖子显示在最上面
    this.setData({showPostsList3:this.data.showPostsList2.reverse()})
  },

  /* 生命周期函数--监听页面加载 */
  onLoad() {
    //从全局变量同步信息
    this.setData({
      myPostPageStatus_myPostPage: app_myPostPage.globalData.myPostPageStatus,
      needGetPosts:[],  //包含了要从哪些里面抽取记录
      showPostsList:[],  //要展示的帖子的数组 乱序的
      showPostsList2:[],  //要展示的帖子的数组 顺序的 无法用于mustach显示
      showPostsList3:[],  //要展示的帖子的数组 顺序的 用于mustach显示
      singleMyPost:[],  //单个帖子的信息
    })

    var page = this
    const dbAllPost_Local = db_myPostPage.collection("Cloud_db_AllPost") //为对云数据库里所有帖子在本地的引用
    const dbAllUserList_myPostPage = db_myPostPage.collection("Cloud_db_AllUserList") //为对云数据库里所有用户在本地的引用
    //页面加载，获取云数据库里的所有帖子
    dbAllUserList_myPostPage.doc(app_myPostPage.globalData.loggedUserID).get({
      success:function(res){
        var myPostsCount = 0
        var getMyPostsProgress = 0
        //这里可以已替换--------------------------------------------------
        if(page.data.myPostPageStatus_myPostPage == "mypost"){ //显示内容为我的帖子
          myPostsCount = res.data.mypost.length  //个人发帖的总数
          getMyPostsProgress = 0  //获取个人发帖的进度
          page.setData({needGetPosts:res.data.mypost})
          //console.log(res.data.mypost)  //个人发的帖的_id
        }
        else if(page.data.myPostPageStatus_myPostPage == "history"){  //显示内容为我的浏览历史 
          myPostsCount = res.data.history.length  //个人浏览历史的总数
          getMyPostsProgress = 0  //获取个人浏览历史的进度
          page.setData({needGetPosts:res.data.history})
          //console.log(res.data.history)  //个人浏览历史的_id
        }

        
        //---------------------------------------------------------------
        //page.setData({showPostsList: res.data.mypost})
        for(var i = 0;i < page.data.needGetPosts.length;i++){  //现在已经有了帖子的id，接下来去数据库里找该帖子的其他信息
          dbAllPost_Local.doc(page.data.needGetPosts[i]).get({
            
            success:function(res2){
              //console.log(res2.data)
              //由于是异步调用，因此这里push的顺序是乱的，导致帖子的显示顺序随机
              let tempSingleMyPost = {_id:res2.data._id,type:res2.data.type,title:res2.data.title,publisher:res2.data.publisher,school:res2.data.school}
              //console.log(tempSingleMyPost)
              page.data.showPostsList.push(tempSingleMyPost)
              getMyPostsProgress++
              if(getMyPostsProgress == myPostsCount){
                page.setshowPostsList3()
                //page.setData({showPostsList2: page.data.showPostsList})
              }
              //console.log(t)
            },
            fail:function(){  //如果历史记录里的帖子有被删除的 就会fail
              let tempSingleMyPost = {_id:"res2.data._id",type:"res2.data.type",title:"res2.data.title",publisher:"res2.data.publisher",school:"res2.data.school"}
              //console.log(tempSingleMyPost)
              page.data.showPostsList.push(tempSingleMyPost)
              getMyPostsProgress++
              if(getMyPostsProgress == myPostsCount){
                page.setshowPostsList3()
                //page.setData({showPostsList2: page.data.showPostsList})
              }
            }
          })
        }
      }
    })
  },

  onUnload(){
    app_myPostPage.globalData.myPostPageStatus = ""
  },

  //清空用户的浏览历史
  UserClearHistory:function(){
    var page = this
    wx.showModal({
      title: "确定要清除浏览历史吗",
      content: "清除后无法恢复",
      success:function(res){
        if(res.confirm){
          const dbAllUserList_for_DeleteHistory = db_myPostPage.collection("Cloud_db_AllUserList")

          dbAllUserList_for_DeleteHistory.doc(app_myPostPage.globalData.loggedUserID).update({
            data:{
              history: []
            }
          })
        }
        page.onLoad()
      }
    })
  }
})