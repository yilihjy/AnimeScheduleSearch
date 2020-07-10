import Taro, { Component } from '@tarojs/taro'
import { Provider, onError } from '@tarojs/mobx'
import Index from './pages/index'
import shellStore from './store/shell'
import dataStore, {DataStore} from './store/data'

import './app.scss'

const store = {
  shellStore,
  dataStore
}

class App extends Component {

  componentWillMount() {
    onError(error => {
      console.log('mobx global error listener:', error)
    })
    this.requestData()
  }

  componentDidMount () {}

  config = {
    pages: [
      'pages/index/index',
      'pages/about/index',
      'pages/detail/index',
      'pages/history/index',
      'pages/historyList/index',
      'pages/search/index'
      
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  async requestData() {
    shellStore.showLoading()
    if(DataStore.checkCache()) {
      dataStore.initDataFromCache(()=>{
        shellStore.hideLoading()
        console.log('基础数据无需更新')
      },true)
    } else {
      try {
        const res = await Taro.request({
          url: 'https://cdn.jsdelivr.net/npm/anime-sachedule-search-data@0.1/dist/data.json'
        })
        DataStore.clearFilterCache()
        dataStore.initData(res.data,()=>{
          shellStore.hideLoading()
        })
        
      } catch (error) {
        DataStore.clearFilterCache()
        dataStore.initDataFromCache((result)=>{
          if(result) {
            Taro.showToast({
              title: '获取最新基础数据失败，使用缓存数据',
              icon:'none',
              duration: 2000
            })
            shellStore.hideLoading()
          }else {
            dataStore.initDataFromLocal(()=>{
              Taro.showToast({
                title: '获取最新基础数据失败，使用本地数据',
                icon:'none',
                duration: 1000
              })
              shellStore.hideLoading()
            })
          }
        })
        console.log(error)
      }
    }
   
  }

  

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
