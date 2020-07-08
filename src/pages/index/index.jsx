/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtList, AtListItem, AtAccordion ,AtLoadMore  } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'
import Loading from '../../components/loading'
import { formatDate} from '../../utils/dateTools'

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
      playingOpen: true,
      OVAOpen:false,
      movieOpen:false,
      moreStatus: 'more',
      moreLength: 10
    }
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('index')

  }

  onItemClick(item) {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}&year=${item.year}&month=${item.month}`
    })
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

  showMoreResult() {
    const { dataStore:{playingList}} = this.props
    const list = playingList.slice()
    if(list.length>this.state.moreLength) {
      if(this.state.moreLength + 10 >= list.length) {
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
    const { dataStore:{playingList,latestOVAList,latestMovieList}} = this.props
    return (
      <View >
        <Shell className='at-rol' />
        <Loading />
        <AtAccordion className='at-rol'
          open={this.state.playingOpen}
          onClick={this.handlePlayingClick.bind(this)}
          title='近期放送TV/WEB动画（开播时间倒序）'
        >
          <AtList hasBorder={false}>
            {
              playingList.slice(0,this.state.moreLength).map(value=>{
                let title 
                if(value.titleTranslate['zh-Hans'] && value.titleTranslate['zh-Hans'][0]) {
                  title= value.titleTranslate['zh-Hans'][0]
                } else {
                  title = value.title
                }
                return (<AtListItem
                  onClick={this.onItemClick.bind(this, value)}
                  key={value.id}
                  title={title} 
                  extraText='详细信息' 
                  arrow='right'
                  note={`开播时间${formatDate(value.begin, true)}`}
                />)
              })
            }
          </AtList>
          {
            {
              'more': <View >
                {playingList.length>0?(
                  <AtLoadMore
                    onClick={this.showMoreResult.bind(this)}
                    status={this.state.moreStatus}
                  />):''}
               </View>,
              'noMore': ''
            }[this.state.moreStatus]
          }
          
        </AtAccordion>
        <AtAccordion className='at-rol'
          open={this.state.OVAOpen}
          onClick={this.handleOVAClick.bind(this)}
          title='最近发售OVA（开播时间倒序）'
        >
          <AtList hasBorder={false}>
            {
              latestOVAList.map(value=>{
                let title 
                if(value.titleTranslate['zh-Hans'] && value.titleTranslate['zh-Hans'][0]) {
                  title= value.titleTranslate['zh-Hans'][0]
                } else {
                  title = value.title
                }
                return (<AtListItem
                  onClick={this.onItemClick.bind(this, value)}
                  key={value.id}
                  title={title} 
                  extraText='详细信息' 
                  arrow='right'
                  note={`开播时间${formatDate(value.begin, true)}`}
                />)
              })
            }
          </AtList>
        </AtAccordion>
        <AtAccordion className='at-rol'
          open={this.state.movieOpen}
          onClick={this.handleMovieClick.bind(this)}
          title='最近上映剧场动画（开播时间倒序）'
        >
          <AtList hasBorder={false}>
            {
              latestMovieList.map(value=>{
                let title 
                if(value.titleTranslate['zh-Hans'] && value.titleTranslate['zh-Hans'][0]) {
                  title= value.titleTranslate['zh-Hans'][0]
                } else {
                  title = value.title
                }
                return (<AtListItem
                  onClick={this.onItemClick.bind(this, value)}
                  key={value.id}
                  title={title} 
                  extraText='详细信息' 
                  arrow='right'
                  note={`开播时间${formatDate(value.begin, true)}`}
                />)
              })
            }
          </AtList>
        </AtAccordion>
      </View>
      
    )
  }
}

export default Index 
