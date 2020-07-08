/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import {  AtAccordion   } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'
import Loading from '../../components/loading'
import ItemList from '../../components/ItemList'

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
      movieOpen:false
    }
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('index')

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


  render () {
    const { dataStore:{playingList,latestOVAList,latestMovieList}} = this.props
    const showPlayingList = playingList.slice()
    const showLatestOVAList = latestOVAList.slice()
    const showLatestMovieList = latestMovieList.slice()
    return (
      <View >
        <Shell className='at-rol' />
        <Loading />
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
      </View>
      
    )
  }
}

export default Index 
