/* eslint-disable react/sort-comp */
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { Text } from '@tarojs/components'

import './clipboardURL.scss'


class ClipboardURL extends Component {

  constructor (props) {
    super(props)
    this.state = { text: props.text }
  }

  onClickURL() {
    Taro.setClipboardData({
        data: this.state.text,
        success: function () {
        }
      })
  }

  render () {
    return (
      <Text className='display-block clip'  decode  onClick={this.onClickURL.bind(this)}>
          {this.state.text}
      </Text>
    )
  }
}

export default ClipboardURL 
