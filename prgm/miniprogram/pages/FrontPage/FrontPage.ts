// pages/FrontPage/FrontPage.ts
const app_FrontPage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_FrontPage = wx.cloud.database();

Page({

  /* 页面的初始数据 */
  data: {
    //自定义tabs的标题项目
    tabs:[
      {id:0, name:"推荐", isActive:true,},
      {id:1, name:"广场", isActive:false,},
      // {id:2, name:"交流", isActive:false,},
    ],

    allPost_FrontPage: [] as any[], //所有帖子的FrontPage分变量，和全局变量allPost同步
    allScreenedPost0: [] as any[], //所有第一次 也就是类型筛选后剩下来的帖子
    allScreenedPost1: [] as any[], //所有第二次 也就是学校分区筛选后剩下来的帖子 在第一次筛选的结果上进行筛选
    allScreenedPost2: [] as any[], //所有经过二次筛选后剩下来的帖子 用于显示
    allScreenPostTypePickerItem:["全部","闲聊","组队","求助","好主意"],  //帖子类型筛选的picker的选项数组
    tempChosenScreenPostType:"全部",  //帖子类型筛选选中的选项
    allScreenPostSchoolPickerItem:[] as string[],  //帖子学校筛选的picker的选项数组
    allScreenPostSchoolPickerItem2:[] as string[],  //帖子学校筛选的picker的选项数组
    tempChosenScreenPostSchool:"全部",  //帖子学校筛选选中的选项
    allSchoolsList_FrontPage: [] as string[],  //所有大学的列表的FrontPage分变量，与全局变量allSchoolsList同步

    MajorRecommendContentArray:[] as any, //包含顶部主要推荐内容的数组
    MinorRecommendContentArray:[] as any, //包含下面次要推荐内容的数组

    //推荐tab下用来占位的内容数组
    recommendContentArray:[] as any,
    recommendContentArray2:[] as any, //用于显示
  },

  //构造推荐tabbar下面用来展位的数组
  //仅用于演示
  fillRecommendContentArray:function(){
    this.setData({recommendContentArray:[]})
    for(var i = 0;i < 15;i++){
      let tmp = {title:"recommendContentTitle " + (i + 1)}
      this.data.recommendContentArray.push(tmp)
    }
    //console.log(this.data.recommendContentArray)
    this.setData({recommendContentArray2:this.data.recommendContentArray})
  },

  //用户点击顶部推荐01
  UserClickTopRecommendContent01:function(){
    wx.setStorageSync("RCType","T01")
    wx.setStorageSync("RCNum",1)
    wx.navigateTo({url: "/pages/showRecommendContentPage/showRecommendContentPage"})
  },
  //用户点击顶部推荐02
  UserClickTopRecommendContent02:function(){
    wx.setStorageSync("RCType","T02")
    wx.setStorageSync("RCNum",2)
    wx.navigateTo({url: "/pages/showRecommendContentPage/showRecommendContentPage"})
  },
  //用户点击顶部推荐03
  UserClickTopRecommendContent03:function(){
    wx.setStorageSync("RCType","T03")
    wx.setStorageSync("RCNum",3)
    wx.navigateTo({url: "/pages/showRecommendContentPage/showRecommendContentPage"})
  },
  //用户点击次要推荐
  UserClickMinorRecommendContent:function(e:any){
    //console.log(e.currentTarget.dataset.info)
    wx.setStorageSync("RCType","MinorRC")
    wx.setStorageSync("RCNum",e.currentTarget.dataset.info)
    wx.navigateTo({url: "/pages/showRecommendContentPage/showRecommendContentPage"})
  },

  //筛选所有post的事件
  ScreenPosts:function(){
    //目标：获得allScreenedPost2里面包含了经过筛选的事件
    //所有帖子保存在allPost_FrontPage中
    //tempChosenScreenPostType帖子类型筛选选中的选项
    //tempChosenScreenPostSchool帖子学校筛选选中的选项
    
    //console.log(this.data.allPost_FrontPage)
    // const dbAllUserList_for_ScreenPosts = db_FrontPage.collection("Cloud_db_AllUserList")
    // const dbAllPosts_for_ScreenPosts = db_FrontPage.collection("Cloud_db_AllPost")
    // var page = this

    //先清空数据
    this.setData({allScreenedPost0:[],allScreenedPost1:[],allScreenedPost2:[]})

    //先进行帖子类型筛选
    if(this.data.tempChosenScreenPostType == "全部"){
      //帖子类型筛选为全部
      this.setData({allScreenedPost0: this.data.allPost_FrontPage})
    }
    else{
      //帖子类型筛选不为全部
      for(var i = 0;i < this.data.allPost_FrontPage.length;i++){
        if(this.data.allPost_FrontPage[i].type == this.data.tempChosenScreenPostType){
          this.data.allScreenedPost0.push(this.data.allPost_FrontPage[i])
        }
      }
    }

    //再进行帖子学校筛选
    if(this.data.tempChosenScreenPostSchool == "全部"){
      //帖子学校分区筛选为全部
      this.setData({allScreenedPost1: this.data.allScreenedPost0})
    }
    else{
      //帖子类型筛选不为全部
      for(var i = 0;i < this.data.allScreenedPost0.length;i++){
        if(this.data.allScreenedPost0[i].school == this.data.tempChosenScreenPostSchool){
          this.data.allScreenedPost1.push(this.data.allScreenedPost0[i])
        }
      }
    }

    //下面这句话在刷新的时候会调用俩次 因为在onload的两个回调过程末尾都写了对这个函数的调用
    //console.log(this.data.allScreenedPost1)

    //将allScreenedPost1赋给allScreenedPost2
    this.setData({allScreenedPost2:this.data.allScreenedPost1})
  },

  //用户更改帖子类型筛选器的监听事件
  screenPostTypePickerChange:function(e:any){
    this.setData({tempChosenScreenPostType: this.data.allScreenPostTypePickerItem[e.detail.value]})
    this.ScreenPosts()
  },
  //用户更改帖子学校筛选器的监听事件
  screenPostSchoolPickerChange:function(e:any){
    //this.setData({tempChosenScreenPostSchool: this.data.allScreenPostSchoolPickerItem[e.detail.value]})
    this.setData({tempChosenScreenPostSchool: this.data.allScreenPostSchoolPickerItem2[e.detail.value]})
    this.ScreenPosts()
  },

  onPullDownRefresh(){
    this.onLoad()
    wx.stopPullDownRefresh() // 不加这个方法真机下拉会一直处于刷新状态，无法复位
  },

  /* 生命周期函数--监听页面加载 */
  onLoad() {

    //填充用于演示的推荐内容数组的函数
    //仅用于演示
    //this.fillRecommendContentArray()


    var page = this
    const dbAllPost_Local = db_FrontPage.collection("Cloud_db_AllPost") //为对云数据库里所有帖子在本地的引用
    //页面加载，获取云数据库里的所有帖子
    dbAllPost_Local.orderBy('latestreplytime','desc').get({
      success:function(res){
        app_FrontPage.globalData.allPostList = res.data
        page.setData({  //将所有帖子信息赋给局部变量和全局变量
          allPost_FrontPage: res.data
        })
        //console.log(page.data.allPost_FrontPage)
        page.ScreenPosts()
      }
    })

    //要更新学校列表了，先清空并压入“隐藏”
    app_FrontPage.globalData.allSchoolsList = []
    app_FrontPage.globalData.allSchoolsList.push("隐藏学校")
    this.setData({allScreenPostSchoolPickerItem:[]})
    //更新一下所有学校列表
    const dbAllSchoolList_for_FrontPage = db_FrontPage.collection('Cloud_db_AllSchoolList') //获取引用
    dbAllSchoolList_for_FrontPage.get({
      success:function(res){
        for(var i = 0;i < res.data.length;++i){ //遍历云数据库 同步学校信息
          app_FrontPage.globalData.allSchoolsList.push(res.data[i].schoolname)
        }
        //在末尾加上其他大学
        app_FrontPage.globalData.allSchoolsList.push("其他大学")

        page.setData({ //将全局遍历所有大学列表同步到局部变量所有大学列表
          allSchoolsList_FrontPage: app_FrontPage.globalData.allSchoolsList,
          //allScreenPostSchoolPickerItem: page.data.allSchoolsList_FrontPage,
        })
        //整理构造学校的筛选列表
        page.data.allScreenPostSchoolPickerItem.push("全部")
        for(var i = 0;i < page.data.allSchoolsList_FrontPage.length;i++){
          page.data.allScreenPostSchoolPickerItem.push(page.data.allSchoolsList_FrontPage[i])
        }
        //将整理好的学校的筛选列表赋给用于显示的数组
        page.setData({allScreenPostSchoolPickerItem2:page.data.allScreenPostSchoolPickerItem})
        //console.log(page.data.allScreenPostSchoolPickerItem)

        page.ScreenPosts()
      }
    })

    //开始从数据库获取推荐内容
    const dbMajorRecommendContents_local = db_FrontPage.collection("Cloud_db_RecommendContent")
    dbMajorRecommendContents_local.doc("MajorRecommendContents").get({
      success:function(res){
        //console.log(res.data)
        page.setData({MajorRecommendContentArray: res.data})
      }
    })

    dbMajorRecommendContents_local.doc("MinorRecommendContents").get({
      success:function(res){
        //console.log(res.data)
        page.setData({MinorRecommendContentArray: res.data.contents.reverse()})
        console.log(page.data.MinorRecommendContentArray)
      }
    })

  },

  //自定义事件 用于接收子组件传递过来的数据
  handleItemChange:function(e:any){
    const tappedItemIndex = e.detail;

    //获取原数组
    let {tabs} = this.data

    //对原数组循环
    //  1)给每一个循环项选中属性改为false
    //  2)给 当前索引的项 添加被选中的效果
    //  3)将数组的值赋回去
    for(var i = 0;i < tabs.length;++i) tabs[i].isActive = false;
    tabs[tappedItemIndex].isActive = true;
    this.setData({tabs})
  },

  //添加新的帖子事件
  AddNewPost(){
    if(app_FrontPage.globalData.isUserLogged == false){  //用户未登录
      wx.showToast({title:'请先登录', icon : "none", duration: 2500,})
    }
    else if(this.data.tabs[0].isActive){  //发表一篇推荐
      wx.showToast({title:'敬请期待', icon : "none", duration: 2500,})
    }
    else if(this.data.tabs[1].isActive){  //发表一篇帖子
      //wx.showToast({title:'开始发帖', icon : "none", duration: 2500,})
      //跳转到编辑发帖的页面
      wx.navigateTo({url: "/pages/addNewPostPage/addNewPostPage"})
    }
  }
})