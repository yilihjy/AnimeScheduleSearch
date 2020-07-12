/* eslint-disable react/sort-comp */
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View ,Text,Image} from '@tarojs/components'
import { AtCard } from "taro-ui"
import { observer, inject } from 'mobx-react'
import Shell from '../../components/shell'
import ClipboardURL  from '../../components/clipboardURL'
// import ercodeimage from '../../images/contact.jpg'

import './index.scss'

@inject('shellStore')
@inject('dataStore')
@observer
class About extends Component {

  constructor (props) {
    super(props)
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('about')
  }

  render () {
    return (
      <View  className='about'>
        <Shell className='at-rol' />
        <AtCard 
          className='about-card'
          title='开源项目'
          note='点击网址可以复制到剪切板'
        >
          <Text>源代码地址</Text>
          <ClipboardURL text='https://github.com/yilihjy/AnimeScheduleSearch'></ClipboardURL>
        </AtCard>
        <AtCard 
          className='about-card'
          title='联系作者'
          note='点击邮箱可以复制到剪切板'
        >
          <Text>邮箱</Text>
          <ClipboardURL text='yilihjy@gmail.com'></ClipboardURL>
          <Text>微信</Text>
          <Image className='ercode' src='../../images/contact.jpg'></Image>
          <Text>截屏识别二维码添加作者微信，请备注小程序交流</Text>
        </AtCard>
        <AtCard 
          className='about-card'
          title='更新日志'
        >
          <Text>v1.1(2020-7-10)</Text>
          <Text>1.首页增加每日放送表</Text>
          <Text>2.增加番剧详情页展示的内容</Text>
          
          <Text>v1.0(2020-7-8)</Text>
          <Text>1.小程序首页</Text>
          <Text>2.搜索功能</Text>
          <Text>3.历史查询</Text>
          <Text>4.番剧放送详情页</Text>
        </AtCard>
      </View>
      
    )
  }
}

export default About 
