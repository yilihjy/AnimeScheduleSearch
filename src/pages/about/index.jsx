/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View ,Text} from '@tarojs/components'
import { AtCard } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'
import ClipboardURL  from '../../components/clipboardURL'


import './index.scss'

@inject('shellStore')
@inject('dataStore')
@observer
class About extends Component {

  config = {
    navigationBarTitleText: '番剧放送速查'
  }

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
          <Text>源代码地址\n</Text>
          <ClipboardURL text='https://github.com/yilihjy/AnimeScheduleSearch'></ClipboardURL>
        </AtCard>
        <AtCard 
          className='about-card'
          title='联系作者'
          note='点击邮箱可以复制到剪切板'
        >
          <Text>邮箱\n</Text>
          <ClipboardURL text='yilihjy@gmail.com'></ClipboardURL>
        </AtCard>
        <AtCard 
          className='about-card'
          title='更新日志'
        >
          <Text>v1.0.0(2020-7-8)\n</Text>
          <Text>1.小程序首页\n</Text>
          <Text>2.搜索功能\n</Text>
          <Text>3.历史查询\n</Text>
          <Text>4.番剧放送详情页\n</Text>
        </AtCard>
      </View>
      
    )
  }
}

export default About 
