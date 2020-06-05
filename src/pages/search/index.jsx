/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtSearchBar } from 'taro-ui'
import { observer, inject } from '@tarojs/mobx'
import Shell from '../../components/shell'

import './index.scss'


@inject('dataStore')
@inject('shellStore')
@observer
class Search extends Component {

  config = {
    navigationBarTitleText: '番剧放送速查'
  }

  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('search')
  }

  onChange (value) {
    this.setState({
      value: value
    })
  }

  render () {
    return (
      <View >
        <Shell className='at-rol' />
        <View className='at-rol'>
          <AtSearchBar
            value={this.state.value}
            onChange={this.onChange.bind(this)}
          />
        </View>
      </View>
    )
  }
}

export default Search 
