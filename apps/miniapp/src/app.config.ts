export default definePageConfig({
  pages: [
    'pages/index/index',
    'pages/camera/camera',
    'pages/result/result',
    'pages/garden/garden',
    'pages/garden/add/add',
    'pages/care-guide/care',
    'pages/search/search',
    'pages/settings/settings'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#4CAF50',
    navigationBarTitleText: '植物扫描',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4CAF50',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tabs/home.png',
        selectedIconPath: 'assets/tabs/home-active.png'
      },
      {
        pagePath: 'pages/garden/garden',
        text: '花园',
        iconPath: 'assets/tabs/garden.png',
        selectedIconPath: 'assets/tabs/garden-active.png'
      },
      {
        pagePath: 'pages/search/search',
        text: '搜索',
        iconPath: 'assets/tabs/search.png',
        selectedIconPath: 'assets/tabs/search-active.png'
      },
      {
        pagePath: 'pages/settings/settings',
        text: '设置',
        iconPath: 'assets/tabs/settings.png',
        selectedIconPath: 'assets/tabs/settings-active.png'
      }
    ]
  },
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000
  },
  debug: false
});
