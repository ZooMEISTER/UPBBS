// pages/RegisterPage/RegisterPage.ts
const app_RegisterPage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_RegisterPage = wx.cloud.database();

Page({

  /* 页面的初始数据 */
  data: {
    tempRegisterUserAvatarUrl: "",  //注册用户时的临时用户头像url
    tempRegisterUserID: "",  //注册用户时的临时用户id  这个是系统自动生成的 用于表示哪些内容属于该用户
    tempRegisterUserName: "",  //注册用户时的临时用户名
    tempRegisterUserPassword: "",  //注册用户时的临时用户密码
    tempRegisterUserPassword2: "",  //注册用户时的临时用户密码的重复密码
    tempRegisterUserChosenSchool: "隐藏学校", //注册用户临时选择的学校 默认为隐藏
    allSchoolsList_RegisterPage: [] as string[],  //所有大学的列表的RegisterPage分变量，与全局变量allSchoolsList同步
  },

  /* 生命周期函数--监听页面加载 */
  onLoad() {
    var page = this
    // //要更新学校列表了，先清空并压入“隐藏”
    // app_RegisterPage.globalData.allSchoolsList = []
    // app_RegisterPage.globalData.allSchoolsList.push("隐藏")
    // //更新一下所有学校列表
    // const dbAllSchoolList_for_Register = db_RegisterPage.collection('Cloud_db_AllSchoolList') //获取引用
    // dbAllSchoolList_for_Register.get({
    //   success:function(res){
    //     for(var i = 0;i < res.data.length;++i){ //遍历云数据库 同步学校信息
    //       app_RegisterPage.globalData.allSchoolsList.push(res.data[i].schoolname)
    //     }
    //     //在末尾加上其他大学
    //     app_RegisterPage.globalData.allSchoolsList.push("其他大学")
    //     console.log(app_RegisterPage.globalData.allSchoolsList)

    //     page.setData({ //将全局遍历所有大学列表同步到局部变量所有大学列表
    //       allSchoolsList_RegisterPage: app_RegisterPage.globalData.allSchoolsList,
    //     })
    //   }
    // })
    page.setData({ //将全局遍历所有大学列表同步到局部变量所有大学列表
      allSchoolsList_RegisterPage: app_RegisterPage.globalData.allSchoolsList,
    })
  },

  //输入注册用户用户名时同步数据
  inputRegisterUserName:function(e:any){
    this.setData({
      tempRegisterUserName: e.detail.value
    })
  },

  //输入注册用户密码时同步数据
  inputRegisterUserPassword:function(e:any){
    this.setData({
      tempRegisterUserPassword: e.detail.value
    })
  },
  //输入注册用户密码时同步数据 此为重复密码
  inputRegisterUserPassword2:function(e:any){
    this.setData({
      tempRegisterUserPassword2: e.detail.value
    })
  },

  // 上传注册用户头像按钮事件
  UploadRegisterUserAvatar:function(){
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
            //先删除原先可能已上传的头像文件
            if(page.data.tempRegisterUserAvatarUrl != ""){ //若头像url不为空，说明已上传过一张头像
              wx.cloud.deleteFile({ //删除无用的头像
                fileList: [page.data.tempRegisterUserAvatarUrl],
                success: res => {
                  // handle success
                  console.log("delete file:" + res.fileList)
                },
                fail: console.error
              })
            }
            page.setData({
              tempRegisterUserAvatarUrl:res2.fileID
            })
          }
        })
      }
    })
  },

  //用户更改自己学校事件
  schoolPickerChange:function(e:any){
    //console.log(e)
    this.setData({
      tempRegisterUserChosenSchool: this.data.allSchoolsList_RegisterPage[e.detail.value]
    })
  },

  //判断生成的id是否可用 注册的第三步
  RegisterNewUserStep03:function(){
    var page = this
    //先随机生成一个ID
    var inputTempRegisterUserID = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    const dbAllUserList_for_Register = db_RegisterPage.collection('Cloud_db_AllUserList') //获取引用
    dbAllUserList_for_Register.get({ //获取数据
      success:function(res){
        var isUserIDAvailable = true //局部变量 用于表示随机生成的id是否可用
        for(var i:number = 0;i < res.data.length;i++){ //遍历判断id是否可用
          if(inputTempRegisterUserID == res.data[i].userid){
            isUserIDAvailable = false
          }
        }
        while(isUserIDAvailable == false){ //若id不可用（已被占用）
          isUserIDAvailable = true
          inputTempRegisterUserID = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
          for(var i:number = 0;i < res.data.length;i++){ //遍历判断id是否可用
            if(inputTempRegisterUserID == res.data[i].userid){
              isUserIDAvailable = false
            }
          }
        }
        page.setData({ //将生成的id赋给temp变量
          tempRegisterUserID: inputTempRegisterUserID,
        })

        //此时注册信息完全具备
        //tempRegisterUserAvatarUrl 为注册用户头像的url
        //tempRegisterUserID 为注册用户的id
        //tempRegisterUserName 为注册用户的用户名
        //tempRegisterUserPassword 为注册用户的密码
        //tempRegisterUserChosenSchool 为注册用户选择的学校
        console.log("tempRegisterUserAvatarUrl" + page.data.tempRegisterUserAvatarUrl)
        console.log("tempRegisterUserID" + page.data.tempRegisterUserID)
        console.log("tempRegisterUserName" + page.data.tempRegisterUserName)
        console.log("tempRegisterUserPassword" + page.data.tempRegisterUserPassword)
        console.log("tempRegisterUserChosenSchool" + page.data.tempRegisterUserChosenSchool)

        //开始对云数据库操作
        dbAllUserList_for_Register.add({
          data:{
            _id:page.data.tempRegisterUserID,
            avatarurl:page.data.tempRegisterUserAvatarUrl,
            name:page.data.tempRegisterUserName,
            password:page.data.tempRegisterUserPassword,
            userid:page.data.tempRegisterUserID,
            school:page.data.tempRegisterUserChosenSchool,
            latestclockindates: [],
            mypost:[],
            history:[],
          }
        })
        //新用户添加成功
        console.log("new user add success")

        //将用户信息同步到全局变量
        app_RegisterPage.globalData.isUserLogged = true
        app_RegisterPage.globalData.loggedUserID = page.data.tempRegisterUserID
        app_RegisterPage.globalData.loggedUserName = page.data.tempRegisterUserName
        app_RegisterPage.globalData.loggedUserPassword = page.data.tempRegisterUserPassword
        app_RegisterPage.globalData.loggedUserAvatarURL = page.data.tempRegisterUserAvatarUrl
        app_RegisterPage.globalData.loggedUserSchool = page.data.tempRegisterUserChosenSchool

        //自动返回MePage并登录
        wx.navigateBack()
      }
    })
  },

  //判断该用户名是否可用 注册的第二步
  RegisterNewUserStep02:function(){
    var page = this
    const dbAllUserList_for_Register = db_RegisterPage.collection('Cloud_db_AllUserList') //获取引用
    dbAllUserList_for_Register.get({ //获取数据
      success:function(res){
        var isUserNameAvailable = true //局部变量 用于表示该用户名称是否可用
        for(var i:number = 0;i < res.data.length;i++){ //遍历判断Name是否可用
          if(page.data.tempRegisterUserName == res.data[i].name){
            isUserNameAvailable = false
          }
        }

        if(isUserNameAvailable){  //若该名称未被占用
          page.RegisterNewUserStep03()
        }
        else{  //若该名称已被占用
          wx.showToast({title:'该用户名已被占用',icon : "none",duration: 2500,})
        }
      }
    })
  },

  //注册新用户按钮 第一阶段
  RegisterNewUserStep01:function(){
    //先进行注册信息合法性的判断
    if(this.data.tempRegisterUserAvatarUrl == ""){ //若没有头像
      wx.showToast({title:'头像不能为空',icon : "none",duration: 2500,})
    }
    else if(this.data.tempRegisterUserName == ""){  //若用户名为空
      wx.showToast({title:'用户名不能为空',icon : "none",duration: 2500,})
    }
    else if(this.data.tempRegisterUserPassword.length < 6){ //若密码长度小于6位
      wx.showToast({title:'密码长度不得小于6位',icon : "none",duration: 2500,})
    }
    else if(this.data.tempRegisterUserPassword != this.data.tempRegisterUserPassword2){ //若两次输入的密码不一致
      wx.showToast({title:'两次输入密码不相同',icon : "none",duration: 2500,})
    }
    else{ //输入信息完全合法 开始注册
      console.log("start registering")
      //const dbAllUserList_for_Register = db_RegisterPage.collection('Cloud_db_AllUserList')
      this.RegisterNewUserStep02()  //调用注册第二阶段过程
    }
  }

})