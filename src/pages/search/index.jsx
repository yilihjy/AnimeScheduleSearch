/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtSearchBar } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'
import { DataStore} from '../../store/data'

import './index.scss'


@inject('dataStore')
@inject('shellStore')
@observer
class Search extends Component {

  config = {
    navigationBarTitleText: '番剧放送速查'
  }

  constructor (props) {
    super(props)
    this.state = {
      value: '',
      
    }
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('search')
    DataStore.clearFilterCache()
  }

  componentDidHide() {
    DataStore.clearFilterCache()
  }

  onChange (value) {
    const {dataStore} = this.props
    this.setState({
      value: value
    })
    if(value) {
      console.log(dataStore.filter({ type: 'all', year: 'all', month: 'all',keyword: value}))
    }
  }

  onClear () {
    DataStore.clearFilterCache()
  }

  // searchTip (keyword) {
  //   if(keyword.length==0) return
  //   console.debug('start')
  //   const {dataStore: {search, searchResult}} = this.props
  //   console.debug('end')
  //   search(keyword)
  //   console.log(searchResult)
  // }

  render () {
    return (
      <View >
        <Shell className='at-rol' />
        <View className='at-rol'>
          <AtSearchBar
            value={this.state.value}
            onChange={this.onChange.bind(this)}
            onClear={this.onClear.bind(this)}
          />
        </View>
      </View>
    )
  }
}

export default Search 
