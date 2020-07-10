/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View,Text } from '@tarojs/components'
import {  AtAccordion, AtTabBar, AtTabs, AtTabsPane, AtList, AtListItem, AtActivityIndicator, AtButton    } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import _isEmpty from 'lodash/isEmpty'
import Shell from '../../components/shell'
import Loading from '../../components/loading'
import ItemList from '../../components/ItemList'
import {dateStringToMonthString, dateStringToYearString} from '../../utils/dateTools'

import './index.scss'


@inject('dataStore')
@inject('shellStore')
@observer
class Index extends Component {

  config = {
    navigationBarTitleText: '番剧放送速查'
  }

  constructor (props) {
    super(props)
    this.state = {
      playingOpen: false,
      OVAOpen: false,
      movieOpen: false,
      atTabBarCurrent: 0,
      atTabsCurrent: (new Date()).getDay(),
      showCalendarFailButton: false
    }
  }

  componentWillMount() {
    // this.requestData()
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('index')
    Taro.showShareMenu({
      withShareTicket: false
    })
  }

  async requestData() {
    const { dataStore: {hasCalendarData, initCalendarData, initCalendarDataFromCache}} = this.props
    if(!hasCalendarData) {
      try {
        const res = await Taro.request({
          url: 'https://cdn.jsdelivr.net/npm/anime-sachedule-search-data@0.1/dist/calendar.json'
        })
        initCalendarData(res.data)
      } catch (error) {
        initCalendarDataFromCache((result)=>{
          if(!result) {
            Taro.showToast({
              title: '获取每日放送数据失败',
              icon:'none',
              duration: 2000
            })
            this.setState({
              showCalendarFailButton: true
            })
          }
        })
      }
    }
  }

  handlePlayingClick (value) {
    this.setState({
      playingOpen: value
    })
  }

  handleOVAClick (value) {
    this.setState({
      OVAOpen: value
    })
  }

  handleMovieClick (value) {
    this.setState({
      movieOpen: value
    })
  }

  onAtTabBarClick(value) {
    this.setState({
      atTabBarCurrent: value
    })
  }

  onAtTabsClick (value) {
    this.setState({
      atTabsCurrent: value
    })
  }

  onCalendarItemClick(item) {
    Taro.navigateTo({
      url: `/pages/detail/index?bgmid=${item.id}&year=${dateStringToYearString(item.air_date)}&month=${dateStringToMonthString(item.air_date)}`
    })
  }

  render () {
    const { dataStore:{playingList,latestOVAList,latestMovieList,calendarData}} = this.props
    const showPlayingList = playingList.slice()
    const showLatestOVAList = latestOVAList.slice()
    const showLatestMovieList = latestMovieList.slice()
    const showCalendarData = calendarData.slice()
    const {showCalendarFailButton,atTabBarCurrent,atTabsCurrent} = this.state
    return (
      <View >
        <Shell className='at-rol' />
        <Loading />
        {atTabBarCurrent==1 && 
        (<View className='recent-air'>
          <AtAccordion className='at-rol'
            open={this.state.playingOpen}
            onClick={this.handlePlayingClick.bind(this)}
            title='近期放送TV/WEB动画'
            note='开播时间倒序'
            icon={{value:'list', color:'#f09199'}}
          > 
          <ItemList list={showPlayingList}></ItemList>  
        </AtAccordion>
        <AtAccordion className='at-rol'
          open={this.state.OVAOpen}
          onClick={this.handleOVAClick.bind(this)}
          title='最近发售OVA'
          note='开播时间倒序'
          icon={{value:'list', color:'#f09199'}}
        >
          <ItemList list={showLatestOVAList}></ItemList>
        </AtAccordion>
        <AtAccordion className='at-rol'
          open={this.state.movieOpen}
          onClick={this.handleMovieClick.bind(this)}
          title='最近上映剧场动画'
          note='开播时间倒序'
          icon={{value:'list', color:'#f09199'}}
        >
          <ItemList list={showLatestMovieList}></ItemList>
        </AtAccordion>
        </View>)}
        {atTabBarCurrent==0 && (
        <View className='recent-air'>
          <AtTabs
            current={atTabsCurrent}
            scroll
            tabList={[
              { title: '周日' },
              { title: '周一' },
              { title: '周二' },
              { title: '周三' },
              { title: '周四' },
              { title: '周五' },
              { title: '周六' },
            ]}
            onClick={this.onAtTabsClick.bind(this)}
          >
            {showCalendarData.map((value,index)=>{
              return (
                <AtTabsPane key={+index}  current={atTabsCurrent} index={index}>
                  <AtList >{value.map((item)=>{
                    return (
                    <AtListItem  
                      key={item.id}
                      title={item.name_cn ||item.name}
                      arrow='right'
                      thumb={item.images.grid}
                      onClick={this.onCalendarItemClick.bind(this,item)}
                    />)
                  })}</AtList>
                </AtTabsPane>
              )
            })}
          </AtTabs>
          {_isEmpty(showCalendarData) && 
          <View className='activity-container'>
            {!showCalendarFailButton &&<AtActivityIndicator content='加载中...' mode='center' />}
            {showCalendarFailButton && <View className='reload-button'><AtButton onClick={this.requestData.bind(this)}  type='primary' size='small' full={false}>重新加载</AtButton></View>}
          </View>}
          <View className='tip'><Text >提示：部分日本动画播出时间为当地时间，可能与国内平台播出时间相差一天，可以进入详情页查看国内平台播出时间</Text></View>
        </View>)}
        <AtTabBar
          fixed
          tabList={[
            { title: '每日放送', iconType: 'calendar'},
            { title: '最近放送', iconType: 'bullet-list' }
          ]}
          onClick={this.onAtTabBarClick.bind(this)}
          current={atTabBarCurrent}
        />
      </View> 
    )
  }
}

export default Index 
