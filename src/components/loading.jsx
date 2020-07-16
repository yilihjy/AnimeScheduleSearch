/* eslint-disable react/sort-comp */
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { observer, inject } from 'mobx-react'
import { View } from '@tarojs/components'
import { AtActivityIndicator   } from "taro-ui"


import './loading.scss'


@inject('shellStore')
@observer
class Loading extends Component {

  constructor (props) {
    super(props)
  }


  render () {
    const { shellStore: { loading } } = this.props
    return loading && (
      <View className='loading_container'>
          <AtActivityIndicator mode='center'></AtActivityIndicator>
      </View>
    )
  }
}

export default Loading 
