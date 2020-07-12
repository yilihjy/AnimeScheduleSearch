/* eslint-disable react/sort-comp */
import Taro, { getCurrentInstance } from '@tarojs/taro'
import React, { Component }  from 'react'
import { View } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import Shell from '../../components/shell'
import ItemList from '../../components/ItemList'



import './index.scss'

@inject('shellStore')
@inject('dataStore')
@observer
class HistoryList extends Component {

  constructor (props) {
    super(props)
    this.state = {
        list : []
    }
  }

  componentDidShow() {
    const {year,month} = getCurrentInstance().router.params
    const {shellStore, dataStore} = this.props
    shellStore.whenInitPage(`${year}年${month-0}月开播动画`)
    const list = dataStore.filter({year,month})
    this.setState({
        list:list
    })

  }

  render () {
    const {list} = this.state
    return (
      <View >
        <Shell className='at-rol' />
        <ItemList list={list}></ItemList>
      </View>
      
    )
  }
}

export default HistoryList 
