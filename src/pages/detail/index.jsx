/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View,Text } from '@tarojs/components'
import { AtCard } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import Shell from '../../components/shell'
import  { DataStore } from '../../store/data'
import { formatDate} from '../../utils/dateTools'
import ClipboardURL from '../../components/clipboardURL'


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
    this.state = {
      bangumiData: {},
      showDownloadSite: true,
      showForeignSite: true,
      onlineList: [],
      infoList: [],
      downloadList: [],
      foreignList: [],
      isNew: false
    } 
  }

  componentWillMount () {
    const params = this.$router.params
    this.queryData(params.id, params.year, params.month)
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('detail')
    this.filterSites()
  }

  queryData(id, year, month) {
    const {dataStore} = this.props
    try {
      const result = dataStore.filter({year,month}).filter((value)=>{
        return value.id == id
      })
      if(result.length == 1) {
        this.setState({
          bangumiData: result[0]
        })
        if(result[0].type=='tv' && result[0].end=='') {
          this.setState({
            isNew: true
          })
        }
      } else {
        console.log('没有查询到番剧信息')
      }
    } catch (error) {
      console.log(id, year, month)
      console.log(error)
    }
  }


  filterSites() {
    const {dataStore} = this.props
    const siteMeta = dataStore.siteMeta
    let onlineList = []
    let infoList = []
    let downloadList = []
    let foreignList = []
    this.state.bangumiData.sites.forEach(element => {
      const siteData = siteMeta[element.site]
      element.playURL = element.url ||siteData.urlTemplate.replace('{{id}}',element.id)
      element.siteTitle = siteData.title
      switch(element.site) {
        case 'acfun':
        case 'bilibili':
        case 'iqiyi':
        case 'letv':
        case 'mgtv':
        case 'pptv':
        case 'qq':
        case 'sohu':
        case 'youku':
          this.setState({
            showDownloadSite: false,
            showForeignSite: false
          })
          onlineList.push(element)
          break
        case 'bangumi':
          infoList.push(element)
          break
        case 'dmhy':
          downloadList.push(element)
          break
        case 'netflix':
        case 'nicovideo':
          foreignList.push(element)
          break
        default:
          break
      }
      this.setState({
        onlineList,
        infoList,
        downloadList,
        foreignList
      })
    })
  }

  render () {
    return (
      <View className='detail'>
        <Shell className='at-rol' />
        <View className='at-rol'>
          <AtCard
            note='小提示:点击网址可以复制到剪切板🍻'
            extra={this.state.isNew?'新番':''}
            title={this.state.bangumiData.title}
          >
            {_isObject(this.state.bangumiData.titleTranslate) && _isArray(this.state.bangumiData.titleTranslate['zh-Hans']) 
            && <View>
                {this.state.bangumiData.titleTranslate['zh-Hans'].length>0 && <Text>简体中文译名：\n</Text>}
                {this.state.bangumiData.titleTranslate['zh-Hans'].map(value=>{
                  return (
                    <Text key={value}>{value}\n</Text>
                    )
                  })}
                  <Text>\n</Text>
              </View>
            }
            {_isObject(this.state.bangumiData.titleTranslate) && _isArray(this.state.bangumiData.titleTranslate['zh-Hant']) 
            && <View>
                {this.state.bangumiData.titleTranslate['zh-Hant'].length>0 && <Text>繁体中文译名：\n</Text>}
                {this.state.bangumiData.titleTranslate['zh-Hant'].map(value=>{
                  return (
                    <Text key={value}>{value}\n</Text>
                    )
                  })}
                  <Text>\n</Text>
              </View>
            }
            {_isObject(this.state.bangumiData.titleTranslate) && _isArray(this.state.bangumiData.titleTranslate['ja']) 
            && <View>
                {this.state.bangumiData.titleTranslate['ja'].length>0 && <Text>日文译名：\n</Text>}
                {this.state.bangumiData.titleTranslate['ja'].map(value=>{
                  return (
                    <Text key={value}>{value}\n</Text>
                    )
                  })}
                  <Text>\n</Text>
              </View>
            }
            {_isObject(this.state.bangumiData.titleTranslate) && _isArray(this.state.bangumiData.titleTranslate['en']) 
            && <View>
                {this.state.bangumiData.titleTranslate['en'].length>0 && <Text>英文译名：\n</Text>}
                {this.state.bangumiData.titleTranslate['en'].map(value=>{
                  return (
                    <Text key={value}>{value}\n</Text>
                    )
                  })}
                  <Text>\n</Text>
              </View>
            }
            <Text>番剧语言：{DataStore.langCode2Text(this.state.bangumiData.lang)}\n</Text>
            <Text>番剧类型：{this.state.bangumiData.type}\n</Text>
            {this.state.bangumiData.officialSite && this.state.bangumiData.officialSite.length>0 && 
            (<View>
              <Text>官方网站：</Text> <ClipboardURL text={this.state.bangumiData.officialSite} /><Text>\n</Text>
            </View>)}
            <Text>\n</Text>
            <Text>{
              {
                'tv': `开播时间：${formatDate(this.state.bangumiData.begin,true)}`,
                'ova': `发售时间：${formatDate(this.state.bangumiData.begin)}`,
                'web': `开播时间：${formatDate(this.state.bangumiData.begin,true)}`,
                'movie': `上映时间：${formatDate(this.state.bangumiData.begin)}`
              }[this.state.bangumiData.type]
            }\n</Text>
            {
              {
                'tv': <Text>完结时间：{this.state.bangumiData.end ? formatDate(this.state.bangumiData.end,true):'未完结'}</Text>,
                'ova': <Text>最终话发售时间：{this.state.bangumiData.end ? formatDate(this.state.bangumiData.end):'未确定'}</Text>,
                'web': <Text>完结时间：{this.state.bangumiData.end ? formatDate(this.state.bangumiData.end,true):'未完结'}</Text>,
                'movie': ''
              }[this.state.bangumiData.type]
            }
            <Text>\n</Text>
            {this.state.onlineList.length>0 &&<Text className='item_title'>\n国内在线观看平台\n</Text>}
            {this.state.onlineList.map(value=>{
              return (<View key={value.site}>
                         <Text>\n{value.siteTitle}\n</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text>\n</Text>
                         {value.begin && <Text>开播时间：{formatDate(value.begin,true)}\n</Text>}
                      </View>)
            })}
            {this.state.showForeignSite && this.state.foreignList.length>0 && <Text className='item_title'>\n海外在线观看平台\n</Text>}
            {this.state.showForeignSite && this.state.foreignList.map(value=>{
              return (<View key={value.site}>
                         <Text>\n{value.siteTitle}\n</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text>\n</Text>
                         {value.begin && <Text>开播时间：{formatDate(value.begin,true)}\n</Text>}
                      </View>)
            })}
            {this.state.infoList.length>0 && <Text className='item_title'>\n资讯站点\n</Text>}
            {this.state.infoList.map(value=>{
              return (<View key={value.site}>
                         <Text>\n{value.siteTitle}\n</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text>\n</Text>
                      </View>)
            })}
            {this.state.showDownloadSite && this.state.downloadList.length>0 && <Text className='item_title'>\n下载站点\n</Text>}
            {this.state.showDownloadSite &&  this.state.downloadList.map(value=>{
              return (<View key={value.site}>
                         <Text>\n{value.siteTitle}\n</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text>\n</Text>
                      </View>)
            })}
           <Text>\n</Text>
          </AtCard>
        </View>
      </View>
      
    )
  }
}

export default Detail 
