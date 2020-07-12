import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { Provider } from 'mobx-react'
import shellStore from './store/shell'
import dataStore, {DataStore} from './store/data'

import './app.scss'

// const store = {
//   shellStore,
//   dataStore
// }

class App extends Component {

  componentDidMount() {
    this.requestData()
  }

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
            Taro.showToast({
              title: '获取最新基础数据失败',
              icon:'none',
              duration: 3000
            })
            shellStore.hideLoading()
            dataStore.allowRetry()
          }
        })
        shellStore.hideLoading()
        dataStore.allowRetry()
      }
    }
   
  }

  

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider shellStore={shellStore} dataStore={dataStore}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
