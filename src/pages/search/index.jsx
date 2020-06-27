/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtSearchBar, AtList, AtListItem, AtLoadMore  } from 'taro-ui'
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
      showTip: false,
      moreStatus: 'more',
      moreLength: 10
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
      searchList: [],
      tipKeyWord: '',
      showTip: false,
      moreStatus: 'more',
      moreLength: 10
    })
    DataStore.clearFilterCache()
  }

  searchKeyword(keyword,tip) {
    if(keyword=='') {
      return
    }
    const {dataStore} = this.props
    let list = dataStore.filter({ type: 'all', year: 'all', month: 'all',keyword: keyword})
    this.setState({
      searchList: list,
      moreStatus: list.length<=10?'noMore':'more',
      moreLength: 10
    })
    if(tip) {
      this.setState({
        tipKeyWord: keyword,
        showTip: true
      })
    } else{
      this.searchKeywordDebounce.cancel()
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

  showNote(item) {
    let lang
    switch(item.lang) {
      case 'ja': 
        lang = '日文'
        break
      case 'zh-Hans': 
        lang = '简体中文'
        break
      case 'zh-Hant': 
        lang = '繁体中文'
        break
      case 'en':
        lang = '英文'
        break
      default:
        lang = item.lang
        break
    }
    return `${lang}/${item.type}`
  }

  showMoreResult() {
    if(this.state.searchList.length>this.state.moreLength) {
      if(this.state.moreLength + 10 >= this.state.searchList.length) {
        this.setState({
          moreLength: this.state.moreLength + 10,
          moreStatus: 'noMore'
        })
      }else {
        this.setState({
          moreLength: this.state.moreLength + 10
        })
      }
      
      
    }
  }

  render () {
    const searchTipList = this.state.searchList.slice(0,10).map((value)=>{
      return (
        <AtListItem
          key={value.id}
          title={this.showTitle(value)}
          arrow='right'
          iconInfo={{size: 15, value: 'search'}}
        />
      )
    })
    const searchResult = this.state.searchList.slice(0,this.state.moreLength).map((value)=>{
      return (
        <AtListItem
          key={value.id}
          title={this.showTitle(value)}
          note={this.showNote(value)}
          extraText='放送详情'
          arrow='right'
        />
      )
    })
    const searchContent = this.state.showTip ?
    (
    <View className='search-tip'>
      <AtList>
        {searchTipList}
      </AtList>
      <View className='text-center'>
        <Text className='see-search-result' onClick={this.onActionClick.bind(this)}>查看“{this.state.tipKeyWord}”的搜索结果</Text>
      </View>
    </View>
    )
    :
    (<View>
      {searchResult}
      {this.state.searchList.length>0?(
        <AtLoadMore
          onClick={this.showMoreResult.bind(this)}
          status={this.state.moreStatus}
        />):''}
    </View>)

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
          {searchContent}
        </View>
      </View>
    )
  }
}

export default Search 
