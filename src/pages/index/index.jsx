/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'

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
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('index')
  }

  render () {
    return (
      <View >
        <Shell className='at-rol' />
        <View className='at-rol'>
          <Text>首页</Text>
        </View>
      </View>
      
    )
  }
}

export default Index 
