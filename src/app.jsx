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
    console.log(this.$router.params)
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
    const res = await Taro.request({
      url: 'https://cdn.jsdelivr.net/npm/bangumi-data@0.3/dist/data.json'
    })
    DataStore.clearFilterCache()
    dataStore.initData(res.data)
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
