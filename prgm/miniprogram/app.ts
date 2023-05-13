// app.ts
App<IAppOption>({
  globalData: {
    isUserLogged: false,  //全局变量 用于标识用户是否登录
    //当用户未登录时ID和Name和AvatarURL应均为空
    loggedUserID: "",     //全局变量 用户ID
    loggedUserName: "",     //全局变量 用户姓名
    loggedUserPassword: "", //全局变量 用户登陆密码
    loggedUserAvatarURL: "", //全局变量，用户头像URL
    loggedUserSchool:"", //全局变量 用户的学校
    loggedUserClockInCount: 0, //全局变量 用户的累计签到天数
    loggedUserLatestClockInDates: [] as any[], //全局变量 用户的所有签到日期
    allSchoolsList: [] as string[], //所有学校的列表
    allPost:[],  //所有的帖子
    myPostPageStatus:"", //决定了myPostPage页面所显示的内容 mypost显示用户的帖子，history显示浏览历史
    maxHistoryCount: 30,  //用户的浏览历史记录的上限数量
  },
})