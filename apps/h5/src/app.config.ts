export default definePageConfig({
  pages: [
    'pages/index/index',
    'pages/camera/camera',
    'pages/result/result',
    'pages/garden/garden',
    'pages/care-guide/care-guide',
    'pages/search/search',
    'pages/auth/auth',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#4CAF50',
    navigationBarTitleText: '植物扫描',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000,
  },
  debug: false,
});
