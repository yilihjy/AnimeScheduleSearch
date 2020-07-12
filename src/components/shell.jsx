/* eslint-disable react/sort-comp */
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtNavBar, AtDrawer   } from 'taro-ui'

import './shell.scss'


@inject('shellStore')
@observer
class Shell extends Component {

  constructor (props) {
    super(props)
    this.state = { drawerShow: false }
  }

  onMenuClick() {
    this.setState({drawerShow: true})
  }

  onDrawerClose() {
    this.setState({drawerShow: !this.state.drawerShow})
  }

  onDrawerItemClick(index) {
    console.info(`onDrawerItemClick(${index})`)
    const { shellStore } = this.props
    shellStore.changeMeum(index)

  }

  onSearchClick() {
    console.info('onSearchClick()')
    const { shellStore } = this.props
    shellStore.navigateByName('search')
  }

  render () {
    const { shellStore: { title, meumItems, hideSearchButton } } = this.props
    return (
      <View className='shell'>
        <AtNavBar
          title={title}
          rightFirstIconType='menu'
          rightSecondIconType={hideSearchButton? '': 'search'}
          fixed
          border
          onClickRgIconSt={this.onMenuClick.bind(this)}
          onClickRgIconNd={this.onSearchClick.bind(this)}
        />
        <AtDrawer 
          show={this.state.drawerShow} 
          mask 
          onClose={this.onDrawerClose.bind(this)} 
          onItemClick={this.onDrawerItemClick.bind(this)}
          items={meumItems.slice()} // tip:https://cn.mobx.js.org/refguide/array.html
        ></AtDrawer>
      </View>
      
    )
  }
}

export default Shell 
