// pages/MePage/MePage.ts
import { formatTime } from '../../utils/util'
const app_MePage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_MePage = wx.cloud.database();

Page({

  /*页面的初始数据*/
  data: {
    isUserLogged_MePage:false,   //表示用户是否登录的MePage分变量，与全局变量isUserLogged同步
    loggedUserID_MePage:"", //一登陆的用户的ID的MePage分变量，与全局变量loggedUserID同步
    loggedUserName_MePage:"",   //登录的用户的用户名的MePage分变量，与全局变量loggedUserName同步
    loggedUserAvatarURL_MePage: "",   //已登录用户的头像的url的MePage分变量，与全局变量loggedUserAvatarUrl同步
    loggedUserSchool_MePage: "", //已登录的用户的学校的MePage分变量，与全局变量loggedUserSchool同步
    loggedUserClockInCount_MePage: 0, //已登录用户的累计签到天数的MePage分变量，与全局变量loggedUserClockInCount同步
    loggedUserLatestClockInDate: "", //已登录用户的最后签到日期 应该是全局数组变量loggedUserLatestClockInDates的最后一条记录
    loggedUserAlreadyClockInToday: false, //已登录用户今天是否已经登陆过
    allSchoolsList_MePage: [] as string[],  //所有大学的列表的MePage分变量，与全局变量allSchoolsList同步
    hideLoginModal:true,    //是否显示登录弹窗
    hideChangeUserNameModal: true, //是否显示更改用户名弹窗
    hideChangeUserPasswordModal: true, //是否显示更改用户密码弹窗
    tempInputUserName:"",   //临时输入用户名，为用户登陆时在用户名输入框或改名文本框输入的内容
    tempInputUserPassword:"", //临时输入用户密码，为用户俸禄是在密码输入框或改密码文本框输入的内容
    tempInputChangeUserPassword_Ori: "", //更改用户密码时 用户输入的原密码
    tempInputChangeUserPassword_New: "", //更改用户密码时 用户输入的新密码
  },

  //将局部变量和全局变量同步用户是否登录信息
  SyncUserLoginStatus:function(){
    this.setData({
      isUserLogged_MePage:app_MePage.globalData.isUserLogged,
      loggedUserID_MePage:app_MePage.globalData.loggedUserID,
      loggedUserName_MePage:app_MePage.globalData.loggedUserName,
      loggedUserAvatarURL_MePage:app_MePage.globalData.loggedUserAvatarURL,
      loggedUserSchool_MePage:app_MePage.globalData.loggedUserSchool,
      loggedUserClockInCount_MePage:app_MePage.globalData.loggedUserClockInCount,
      allSchoolsList_MePage:app_MePage.globalData.allSchoolsList,
    })
  },

  /*生命周期函数--监听页面加载*/
  onLoad() {
    this.setData({
      isUserLogged_MePage:false,   //表示用户是否登录的MePage分变量，与全局变量isUserLogged同步
      loggedUserID_MePage:"", //一登陆的用户的ID的MePage分变量，与全局变量loggedUserID同步
      loggedUserName_MePage:"",   //登录的用户的用户名的MePage分变量，与全局变量loggedUserName同步
      loggedUserAvatarURL_MePage: "",   //已登录用户的头像的url的MePage分变量，与全局变量loggedUserAvatarUrl同步
      loggedUserSchool_MePage: "", //已登录的用户的学校的MePage分变量，与全局变量loggedUserSchool同步
      loggedUserClockInCount_MePage: 0, //已登录用户的累计签到天数的MePage分变量，与全局变量loggedUserClockInCount同步
      allSchoolsList_MePage: [] as string[],  //所有大学的列表的MePage分变量，与全局变量allSchoolsList同步
      hideLoginModal:true,    //是否显示登录弹窗
      hideChangeUserNameModal: true, //是否显示更改用户名弹窗
      hideChangeUserPasswordModal: true, //是否显示更改用户密码弹窗
      tempInputUserName:"",   //临时输入用户名，为用户登陆时在用户名输入框或改名文本框输入的内容
      tempInputUserPassword:"", //临时输入用户密码，为用户俸禄是在密码输入框或改密码文本框输入的内容
      tempInputChangeUserPassword_Ori: "", //更改用户密码时 用户输入的原密码
      tempInputChangeUserPassword_New: "", //更改用户密码时 用户输入的新密码
    })

    this.SyncUserLoginStatus() //同步用户是否登录的信息

    var page = this
    //要更新学校列表了，先清空并压入“隐藏”
    app_MePage.globalData.allSchoolsList = []
    app_MePage.globalData.allSchoolsList.push("隐藏学校")
    //更新一下所有学校列表
    const dbAllSchoolList_for_User = db_MePage.collection('Cloud_db_AllSchoolList') //获取引用
    dbAllSchoolList_for_User.get({
      success:function(res){
        for(var i = 0;i < res.data.length;++i){ //遍历云数据库 同步学校信息
          app_MePage.globalData.allSchoolsList.push(res.data[i].schoolname)
        }
        //在末尾加上其他大学
        app_MePage.globalData.allSchoolsList.push("其他大学")

        page.setData({ //将全局遍历所有大学列表同步到局部变量所有大学列表
          allSchoolsList_MePage: app_MePage.globalData.allSchoolsList,
        })
      }
    })
  },

  // 每次页面显示的时候都同步数据
  onShow(){
    this.SyncUserLoginStatus() //同步用户是否登录的信息
  },

  //同步输入框内输入的登录用户名
  inputLoginUserName: function(e:any){
    this.setData({
      tempInputUserName: e.detail.value
    })
  },
  //同步输入框内输入的登录密码
  inputLoginUserPassword: function(e:any){
    this.setData({
      tempInputUserPassword: e.detail.value
    })
  },

  //用户开始登陆，显示登录信息输入弹窗
  UserStartLogin:function(){
    //显示登录信息输入弹窗
    this.setData({
      hideLoginModal:false
    })
  },

  //用户退出登录，回到登录前状态
  UserQuitLogin:function(){
    var page = this
    wx.showModal({  //弹窗 让用户选择是否确定要退出登录
      title:"确定要退出登录吗",
      content:"",
      success:function(res){
        if(res.confirm){
          app_MePage.globalData.isUserLogged = false
          app_MePage.globalData.loggedUserID = ""
          app_MePage.globalData.loggedUserName = ""
          app_MePage.globalData.loggedUserPassword = ""
          app_MePage.globalData.loggedUserAvatarURL = ""
          app_MePage.globalData.loggedUserSchool = ""
          app_MePage.globalData.loggedUserLatestClockInDates = []
          app_MePage.globalData.loggedUserClockInCount = 0
          page.SyncUserLoginStatus()
          page.setData({
            tempInputUserName: "",
            tempInputUserPassword: "",
            loggedUserLatestClockInDate: "", //已登录用户的最后签到日期 应该是全局数组变量loggedUserLatestClockInDates的最后一条记录
            loggedUserAlreadyClockInToday: false, //已登录用户今天是否已经登陆过
          })
        }
      }
    })
    
  },

  //用户确认登陆
  loginConfirm:function(){
    //登录信息初步验证
    if(this.data.tempInputUserName == ""){ //用户名为空
      wx.showToast({title:'用户名不能为空',icon : "none",duration: 2500,})
    }
    else if(this.data.tempInputUserPassword.length < 6){ //密码短于6位
      wx.showToast({title:'密码不短于6位',icon : "none",duration: 2500,})
    }
    else{ //输入的登录信息均符合要求
      const dbAllUserList_for_Login = db_MePage.collection('Cloud_db_AllUserList') //为登录验证获取云端用户数据集合的引用
      var page = this;

      dbAllUserList_for_Login.get({
        success:function(res){
          console.log(res.data.length) //打出已有用户个数
          let userNum = -1; //如果用户存在，则该变量不为-1，否则为-1
          console.log("all user id:")
          for(var i:number = 0;i < res.data.length;i++){
            console.log(res.data[i]._id + "^^^" + res.data[i].name) //打出已存在用户id
            if(page.data.tempInputUserName == res.data[i].name + ""){  //存在用户名
              userNum = i;
            }
          }
          
          if(userNum != -1){ //用户存在，比对密码
            console.log("user exist")
            if(page.data.tempInputUserPassword == res.data[userNum].password){  //密码正确，登录成功
              console.log("login success")
              //登录成功，则界面变为登录后的样式
              app_MePage.globalData.isUserLogged = true  //先更改全局变量的登陆状态
              app_MePage.globalData.loggedUserID = res.data[userNum].userid  //更改全局变量的userID变量
              app_MePage.globalData.loggedUserName = page.data.tempInputUserName //先更改全局变量的已登录用户名
              app_MePage.globalData.loggedUserPassword = page.data.tempInputUserPassword //更改全局变量的用户密码
              app_MePage.globalData.loggedUserAvatarURL = res.data[userNum].avatarurl  //更改全局变量的头像url变量
              app_MePage.globalData.loggedUserSchool = res.data[userNum].school  //更改全局变量的登录的用户的学校
              app_MePage.globalData.loggedUserClockInCount = res.data[userNum].latestclockindates.length  //更改全局变量的登录的用户的累计签到天数
              app_MePage.globalData.loggedUserLatestClockInDates = res.data[userNum].latestclockindates //更改全局变量的登录的用户的所有签到日期
              page.SyncUserLoginStatus()  //同步同步状态的分变量
              //console.log("logged username:" + page.data.tempInputUserName)
              page.setData({  //隐藏登录弹窗
                hideLoginModal:true
              })

              //如果用户之前有签到过
              if(app_MePage.globalData.loggedUserLatestClockInDates.length > 0){
                page.setData({
                  //设置已登录用户的最后签到日期
                  loggedUserLatestClockInDate : app_MePage.globalData.loggedUserLatestClockInDates[app_MePage.globalData.loggedUserLatestClockInDates.length - 1]
                })
              }
              
              //判断用户签到按钮是否应该有效
              if(page.data.loggedUserLatestClockInDate == formatTime(new Date(),"OnlyDate") + ""){
                page.setData({loggedUserAlreadyClockInToday: true}) //今天已经签到过了
              }
              else{
                page.setData({loggedUserAlreadyClockInToday: false}) //今天还没有签到过
              } 

              wx.showToast({title:'登录成功',icon : "none",duration: 2500,})
            }
            else{ //密码错误，登陆失败
              console.log("password is wrong")
              page.setData({
                hideLoginModal:true
              })
              wx.showToast({title:'密码错误，登录失败',icon : "none",duration: 2500,})
            }
          }
          else{ //用户不存在，登陆失败
            console.log("user not exist")
            page.setData({
              hideLoginModal:true
            })
            wx.showToast({title:'用户不存在，登录失败',icon : "none",duration: 2500,})
          }
        }
      })
    }
  },

  //用户取消登录
  loginCancel:function(){
    //隐藏用户登录信息输入弹窗
    this.setData({
      hideLoginModal:true
    })
  },
  
  //用户点击注册按钮，跳转到用户注册页面
  UserStartRegister:function(){
    wx.navigateTo({url: "/pages/RegisterPage/RegisterPage"})
  },

  //用户进行每日签到
  LoggenUserClockIn:function(){
    var page = this
    const dbAllUserList_for_UserClockIn = db_MePage.collection("Cloud_db_AllUserList")

    const _ = db_MePage.command
    dbAllUserList_for_UserClockIn.doc(app_MePage.globalData.loggedUserID).update({
      data:{
        latestclockindates: _.push(formatTime(new Date(),"OnlyDate") + "")
      }
    })
    
    page.setData({
      loggedUserAlreadyClockInToday : true,
      loggedUserClockInCount_MePage : page.data.loggedUserClockInCount_MePage + 1,
    })
    app_MePage.globalData.loggedUserClockInCount = app_MePage.globalData.loggedUserClockInCount + 1
  },

  //用户的上三大操作--------------------------------------------------------------------------------------------------------------
  //用户前往查看自己发的帖子
  UserCheckOwnPosts:function(){
    app_MePage.globalData.myPostPageStatus = "mypost"  //将myPostPage的显示内容类型设为个人帖子
    wx.navigateTo({url: "/pages/myPostPage/myPostPage"})
  },
  //用户前往查看自己的消息
  UserCheckOwnMsgs:function(){
    wx.showToast({title:'我的消息', icon : "none", duration: 2500,})
  },
  //用户前往查看自己的浏览历史
  UserCheckHistory:function(){
    //wx.showToast({title:'我的浏览历史', icon : "none", duration: 2500,})
    app_MePage.globalData.myPostPageStatus = "history"  //将myPostPage的显示内容类型设为个人帖子
    wx.navigateTo({url: "/pages/myPostPage/myPostPage"})
  },

  //----------------------------------------------------------------------------------------------------------------------------
  //用户更改个人信息--------------------------------------------------------------------------------------------------------------
  
  //用户修改自己的学校信息
  schoolPickerChange:function(e:any){
    console.log("user change school to " + this.data.allSchoolsList_MePage[e.detail.value])
    app_MePage.globalData.loggedUserSchool = this.data.allSchoolsList_MePage[e.detail.value]
    this.setData({loggedUserSchool_MePage: this.data.allSchoolsList_MePage[e.detail.value]})
    const dbAllUserList_for_ChangeSchool = db_MePage.collection('Cloud_db_AllUserList') //为登录验证获取云端用户数据集合的引用

    dbAllUserList_for_ChangeSchool.doc(this.data.loggedUserID_MePage).update({
      data:{
        school: this.data.loggedUserSchool_MePage
      }
    })

    wx.showToast({title:'学校修改成功', icon : "none", duration: 2500,})
  },

  //用户点击更改头像
  UserChangeAvatar:function(){
    var page = this
    //调用选择图片接口
    wx.chooseMedia({
      count: 1,  //只能选一张
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success(res) {
        console.log(res.tempFiles)
        console.log(res.tempFiles[0].tempFilePath)
        console.log(res.tempFiles[0].size)
        //调用上传图片接口
        wx.cloud.uploadFile({
          //随机生成一个上传的路径名（极小概率重复）
          cloudPath:"UserAvatar/" + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + ".png", 
          filePath: res.tempFiles[0].tempFilePath,
          success(res2){
            console.log(res2.fileID)
            //先删除原先已上传的头像文件
            if(page.data.loggedUserAvatarURL_MePage != ""){ //若头像url不为空，说明已上传过一张头像
              wx.cloud.deleteFile({ //删除老的的头像
                fileList: [page.data.loggedUserAvatarURL_MePage],
                success: res => {
                  // handle success
                  console.log("delete file:" + res.fileList)
                },
                fail: console.error
              })
            }
            //修改数据库内对应的头像url信息
            const dbAllUserList_for_ChangeAvatar = db_MePage.collection('Cloud_db_AllUserList') //获取引用
            dbAllUserList_for_ChangeAvatar.doc(page.data.loggedUserID_MePage).update({
              data:{
                avatarurl: res2.fileID
              }
            })
            app_MePage.globalData.loggedUserAvatarURL = res2.fileID
            page.setData({
              loggedUserAvatarURL_MePage:res2.fileID
            })
            wx.showToast({title:'头像修改成功',icon : "none",duration: 2500,})
          }
        })
      }
    })
  },

  //用户点击更改用户名
  UserChangeName:function(){
    this.setData({
      tempInputUserName:"",
      hideChangeUserNameModal: false,
    })
  },
  //输入更改用户名的文本框的监听函数
  inputChangeUserName:function(e:any){
    this.setData({
      tempInputUserName: e.detail.value
    })
  },
  //确认更改用户名
  changeUserNameConfirm:function(){

    //先进行用户名合法性的判断
    if(this.data.tempInputUserName == ""){ //更改的用户名为空，更改失败
      wx.showToast({title:'用户名不能为空',icon : "none",duration: 2500,})
    }
    else{ //不为空
      var page = this
      const dbAllUserList_for_ChangeName = db_MePage.collection('Cloud_db_AllUserList') //获取引用
      dbAllUserList_for_ChangeName.get({ //获取数据
        success:function(res){
          var isUserNameAvailable = true //局部变量 用于表示该用户名称是否可用
          for(var i:number = 0;i < res.data.length;i++){ //遍历判断Name是否可用
            if(page.data.tempInputUserName == res.data[i].name){
              isUserNameAvailable = false
            }
          }
  
          if(isUserNameAvailable){  //若该名称未被占用
            dbAllUserList_for_ChangeName.doc(page.data.loggedUserID_MePage).update({
              data:{
                name: page.data.tempInputUserName
              }
            })
            app_MePage.globalData.loggedUserName = page.data.tempInputUserName
            page.setData({
              loggedUserName_MePage: page.data.tempInputUserName,
              tempInputUserName:""
            })
            wx.showToast({title:'用户名修改成功',icon : "none",duration: 2500,})
            console.log("name change success")
          }
          else{  //若该名称已被占用
            wx.showToast({title:'该用户名已被占用',icon : "none",duration: 2500,})
          }
        }
      })
    }

    this.setData({
      hideChangeUserNameModal: true,
    })
  },
  //取消更改用户名
  changeUserNameCancel:function(){
    this.setData({
      hideChangeUserNameModal: true,
    })
  },

  //用户点击更改密码
  UserChangePassword:function(){
    this.setData({
      hideChangeUserPasswordModal: false,
    })
  },
  //用户输入原密码的监听
  inputChangeUserPassword_Ori:function(e:any){
    this.setData({
      tempInputChangeUserPassword_Ori: e.detail.value
    })
  },
  //用户输入新密码的监听
  inputChangeUserPassword_New:function(e:any){
    this.setData({
      tempInputChangeUserPassword_New: e.detail.value
    })
  },
  //用户确认更改密码
  changeUserPasswordConfirm:function(){
    if(this.data.tempInputChangeUserPassword_New.length < 6){  //新密码不得短于6位
      wx.showToast({title:'密码不得短于6位',icon : "none",duration: 2500,})
    }
    else if(this.data.tempInputChangeUserPassword_Ori != app_MePage.globalData.loggedUserPassword){ //验证原密码是否正确
      wx.showToast({title:'原密码错误，更改失败',icon : "none",duration: 2500,})
    }
    else{  //密码符合要求
      const dbAllUserList_for_ChangePassword = db_MePage.collection('Cloud_db_AllUserList') //获取引用

      //更新数据库里的密码数据
      dbAllUserList_for_ChangePassword.doc(this.data.loggedUserID_MePage).update({
        data:{
          password: this.data.tempInputChangeUserPassword_New
        }
      })

      //本地数据同步更新
      app_MePage.globalData.loggedUserPassword = this.data.tempInputChangeUserPassword_New
      this.setData({
        tempInputChangeUserPassword_New: "",
        tempInputChangeUserPassword_Ori: "",
        hideChangeUserPasswordModal: true,
      })
      wx.showToast({title:'密码更改成功',icon : "none",duration: 2500,})
    }
  },
  //用户取消更改密码
  changeUserPasswordCancel:function(){
    this.setData({   //数据更新
      hideChangeUserPasswordModal: true,
      tempInputChangeUserPassword_Ori: "",
      tempInputChangeUserPassword_New: "",
    })
  },

  //-----------------------------------------------------------------------------------------------------------------------------

  //用户查看用户须知
  checkUserNeed2know:function(){
    wx.showModal({
      title: "用户须知",
      content: "用户注册或使用账号密码登录且确认后，本小程序将会收集用户输入的自定义的用户名和密码。收集的上述用户信息仅用来在不同用户使用时，用于不同用户签到时区分身份。为了使用户后续登录体验更好，上述信息会上传至腾讯的云数据库中，收集的信息仅存在于本地小程序内部和腾讯云数据库。注册 或 登录 则表示您同意本小程序收集您自定义的账户名和密码并用于小程序内部",
      showCancel: false,
    })
  }
})