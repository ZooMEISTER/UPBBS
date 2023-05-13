// pages/showPostPage/showPostPage.ts
import { formatTime } from '../../utils/util'
const app_showPostPage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_showPostPage = wx.cloud.database();

Page({

  /* 页面的初始数据 */
  data: {
    loggedUserID_showPostPages:"", //已登录用户的用户id的showPostPage分变量 与全局变量loggedUserID同步
    thisPostID:"", //局部变量 表示当前页面显示的post的id
    thisPostInfo:[] as any, //局部变量 保存了当前页面显示的post的所有信息
    thisPostTitle:"", //局部变量 表示当前页面显示的post的标题
    thisPostDescription:"", //局部变量 表示当前页面显示的post的描述（一楼内容）
    thisPostPublisherID:"", //局部变量 表示当前页面显示的post的发布者id
    thisPostPublisherName:"", //局部变量 表示当前页面显示的post的发布者的用户名
    thisPostPublisherSchool:"", //局部变量 表示当前页面显示的post的发布者的学校
    thisPostPublisherAvatarURL:"", //局部变量 表示当前页面显示的post的发布者的头像URL
    thisPostType:"", //局部变量 表示当前页面显示的post的类型
    thisPostPublishDate:"", //局部变量 表示当前页面现实的post的发布时间
    thisPostReply:[], //局部变量 表示当前页面显示的post的所有回复
    thisPostReplyUserInfo:[] as string[], //局部变量 表示当前页面显示的post的所有回复用户的信息
    thisPostReplyUserCount: 0, //局部变量 表示当前页面显示的post的所有回复用户的数量

    t0:[] as any,  //在界面中用于显示reply的数组
    t1:[] as any,  //在界面中用于显示reply的数组 用setdata将t赋给t1

    hideReplyModal: true, //表示是否隐藏用户输入回复时的弹窗
    tempInputReplyContent: "", //表示用户在回复弹窗内输入的回复内容 
    newReply:[] as any[], //将要新插入的回复
    newReply2:[] as any[], //嵌套将要新插入的回复，这样才能插入到数据库的二维字段中
  },

  //构造显示结构
  setDisplayReplyInfo:function(){
    //console.log(this.data.thisPostReply)
    //console.log(this.data.thisPostReplyUserInfo)
    for(var i = 0;i < this.data.thisPostReplyUserCount;i++){
      var correctUserId = this.data.thisPostReply[i][0]  //用户id来将回复和名称联系上
      var correctUserPosition = 0;   //正确的用户id在this.data.thisPostReplyUserInfo里的下标
      for(var p = 0;p < this.data.thisPostReplyUserInfo.length;p++){
        if(correctUserId == this.data.thisPostReplyUserInfo[p]) correctUserPosition = p
      }
      let tmp = {name:this.data.thisPostReplyUserInfo[correctUserPosition - 2],avatarurl:this.data.thisPostReplyUserInfo[correctUserPosition - 1],reply:this.data.thisPostReply[i][1],date:this.data.thisPostReply[i][2]}

      this.data.t0.push(tmp)
    }
    console.log(this.data.t0)
    this.setData({t1:this.data.t0})
  },

  //该函数用于获取回复了此贴的用户的信息
  //this.data.thisPostReply[0]表示第一条回复
  //this.data.thisPostReply[0][0]表示第一条回复的用户的id
  //this.data.thisPostReply[0][1]表示第一条回复的内容
  GetReplyUserInfo:function(){
    this.setData({thisPostReplyUserInfo:[]})
    var page = this
    const dbAllUserList_for_GetReplyUserInfo = db_showPostPage.collection("Cloud_db_AllUserList")
    //console.log(this.data.thisPostReply[0][0])
    var i = 0; //要加载的回复个数
    var processProgress = 0; //加载回复的进度
    this.setData({
      thisPostReplyUserCount:this.data.thisPostReply.length,
    })

    while(i < this.data.thisPostReply.length){
      var tempReplyUserID = this.data.thisPostReply[i][0]
      dbAllUserList_for_GetReplyUserInfo.doc(tempReplyUserID).get({
        success:function(res){
          //将该回复用户对应的值赋给page.data.thisPostReplyUserInfo
          page.data.thisPostReplyUserInfo.push(res.data.name)
          page.data.thisPostReplyUserInfo.push(res.data.avatarurl)
          page.data.thisPostReplyUserInfo.push(res.data.userid)

          processProgress++
          if(processProgress == page.data.thisPostReplyUserCount){
            page.setDisplayReplyInfo()
          }
        }
      })
      i++
    }
  },

  //检查列表里是否已有访问这条帖子的记录
  isHisAlreadyExist:function(oldHis:[],curentHis:any){
    for(var i = 0;i < oldHis.length;i++){
      if(oldHis[i] == curentHis) return true
    }
    return false
  },

  //更新已登录用户的浏览历史
  //用户的浏览历史 最新的在最下面 老的在上面 在myPostPage页面处理的时候再统一倒过来
  updateLoggedUserHistory:function(){
    var page = this
    const dbAllUserList_for_Updatehistory = db_showPostPage.collection("Cloud_db_AllUserList")

    var loggedUserHistory_old = [] as any //已登录用户的原来的历史记录
    //var loggedUserHistory_temp = [] as any //已登录用户的历史记录的中间步骤暂存
    var loggedUserHistory_new = [] as any //已登录用户的新的历史记录

    dbAllUserList_for_Updatehistory.doc(this.data.loggedUserID_showPostPages).get({
      success:function(res){
        loggedUserHistory_old = res.data.history
        //console.log(loggedUserHistory_old)
        if(page.isHisAlreadyExist(loggedUserHistory_old,page.data.thisPostID) == true){ //该帖子已存在于历史记录列表中
          //不用进行历史记录列表的长度判断 直接把那个记录移动到最底下
          for(var i = 0;i < loggedUserHistory_old.length;i++){
            if(loggedUserHistory_old[i] != page.data.thisPostID){
              loggedUserHistory_new.push(loggedUserHistory_old[i])
            }
          }
          loggedUserHistory_new.push(page.data.thisPostID)  //新的历史记录已构造完毕 后续要对数据库进行update
        }
        else{ //该帖子不存在于历史记录列表中
          //要进行历史记录列表的长度判断 历史记录上限为 app_showPostPage.globalData.maxHistoryCount
          if(loggedUserHistory_old.length >= app_showPostPage.globalData.maxHistoryCount){ //历史记录条数已达上限
            for(var i = loggedUserHistory_old.length - app_showPostPage.globalData.maxHistoryCount + 1;i < loggedUserHistory_old.length;i++){
              loggedUserHistory_new.push(loggedUserHistory_old[i])
            }
            loggedUserHistory_new.push(page.data.thisPostID)  //新的历史记录已构造完毕 后续要对数据库进行update
          }
          else{ //历史记录条数未达上限
            for(var i = 0;i < loggedUserHistory_old.length;i++){
              loggedUserHistory_new.push(loggedUserHistory_old[i])
            }
            loggedUserHistory_new.push(page.data.thisPostID)  //新的历史记录已构造完毕 后续要对数据库进行update
          }
        }

        //开始对云数据库的用户的浏览历史进行操作
        dbAllUserList_for_Updatehistory.doc(page.data.loggedUserID_showPostPages).update({
          data:{
            history : loggedUserHistory_new
          }
        })

        //console.log(loggedUserHistory_new)
      }
    })
  },

  /* 生命周期函数--监听页面加载 */
  onLoad() {
    //加载页面时获取显示帖子的所需信息
    var page = this
    const dbAllPost_for_ShowPostPage = db_showPostPage.collection("Cloud_db_AllPost")
    this.setData({
      thisPostID: wx.getStorageSync("targetPostID"),
      loggedUserID_showPostPages: app_showPostPage.globalData.loggedUserID,
      //thisPostInfo: dbAllPost_for_ShowPostPage.doc("803723f46332bb9f004608ba26ff9182"),
    })
    //console.log(dbAllPost_for_ShowPostPage.doc(this.data.thisPostID))
    dbAllPost_for_ShowPostPage.doc(this.data.thisPostID).get({
      success:function(res){
        //console.log(res.data)
        page.setData({
          thisPostInfo: res.data,
          thisPostTitle:res.data.title, //局部变量 表示当前页面显示的post的标题
          thisPostDescription:res.data.description, //局部变量 表示当前页面显示的post的描述（一楼内容）
          thisPostPublisherID:res.data.publisher, //局部变量 表示当前页面显示的post的发布者id
          thisPostType:res.data.type, //局部变量 表示当前页面显示的post的类型
          thisPostPublishDate:res.data.publishdate, //局部变量 表示当前页面现实的post的发布时间
          thisPostReply:res.data.reply, //局部变量 表示当前页面显示的post的所有回复
        })
        //获取发布此贴的用户的详细信息
        db_showPostPage.collection("Cloud_db_AllUserList").doc(page.data.thisPostPublisherID).get({
          success:function(res2){
            //console.log(res2.data)
            page.setData({
              thisPostPublisherName:res2.data.name,
              thisPostPublisherSchool:res2.data.school,
              thisPostPublisherAvatarURL:res2.data.avatarurl,
            })

            //获取回复了这个帖子的用户的信息 调用一个函数
            page.GetReplyUserInfo()
          }
        })
      },
      fail:function(){
        console.log("this post is not exist")
        wx.showToast({title:'此帖子不存在', icon : "none", duration: 2500,})
      }
    })

    if(app_showPostPage.globalData.isUserLogged == true){  //如果用户已登录的话
      this.updateLoggedUserHistory()  //更新已登录用户的浏览历史
    }
  },

  /* 页面相关事件处理函数--监听用户下拉动作 */
  onPullDownRefresh() {
    this.setData({
      thisPostID:"", //局部变量 表示当前页面显示的post的id
      thisPostInfo:[] as any, //局部变量 保存了当前页面显示的post的所有信息
      thisPostTitle:"", //局部变量 表示当前页面显示的post的标题
      thisPostDescription:"", //局部变量 表示当前页面显示的post的描述（一楼内容）
      thisPostPublisherID:"", //局部变量 表示当前页面显示的post的发布者id
      thisPostPublisherName:"", //局部变量 表示当前页面显示的post的发布者的用户名
      thisPostPublisherSchool:"", //局部变量 表示当前页面显示的post的发布者的学校
      thisPostPublisherAvatarURL:"", //局部变量 表示当前页面显示的post的发布者的头像URL
      thisPostType:"", //局部变量 表示当前页面显示的post的类型
      thisPostPublishDate:"", //局部变量 表示当前页面现实的post的发布时间
      thisPostReply:[], //局部变量 表示当前页面显示的post的所有回复
      thisPostReplyUserInfo:[] as string[], //局部变量 表示当前页面显示的post的所有回复用户的信息
      thisPostReplyUserCount: 0, //局部变量 表示当前页面显示的post的所有回复用户的数量

      t0:[] as any,  //在界面中用于显示reply的数组
      t1:[] as any,  //在界面中用于显示reply的数组 用setdata将t赋给t1

      hideReplyModal: true, //表示是否隐藏用户输入回复时的弹窗
      tempInputReplyContent: "", //表示用户在回复弹窗内输入的回复内容 
      newReply:[] as any[], //将要新插入的回复
      newReply2:[] as any[], //嵌套将要新插入的回复，这样才能插入到数据库的二维字段中
    })
    this.onLoad()
    wx.stopPullDownRefresh() // 不加这个方法真机下拉会一直处于刷新状态，无法复位
  },

  //点击回复按钮
  AddReply:function(){
    if(app_showPostPage.globalData.isUserLogged == false){ //用户还未登录
      wx.showToast({title:'请先登录', icon : "none", duration: 2500,})
    }
    else{ //用户已经登录
      this.setData({hideReplyModal: false})
    }
  },
  //监听回复输入
  inputReply:function(e:any){
    this.setData({tempInputReplyContent: e.detail.value})
  },
  //取消回复按钮
  ReplyCancel:function(){
    this.setData({
      hideReplyModal: true,
      tempInputReplyContent: "",
    })
  },
  //确认回复按钮
  ReplyConfirm:function(){
    this.setData({newReply:[]})  //先清空回复
    //将回复添加到云数据库中
    const dbAllPost_for_Reply = db_showPostPage.collection("Cloud_db_AllPost")
    //构造要插入的回复的结构
    this.data.newReply.push(app_showPostPage.globalData.loggedUserID)
    this.data.newReply.push(this.data.tempInputReplyContent)
    this.data.newReply.push(formatTime(new Date(),"FullTime") + "")
    //console.log(this.data.newReply)
    this.data.newReply2.push(this.data.newReply)
    console.log(this.data.newReply2)  //必须也是二维数组才能加到数据库的二维字段中

    const _ = db_showPostPage.command
    dbAllPost_for_Reply.doc(this.data.thisPostID).update({
      data: {
        latestreplytime:formatTime(new Date(),"FullTime") + "",
        reply: _.push(this.data.newReply2)
      },
    })

    this.setData({
      hideReplyModal: true,
      tempInputReplyContent: "",
    })
  },

  //删除帖子事件
  DeleteThisPost:function(){
    var page = this
    wx.showModal({
      title:"确定要删除此贴吗",
      content:"删除后不可恢复",
      success:function(res){
        if(res.confirm){
          console.log("user confirm delete this post")
          const dbAllUserList_for_DeletePost = db_showPostPage.collection("Cloud_db_AllUserList")
          const dbAllPost_for_DeletePost = db_showPostPage.collection("Cloud_db_AllPost")

          //先把帖子的id从该用户的发帖记录中删去
          dbAllUserList_for_DeletePost.doc(page.data.loggedUserID_showPostPages).get({
            success:function(res2){
              var tempMyPost_old = []
              var tempMyPost_new = []
              tempMyPost_old = res2.data.mypost
              console.log(tempMyPost_old)
              //tempMyPost.remove(page.data.thisPostID)
              for(var i = 0;i < tempMyPost_old.length;i++){
                if(tempMyPost_old[i] != page.data.thisPostID){
                  tempMyPost_new.push(tempMyPost_old[i])
                }
              }
              console.log(tempMyPost_new)
              dbAllUserList_for_DeletePost.doc(page.data.loggedUserID_showPostPages).update({
                data:{
                  mypost: tempMyPost_new
                }
              })
            }
          })

          //把帖子从数据库中删去
          dbAllPost_for_DeletePost.doc(page.data.thisPostID).remove()

          wx.navigateBack()
        }
      }
    })
  },
})