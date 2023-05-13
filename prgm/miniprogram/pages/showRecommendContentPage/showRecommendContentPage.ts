// pages/showRecommendContentPage/showRecommendContentPage.ts
const app_showRecommendContentPage = getApp()
wx.cloud.init({
  env: "cloud1-5gy723zk5fbe2c6a"
});
const db_showRecommendContentPage = wx.cloud.database();

Page({

  /* 页面的初始数据 */
  data: {
    recommendContentType: "",  //用于表示当前显示的是顶部推荐还是次要推荐
    recommendContentNum: 0,  //表示如果是次要推荐，则推荐的编号
    coverImageURL: "",  //推荐内容的封面url
    recommendContentTitle: "",  //推荐内容的标题内容
    recommendContent: "",  //推荐内容的正文内容
    recommendContentPublishDate: "",  //推荐内容的发布时间
  },

  /* 生命周期函数--监听页面加载 */
  onLoad() {
    this.setData({
      recommendContentType: wx.getStorageSync("RCType"),
      recommendContentNum: wx.getStorageSync("RCNum"),
    })
    const dbAllRecommendContents_local = db_showRecommendContentPage.collection("Cloud_db_RecommendContent")
    var page = this
    console.log(this.data.recommendContentType)

    if(this.data.recommendContentType == "T01"){  //顶部推荐01
      dbAllRecommendContents_local.doc("MajorRecommendContents").get({
        success:function(res){
          //console.log(res.data)
          page.setData({
            recommendContentTitle: res.data.content01[0],
            coverImageURL: res.data.content01[1],
            recommendContent: res.data.content01[2],
            recommendContentPublishDate: res.data.content01[3],
          })
        }
      })
    }
    else if(this.data.recommendContentType == "T02"){  //顶部推荐02
      dbAllRecommendContents_local.doc("MajorRecommendContents").get({
        success:function(res){
          //console.log(res.data)
          page.setData({
            recommendContentTitle: res.data.content02[0],
            coverImageURL: res.data.content02[1],
            recommendContent: res.data.content02[2],
            recommendContentPublishDate: res.data.content02[3],
          })
        }
      })
    }
    else if(this.data.recommendContentType == "T03"){  //顶部推荐03
      dbAllRecommendContents_local.doc("MajorRecommendContents").get({
        success:function(res){
          //console.log(res.data)
          page.setData({
            recommendContentTitle: res.data.content03[0],
            coverImageURL: res.data.content03[1],
            recommendContent: res.data.content03[2],
            recommendContentPublishDate: res.data.content03[3],
          })
        }
      })
    }
    else if(this.data.recommendContentType == "MinorRC"){  //次要推荐
      dbAllRecommendContents_local.doc("MinorRecommendContents").get({
        success:function(res){
          console.log(res.data)
          page.setData({
            recommendContentTitle: res.data.contents[res.data.contents.length - page.data.recommendContentNum - 1][0],
            coverImageURL: res.data.contents[res.data.contents.length - page.data.recommendContentNum - 1][1],
            recommendContent: res.data.contents[res.data.contents.length - page.data.recommendContentNum - 1][2],
            recommendContentPublishDate: res.data.contents[res.data.contents.length - page.data.recommendContentNum - 1][3],
          })
        }
      })
    }
  },

})