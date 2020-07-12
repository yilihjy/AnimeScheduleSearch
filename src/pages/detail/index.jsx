/* eslint-disable react/sort-comp */
import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image,Button } from '@tarojs/components'
import { AtCard, AtTabs, AtTabsPane, AtRate, AtAccordion,AtList, AtListItem ,AtPagination, AtModal, AtModalHeader, AtModalContent, AtModalAction ,AtButton} from "taro-ui"
import { when } from 'mobx'
import { observer, inject } from '@tarojs/mobx'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _forOwn from 'lodash/forOwn'
import _isEmpty from 'lodash/isEmpty'
import Shell from '../../components/shell'
import  { DataStore } from '../../store/data'
import { formatDate} from '../../utils/dateTools'
import ClipboardURL from '../../components/clipboardURL'
import checkImg from '../../utils/checkImg'
import Loading from '../../components/loading'



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
      isNew: false,
      bgmid: null,
      extraData: {},
      image:'',
      atTabsCurrent: 0,
      epsOpen: false,
      crtOpen: false,
      staffOpen: false,
      epPageStart: 0,
      epPageSize: 10,
      epPageCurrent:1,
      modalOpen: false,
      modalDate:{},
      modalType:'',
      noData: false,
    } 
  }

  componentWillMount () {
    const params = this.$router.params
    when(()=>{
      const {dataStore:{datainitFinished}} = this.props
      return datainitFinished
    },()=>{
      if(params.bgmid) {
        this.queryDataByBgmid(params.bgmid, params.year, params.month)
      }else {
        this.queryData(params.id, params.year, params.month)
      }
    })
    
  }

  componentDidShow() {
    const {shellStore} = this.props
    shellStore.whenInitPage('detail')
    this.filterSites()
    Taro.showShareMenu({
      withShareTicket: false
    })
  }

  onShareAppMessage () {
    const {extraData} = this.state
    return {
      title: `快来看《${extraData.name_cn||extraData.name}》的放送信息吧！`,
    }
  }

  queryDataByBgmid(bgmid,year, month) {
    console.log(bgmid,year, month)
    this.setState({
      bgmid: bgmid
    })
    this.getExtraData(bgmid)
    const {dataStore} = this.props
    try {
      let result = []
      result = dataStore.filter({year,month}).filter((value)=>{
        return value.bangumiID == bgmid
      })
      if(result.length == 0 ) {
        result = dataStore.filter({}).filter((value)=>{
          return value.bangumiID == bgmid
        })
      }
      if(result.length == 1) {
        this.setState({
          bangumiData: result[0],
          noData: false
        })
        if(result[0].type=='tv' && result[0].end=='') {
          this.setState({
            isNew: true
          })
        }
      } else {
        this.setState({
          noData: true
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  queryData(id, year, month) {
    const {dataStore} = this.props
    try {
      let result = []
      result = dataStore.filter({year,month}).filter((value)=>{
        return value.id == id
      })
      if(result.length == 1) {
        this.setState({
          bangumiData: result[0],
          noData: false
        })
        if(result[0].type=='tv' && result[0].end=='') {
          this.setState({
            isNew: true
          })
        }
        if(result[0].bangumiID) {
          this.setState({
            bgmid: result[0].bangumiID
          })
          this.getExtraData(result[0].bangumiID)
        }
      } else {
        this.setState({
          noData: true
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async getExtraData(id) {
    try {
      const subject = id || this.state.bgmid
      const res = await Taro.request({
        url: `https://cdn.jsdelivr.net/npm/anime-sachedule-search-data@0.1/dist/subject/${subject}.json`
      })
      let imageUrl
      try {
        imageUrl = res.data.images.large
      } catch (error) {
        console.log(error)
      }
      this.setState({
        extraData: res.data,
        image: imageUrl
      })
    } catch (error) {
      console.log(error)
    }
  }


  filterSites() {
    const {dataStore} = this.props
    const siteMeta = dataStore.siteMeta
    const {bangumiData} = this.state
    let onlineList = []
    let infoList = []
    let downloadList = []
    let foreignList = []
    if(bangumiData.sites) {
      bangumiData.sites.forEach(element => {
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
  }

  onAtTabsClick(value) {
    this.setState({
      atTabsCurrent: value
    })
  }

  handleEpsOpenClick (value) {
    this.setState({
      epsOpen: value
    })
  }

  handleCrtOpenClick (value) {
    this.setState({
      crtOpen: value
    })
  }

  handleStaffOpenClick (value) {
    this.setState({
      staffOpen: value
    })
  }


  onEpPageChange({type, current}) {
    if(type=='next') {
      this.setState({
        epPageStart: ( current - 1) * this.state.epPageSize,
        epPageCurrent: current 
      })
    }else {
      this.setState({
        epPageStart: ( current - 1) * this.state.epPageSize,
        epPageCurrent: current 
      })
    }
  }

  closeModal() {
    this.setState({
      modalOpen:false
    })
  }

  openModal(type,data) {
    this.setState({
      modalOpen: true,
      modalType:type,
      modalDate:data
    })
    
  }

  buildModal() {
    const { modalOpen, modalDate, modalType } = this.state
    let modalHeader
    let modalContent
    if(modalType =='ep') {
      modalHeader = (<AtModalHeader>{modalDate.name_cn || modalDate.name || '没有详细放送信息'}</AtModalHeader>)
      modalContent = (
        <AtModalContent>
          <Text className='display-block'  decode >放送日期：{modalDate.airdate || '无数据'}&nbsp;</Text>
          {modalDate.duration && <Text className='display-block'  decode >时长：{modalDate.duration}&nbsp;</Text>}
          {modalDate.desc && <Text className='display-block'  decode >{modalDate.desc}</Text>}
        </AtModalContent>
      )
    }
    if(modalType == 'crt' || modalType == 'staff') {
      modalHeader = (<AtModalHeader>{modalDate.name_cn || modalDate.name}</AtModalHeader>)
      const info = modalDate.info
      const infoList = []
      _forOwn(info,(value,key)=>{
        let item
        switch (key) {
          case 'name_cn':
            item = '姓名'
            break
          case 'gender':
            item = '性别'
            break
          case 'birth':
            item = '生日'
            break
          case 'bloodtype':
            item = '血型'
            break
          case 'height':
            item = '身高'
            break
          case 'weight':
            item = '体重'
            break
          case 'bwh':
            item = '三围'
            break
          case 'source':
            item = '来源'
            break
          case 'pixiv_id':
            item = 'pixiv'
            break
          default:
            item = key
            break
        }
        if(typeof value == 'string') {
          infoList.push({item,value})
        }
      })
      modalContent = (
        <AtModalContent>
          {modalDate.images && (<View className='modal-image'>
            <Image style='width: 150px;' mode='widthFix' src={checkImg(modalDate.images,'medium')}></Image>
          </View>)}
          {modalDate.role_name && <Text className='display-block'  decode >{modalDate.role_name}&nbsp;</Text>}
          {infoList.map(value=>{
            return <Text className='display-block'  decode  key={value.item}>{value.item}: {value.value}&nbsp;</Text>
          })}
          {(modalType=='staff' && modalDate.jobs) && (<Text className='display-block'  decode >职位：{modalDate.jobs.join(' ')}&nbsp;</Text>)}
        </AtModalContent>
      )
    }
    return (
      <AtModal
        isOpened={modalOpen}
        onClose={this.closeModal.bind(this)}
      >
        {modalHeader}
        {modalContent}
        <AtModalAction>
          <Button onClick={this.closeModal.bind(this)}>确定</Button> 
        </AtModalAction>
      </AtModal>
    )
  }

  async retry() {
    const {dataStore,shellStore} = this.props
    shellStore.showLoading()
    dataStore.disableRetry()
    try {
      shellStore
      const res = await Taro.request({
        url: 'https://cdn.jsdelivr.net/npm/anime-sachedule-search-data@0.1/dist/data.json'
      })
      DataStore.clearFilterCache()
      dataStore.initData(res.data,()=>{
        const params = this.$router.params
        this.queryData(params.id, params.year, params.month,params.bgmid)
        shellStore.hideLoading()
      })
    } catch (error) {
      dataStore.allowRetry()
      shellStore.hideLoading()
    }
  }

  isLongTitle(title) {
    if(title && title.length >20) {
      return true
    }else {
      return false
    }
  }

  render () {
    const {bangumiData,extraData,epPageStart,epPageCurrent,epPageSize}  = this.state
    const { dataStore:{datainitFinished,canReTry}} = this.props
    return (
      <View className='detail'>
        <Shell className='at-rol' />
        <Loading />
        {canReTry  &&<View className='retry'> <AtButton className='reload-button' type='primary' onClick={this.retry.bind(this)}>重新加载数据</AtButton></View>}
        {datainitFinished && (<View className='at-rol'>
          {this.state.image &&
          <View className='coever'>
            <Image className='bg-img' mode='aspectFill' src={this.state.image} />
            <View className='bg-img-mask'></View>
            <Image className='top-img' mode='aspectFit' src={this.state.image} />
            <View className='main-title'>
              {extraData.rating &&<AtRate max={10} value={extraData.rating.score} size={15} />}
              {this.isLongTitle(extraData.name_cn || extraData.name) && <Text className='display-block longtitle'  decode  >{extraData.name_cn || extraData.name}</Text>}
              {!this.isLongTitle(extraData.name_cn || extraData.name) && <Text className='display-block'  decode  >{extraData.name_cn || extraData.name}</Text>}
            </View>
            
          </View>}
          {!canReTry &&(<AtCard
            note='小提示:点击网址可以复制到剪切板🍻'
            extra={this.state.isNew?'新番':''}
            title={extraData.name_cn || bangumiData.title || extraData.name}
          > 
            
            <AtTabs
              current={this.state.atTabsCurrent}
              tabList={[
                { title: '放送信息' },
                { title: '番剧详情' }
              ]}
              onClick={this.onAtTabsClick.bind(this)}
            >
              <AtTabsPane current={this.state.atTabsCurrent} index={0}>
                {!this.state.noData &&(<View>
                {_isObject(bangumiData.titleTranslate) && _isArray(bangumiData.titleTranslate['zh-Hans']) 
            && <View>
                <Text className='display-block'  decode >&nbsp;</Text>
                <Text className='display-block'  decode >原始名称：&nbsp;{bangumiData.title}&nbsp;</Text>
                <Text className='display-block'  decode >&nbsp;</Text>
                {bangumiData.titleTranslate['zh-Hans'].length>0 && <Text className='display-block'  decode >简体中文译名：&nbsp;</Text>}
                {bangumiData.titleTranslate['zh-Hans'].map(value=>{
                  return (
                    <Text className='display-block'  decode  key={value}>{value}&nbsp;</Text>
                    )
                  })}
                  <Text className='display-block'  decode >&nbsp;</Text>
              </View>
            }
            {_isObject(bangumiData.titleTranslate) && _isArray(bangumiData.titleTranslate['zh-Hant']) 
            && <View>
                {bangumiData.titleTranslate['zh-Hant'].length>0 && <Text className='display-block'  decode >繁体中文译名：&nbsp;</Text>}
                {bangumiData.titleTranslate['zh-Hant'].map(value=>{
                  return (
                    <Text className='display-block'  decode  key={value}>{value}&nbsp;</Text>
                    )
                  })}
                  <Text className='display-block'  decode >&nbsp;</Text>
              </View>
            }
            {_isObject(bangumiData.titleTranslate) && _isArray(bangumiData.titleTranslate['ja']) 
            && <View>
                {bangumiData.titleTranslate['ja'].length>0 && <Text className='display-block'  decode >日文译名：&nbsp;</Text>}
                {bangumiData.titleTranslate['ja'].map(value=>{
                  return (
                    <Text className='display-block'  decode  key={value}>{value}&nbsp;</Text>
                    )
                  })}
                  <Text className='display-block'  decode >&nbsp;</Text>
              </View>
            }
            {_isObject(bangumiData.titleTranslate) && _isArray(bangumiData.titleTranslate['en']) 
            && <View>
                {bangumiData.titleTranslate['en'].length>0 && <Text className='display-block'  decode >英文译名：&nbsp;</Text>}
                {bangumiData.titleTranslate['en'].map(value=>{
                  return (
                    <Text className='display-block'  decode  key={value}>{value}&nbsp;</Text>
                    )
                  })}
                  <Text className='display-block'  decode >&nbsp;</Text>
              </View>
            }
            {bangumiData.lang && <Text className='display-block'  decode >番剧语言：{DataStore.langCode2Text(bangumiData.lang)}&nbsp;</Text>}
            {bangumiData.type && <Text className='display-block'  decode >番剧类型：{bangumiData.type}&nbsp;</Text>}
            {bangumiData.officialSite && bangumiData.officialSite.length>0 && 
            (<View>
              <Text className='display-block'  decode >官方网站：</Text> <ClipboardURL text={bangumiData.officialSite} /><Text className='display-block'  decode >&nbsp;</Text>
            </View>)}
            <Text className='display-block'  decode >&nbsp;</Text>
            <Text className='display-block'  decode >{
              {
                'tv': `开播时间：${formatDate(bangumiData.begin,true)}`,
                'ova': `发售时间：${formatDate(bangumiData.begin)}`,
                'web': `开播时间：${formatDate(bangumiData.begin,true)}`,
                'movie': `上映时间：${formatDate(bangumiData.begin)}`
              }[bangumiData.type]
            }&nbsp;</Text>
            {
              {
                'tv': <Text className='display-block'  decode >完结时间：{bangumiData.end ? formatDate(bangumiData.end,true):'未完结'}</Text>,
                'ova': <Text className='display-block'  decode >最终话发售时间：{bangumiData.end ? formatDate(bangumiData.end):'未确定'}</Text>,
                'web': <Text className='display-block'  decode >完结时间：{bangumiData.end ? formatDate(bangumiData.end,true):'未完结'}</Text>,
                'movie': ''
              }[bangumiData.type]
            }
            <Text className='display-block'  decode >&nbsp;</Text>
            {this.state.onlineList.length>0 &&<Text className='display-block item_title'  decode  >国内在线观看平台&nbsp;</Text>}
            {this.state.onlineList.map(value=>{
              return (<View key={value.site}>
                         <Text className='display-block'  decode >{value.siteTitle}（点击链接可复制到剪贴板）&nbsp;</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text className='display-block'  decode ></Text>
                         {value.begin && <Text className='display-block'  decode >开播时间：{formatDate(value.begin,true)}&nbsp;</Text>}
                      </View>)
            })}
            {this.state.showForeignSite && this.state.foreignList.length>0 && <Text className='display-block item_title'  decode  >海外在线观看平台&nbsp;</Text>}
            {this.state.showForeignSite && this.state.foreignList.map(value=>{
              return (<View key={value.site}>
                         <Text className='display-block'  decode >{value.siteTitle}（点击链接可复制到剪贴板）&nbsp;</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text className='display-block'  decode ></Text>
                         {value.begin && <Text className='display-block item_title'  decode >开播时间：{formatDate(value.begin,true)}&nbsp;</Text>}
                      </View>)
            })}
            {this.state.infoList.length>0 && <Text className='display-block item_title'  decode  >资讯站点&nbsp;</Text>}
            {this.state.infoList.map(value=>{
              return (<View key={value.site}>
                         <Text className='display-block'  decode >{value.siteTitle}（点击链接可复制到剪贴板）&nbsp;</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text className='display-block'  decode ></Text>
                      </View>)
            })}
            {this.state.showDownloadSite && this.state.downloadList.length>0 && <Text className='display-block item_title'  decode  >下载站点&nbsp;</Text>}
            {this.state.showDownloadSite &&  this.state.downloadList.map(value=>{
              return (<View key={value.site}>
                         <Text className='display-block'  decode >{value.siteTitle}（点击链接可复制到剪贴板）&nbsp;</Text> 
                         <ClipboardURL text={value.playURL} />
                         <Text className='display-block'  decode >&nbsp;</Text>
                      </View>)
            })}
                </View>)}
                {this.state.noData && <Text className='display-block'  decode >&nbsp;没有更多放送信息&nbsp;</Text>}
              </AtTabsPane>
              <AtTabsPane current={this.state.atTabsCurrent} index={1}>
                {extraData && 
                <View>
                  {extraData.rating && 
                    <View>
                      <Text className='display-block'  decode >&nbsp;</Text>
                      
                      <Text className='display-block'  decode >Bangumi评分: {extraData.rating.score}&nbsp;</Text>
                      <Text className='display-block'  decode >评分人数：{extraData.rating.total}&nbsp;</Text>
                    </View>}
                  <Text className='display-block'  decode >&nbsp;</Text>
                  {extraData.summary && <Text className='display-block'  decode >剧情简介:&nbsp;</Text>}
                  <Text className='display-block'  decode >{extraData.summary}</Text>
                  <Text className='display-block'  decode >&nbsp;</Text>
                  {(extraData.eps && extraData.eps.length>0) && (
                  <AtAccordion
                    title='分集放送信息'
                    arrow='right'
                    open={this.state.epsOpen}
                    onClick={this.handleEpsOpenClick.bind(this)}
                  >
                    <AtList>
                    {extraData.eps.reverse().slice(epPageStart,epPageStart+epPageSize).map((ep)=>{
                      return (<AtListItem 
                        key={ep.id} 
                        title={`${ep.sort}: ${ep.name_cn || ep.name || '没有详细放送信息'}`}
                        note={`放送日期：${ep.airdate || '无数据'} `}
                        onClick={this.openModal.bind(this,'ep',ep)}
                      />)
                    })}
                    </AtList>
                    <AtPagination
                      className='pagination'
                      icon 
                      total={extraData.eps.length} 
                      pageSize={epPageSize}
                      current={epPageCurrent}
                      onPageChange={this.onEpPageChange.bind(this)}
                    ></AtPagination>
                  </AtAccordion>
                  )}
                  {(extraData.crt && extraData.crt.length>0) && (
                  <AtAccordion
                    title='角色信息'
                    arrow='right'
                    open={this.state.crtOpen}
                    onClick={this.handleCrtOpenClick.bind(this)}
                  >
                    <AtList>
                    {extraData.crt.map((crt)=>{
                      return <AtListItem 
                        key={crt.id} 
                        title={crt.name_cn || crt.name}
                        thumb={checkImg(crt.images, 'grid')}
                        note='点击查看详情'
                        onClick={this.openModal.bind(this,'crt',crt)}
                      />
                    })}
                    </AtList>
                  </AtAccordion>
                  )}
                  {(extraData.staff && extraData.staff.length >0) && (
                    <AtAccordion
                      title='staff'
                      arrow='right'
                      open={this.state.staffOpen}
                      onClick={this.handleStaffOpenClick.bind(this)}
                    >
                    <AtList>
                    {extraData.staff.map((staff)=>{
                      return <AtListItem 
                        key={staff.id} 
                        title={staff.name_cn || staff.name}
                        thumb={checkImg(staff.images, 'grid')}
                        note='点击查看详情'
                        onClick={this.openModal.bind(this,'staff',staff)}
                      />
                    })}
                    </AtList>
                  </AtAccordion>
                  )}
                </View>}
                {_isEmpty(extraData) && <View style='font-size:18px;text-align:center;height:100px;'>没有更多内容</View>}
              </AtTabsPane>
            </AtTabs>
            
           <Text className='display-block'  decode >&nbsp;</Text>
          </AtCard>)}
        </View>
        )}
        {this.buildModal()}
      </View>
    )
  }
}

export default Detail 
