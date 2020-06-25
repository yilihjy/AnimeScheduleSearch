/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtSearchBar, AtList, AtListItem } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import _debounce  from 'lodash.debounce'
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
      searchList: [],
      tipKeyWord: '',
      showTip: false
    }
    this.searchList
    this.searchKeywordDebounce = _debounce(this.searchKeyword,1000) // 搜索框防抖
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
    this.setState({
      value: value
    })
    if(value) {
      this.searchKeywordDebounce(value,true)
    } else {
      this.setState({
        searchList: [],
        tipKeyWord: '',
        showTip: false
      })
    }
  }

  onClear () {
    this.setState({
      value: '',
      tipKeyWord: '',
      showTip: false
    })
    DataStore.clearFilterCache()
  }

  searchKeyword(keyword,tip) {
    if(keyword=='') {
      return
    }
    const {dataStore} = this.props
    this.setState({
      searchList: dataStore.filter({ type: 'all', year: 'all', month: 'all',keyword: keyword}),
    })
    if(tip) {
      this.setState({
        tipKeyWord: keyword,
        showTip: true
      })
    } else{
      this.setState({
        tipKeyWord: '',
        showTip: false
      })
    }
  }

  onConfirm() {
    this.searchKeyword(this.state.value)
  }

  onActionClick() {
    this.searchKeyword(this.state.value)
  }

  showTitle(item) {
    return DataStore.matchTitle(item,this.state.value)
  }

  render () {
    const searchTipList = this.state.searchList.slice(0,10).map((value,index)=>{
      return (
        <AtListItem
          key={index}
          title={this.showTitle(value)}
          arrow='right'
          iconInfo={{size: 15, value: 'search'}}
        />
      )
    })
    const searchTip = this.state.showTip ?
    (
    <View className='search-tip'>
      <AtList>
        {searchTipList}
      </AtList>
      <View className='text-center'>
        <Text className='see-search-result' onClick={this.onActionClick.bind(this)}>查看{this.state.tipKeyWord}搜索结果</Text>
      </View>
    </View>
    )
    :
    (<View></View>)

    return (
      <View >
        <Shell className='at-rol' />
        <View className='at-rol'>
          <AtSearchBar
            value={this.state.value}
            onChange={this.onChange.bind(this)}
            onClear={this.onClear.bind(this)}
            onConfirm={this.onConfirm.bind(this)}
            onActionClick={this.onActionClick.bind(this)}
            placeholder='输入番剧名称'
          />
          {searchTip}
        </View>
      </View>
    )
  }
}

export default Search 
