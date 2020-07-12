/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View ,Text,Image} from '@tarojs/components'
import { AtCard } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'
import ClipboardURL  from '../../components/clipboardURL'
// import ercodeimage from '../../images/contact.jpg'

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
          <Text className='display-block'  decode >源代码地址&nbsp;</Text>
          <ClipboardURL text='https://github.com/yilihjy/AnimeScheduleSearch'></ClipboardURL>
        </AtCard>
        <AtCard 
          className='about-card'
          title='联系作者'
          note='点击邮箱可以复制到剪切板'
        >
          <Text className='display-block'  decode >邮箱&nbsp;</Text>
          <ClipboardURL text='yilihjy@gmail.com'></ClipboardURL>
          <Text className='display-block'  decode >&nbsp;微信&nbsp;</Text>
          <Image className='ercode' src='../../images/contact.jpg'></Image>
          <Text className='display-block'  decode >截屏识别二维码添加作者微信，请备注小程序交流&nbsp;</Text>
        </AtCard>
        <AtCard 
          className='about-card'
          title='更新日志'
        >
          <Text className='display-block'  decode >v1.1(2020-7-10)&nbsp;</Text>
          <Text className='display-block'  decode >1.首页增加每日放送表&nbsp;</Text>
          <Text className='display-block'  decode >2.增加番剧详情页展示的内容&nbsp;</Text>
          <Text className='display-block'  decode >&nbsp;</Text>
          <Text className='display-block'  decode >v1.0(2020-7-8)&nbsp;</Text>
          <Text className='display-block'  decode >1.小程序首页&nbsp;</Text>
          <Text className='display-block'  decode >2.搜索功能&nbsp;</Text>
          <Text className='display-block'  decode >3.历史查询&nbsp;</Text>
          <Text className='display-block'  decode >4.番剧放送详情页&nbsp;</Text>
        </AtCard>
      </View>
      
    )
  }
}

export default About 
