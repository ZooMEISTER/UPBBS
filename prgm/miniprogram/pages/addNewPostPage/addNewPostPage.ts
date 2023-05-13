// pages/addNewPostPage/addNewPostPage.ts
import { formatTime } from '../../utils/util'
const app_addNewPostPage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_addNewPostPage = wx.cloud.database();

Page({
  /* 页面的初始数据 */
  data: {
    tempNewPostTitle: "", //局部变量 用于表示新post的标题
    tempNewPostContent: "", //局部变量 用于表示新post的内容
    tempNewPostType: "闲聊", //局部变量 用于表示当前用户为新帖子选择的帖子类型是什么
    allPostType:["闲聊","组队","求助","好主意"] as string[], //局部变量 包含所有帖子类型的数组
    tempNewPostSchool: "隐藏学校", //局部变量 用于表示当前用户为新帖子选择的学校分区是什么
    allPostSchool:[] as string[], //局部变量 包含所有帖子学校分区的数组
  },

  /* 生命周期函数--监听页面加载 */
  onLoad() {
    this.setData({allPostSchool:app_addNewPostPage.globalData.allSchoolsList})
  },

  //用户切换新帖子的类型事件
  newPostTypePickerChange:function(e:any){
    this.setData({tempNewPostType: this.data.allPostType[e.detail.value]})
  },
  //用户切换新帖子的学校分区事件
  newPostSchoolPickerChange:function(e:any){
    this.setData({tempNewPostSchool: this.data.allPostSchool[e.detail.value]})
  },
  //监听用户输入新post标题
  inputNewPostTitle:function(e:any){
    this.setData({tempNewPostTitle:e.detail.value})
  },
  //监听用户输入新post内容
  inputNewPostContent:function(e:any){
    this.setData({tempNewPostContent:e.detail.value})
  },

  //发布帖子事件
  PublishNewPost:function(){
    if(this.data.tempNewPostTitle == ""){  //若标题为空
      wx.showToast({title:'标题不能为空', icon : "none", duration: 2500,})
    }
    else if(this.data.tempNewPostContent == ""){  //若内容为空
      wx.showToast({title:'内容不能为空', icon : "none", duration: 2500,})
    }
    else{  //符合要求
      var newPostType = ""
      if(this.data.tempNewPostType == "闲聊"){newPostType = "闲聊"}
      else if(this.data.tempNewPostType == "组队"){newPostType = "组队"}
      else if(this.data.tempNewPostType == "求助"){newPostType = "求助"}
      else if(this.data.tempNewPostType == "好主意"){newPostType = "好主意"}

      var page = this
      wx.showModal({  //弹窗 让用户选择是否确定要发布
        title:"确定要发布帖子吗",
        content:"",
        success:function(res){
          if(res.confirm){
            var newAddPostID = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) //新添加的帖子的id
            const dbAllPost_for_PublishNewPost = db_addNewPostPage.collection("Cloud_db_AllPost")
            dbAllPost_for_PublishNewPost.add({
              data:{
                _id:newAddPostID,
                title:page.data.tempNewPostTitle,
                description:page.data.tempNewPostContent,
                type:newPostType,
                publisher:app_addNewPostPage.globalData.loggedUserID,
                publishdate:formatTime(new Date(),"FullTime") + "",
                latestreplytime:formatTime(new Date(),"FullTime") + "",
                school:page.data.tempNewPostSchool,
                reply:[],
              }

            })

            //将这个新帖子的id添加到已登录用户的mypost中
            const dbAllUserList_for_addNew2mypost = db_addNewPostPage.collection("Cloud_db_AllUserList")
            const _ = db_addNewPostPage.command
            dbAllUserList_for_addNew2mypost.doc(app_addNewPostPage.globalData.loggedUserID).update({
              data:{
                mypost: _.push(newAddPostID)
              }
            })
            
            wx.showToast({title:'帖子已发布', icon : "none", duration: 2500,})
            wx.navigateBack()
          }
        }
      })
    }
  },
})