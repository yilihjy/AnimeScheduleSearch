/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View,Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'

import './index.scss'

@inject('shellStore')
@inject('dataStore')
@observer
class Detail extends Component {

  config = {
    navigationBarTitleText: '番剧放送速查'
  }

  constructor (props) {
    super(props)
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('detail')
  }

  render () {
    return (
      <View >
        <Shell className='at-rol' />
        <View className='at-rol'>
          <Text>详情页</Text>
        </View>
      </View>
      
    )
  }
}

export default Detail 
