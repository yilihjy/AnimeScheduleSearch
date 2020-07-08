/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtList, AtListItem,AtLoadMore  } from "taro-ui"
import './ItemList.scss'
import { formatDate} from '../utils/dateTools'


class ItemList extends Component {

  constructor (props) {
    super(props)
    this.state = { 
        // list: props.list || [],
        moreStatus: 'more',
        moreLength: 10
    }
  }

  onItemClick(item) {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}&year=${item.year}&month=${item.month}`
    })
  }

  showMoreResult() {
    const list = this.state.list.slice()
    if(list.length>this.state.moreLength) {
      if(this.state.moreLength + 10 >= list.length) {
        this.setState({
          moreLength: this.state.moreLength + 10,
          moreStatus: 'noMore'
        })
      }else {
        this.setState({
          moreLength: this.state.moreLength + 10
        })
      }
    }
  }

  render () {
    const {moreLength,moreStatus} = this.state
    const {list} = this.props
    return (
        <AtList hasBorder={false}>
        {
          list.slice(0,moreLength).map(value=>{
            let title 
            if(value.titleTranslate['zh-Hans'] && value.titleTranslate['zh-Hans'][0]) {
              title= value.titleTranslate['zh-Hans'][0]
            } else {
              title = value.title
            }
            return (
            <AtListItem
              onClick={this.onItemClick.bind(this, value)}
              key={value.id}
              title={title} 
              extraText='详细信息' 
              arrow='right'
              note={`开播时间${formatDate(value.begin, true)}`}
            />)
          })
        }
        {
            {
              'more': <View>
                {list.length>moreLength?(
                  <AtLoadMore
                    onClick={this.showMoreResult.bind(this)}
                    status={moreStatus}
                    moreBtnStyle={{
                        border:'0px solid'
                    }}
                  />):''}
               </View>,
              'noMore': ''
            }[moreStatus]
          }
      </AtList>
    )
  }
}

ItemList.defaultProps ={
    list:[]
}

export default ItemList 
