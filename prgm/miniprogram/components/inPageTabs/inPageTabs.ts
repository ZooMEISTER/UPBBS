// components/inPageTabs/inPageTabs.ts
Component({
  /* 组件的属性列表 */
  properties: {
    //从父组件传递过来的tabs数组
    tabs:{
      type:Array,
      value:[]
    }
  },

  /* 组件的初始数据 */
  data: {

  },

  /* 组件的方法列表 */
  methods: {
    //点击tabs的标题事件 绑定点击事件
    handleItemTap:function(e:any){
      console.log(e)

      //获取被点击项目的索引
      const tappedItemIndex = e.currentTarget.dataset.index

      //点击事件触发时，触发父组件中的自定义事件，同时把索引传递给父组件
      this.triggerEvent("itemChange",tappedItemIndex)
    }
  }
})
