/* eslint-disable react/sort-comp */
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtAccordion, AtPagination , AtList, AtListItem, AtTabBar  } from 'taro-ui'


import Shell from '../../components/shell'

import './index.scss'


@inject('dataStore')
@inject('shellStore')
@observer
class History extends Component {

  constructor (props) {
    super(props)
    this.state = {
      openMap:{},
      pageStart: 0,
      pageSize:10,
      atTabBarCurrent: 2,
      currentPage:1
    }
  }

  componentDidShow() {
    const {shellStore} = this.props
    const { dataStore: {yearKey}} = this.props
    const openMap = {}
    yearKey.forEach(item=>{
      openMap[item] = false
    })
    this.setState({openMap})
    shellStore.whenInitPage('history')
  }

  handleClick(key) {
    const openMap = this.state.openMap 
    openMap[key] = !openMap[key]
    this.setState({
      openMap
    })
  }

  onYearPageChange({type,current}){
    if(type=='next') {
      this.setState({
        pageStart: ( current - 1) * this.state.pageSize,
        currentPage: current 
      })
    }else {
      this.setState({
        pageStart: ( current - 1) * this.state.pageSize,
        currentPage: current 
      })
    }
  }

  buildMonth(yearMonthKey,year) {
   return  (<AtList>
    {yearMonthKey[year].slice().map((item)=>{
      return   <AtListItem 
        key={year+item} 
        title={`${year}年${item}月开播动画`} 
        arrow='right'
        onClick={this.onItemClick.bind(this,year,item)}
      />
    })}
  </AtList>)
  }

  onItemClick(year,month) {
    Taro.navigateTo({
      url: `/pages/historyList/index?year=${year}&month=${month}`
    })
  }

  onAtTabBarClick(value) {
    if(value!==2) {
      Taro.redirectTo({
        url: `/pages/index/index?attab=${value}`
      })
    }
    this.setState({
      atTabBarCurrent: value
    })
  }

  render () {
    const { dataStore: {yearKey,yearMonthKey}} = this.props
    const {atTabBarCurrent} = this.state
    const total  = yearKey.slice().length
    const current = this.state.currentPage
    return (
      <View >
        <Shell className='at-rol' />
        <View className='at-rol'>
          {yearKey.sort().reverse().slice(this.state.pageStart,this.state.pageStart+this.state.pageSize).map(value=>{
           return <AtAccordion
             key={value}
             open={this.state.openMap[value]}
             onClick={this.handleClick.bind(this,value)}
             title={`${value}年开播动画`}
           >
             {this.buildMonth(yearMonthKey,value)}
           </AtAccordion>
          })}
        </View>
        <View className='pagination'>
          <AtPagination
            icon  
            total={total} 
            pageSize={10}
            current={current}
            onPageChange={this.onYearPageChange.bind(this)}
          >
          </AtPagination>
        </View>
        <AtTabBar
          fixed
          tabList={[
            { title: '每日放送', iconType: 'calendar'},
            { title: '最近放送', iconType: 'bullet-list' },
            { title: '历史查询', iconType: 'folder' }
          ]}
          onClick={this.onAtTabBarClick.bind(this)}
          current={atTabBarCurrent}
        />
      </View>
      
    )
  }
}

export default History 
