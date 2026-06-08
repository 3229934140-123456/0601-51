export default defineAppConfig({
  pages: [
    'pages/overview/index',
    'pages/alert/index',
    'pages/host/index',
    'pages/inspection/index',
    'pages/duty/index',
    'pages/service/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '运维监控平台',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/overview/index',
        text: '总览'
      },
      {
        pagePath: 'pages/alert/index',
        text: '告警'
      },
      {
        pagePath: 'pages/host/index',
        text: '主机'
      },
      {
        pagePath: 'pages/inspection/index',
        text: '巡检'
      },
      {
        pagePath: 'pages/duty/index',
        text: '值班'
      }
    ]
  }
})
