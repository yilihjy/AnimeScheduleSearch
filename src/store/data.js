import Taro from '@tarojs/taro'
import { observable, action } from 'mobx'
import md5 from 'blueimp-md5'
import { dateStringToMonthString, dateStringToYearString} from '../utils/dateTools'

export class DataStore {
    @observable yearKey = []
    @observable typeKey = []
    @observable yearMonthKey = {}
    @observable searchResult= []
    @observable filterResult= []
    @observable siteMeta= []
    @observable playingList = []
    @observable latestMovieList = []
    @observable latestOVAList = []
    @observable hasCalendarData = false
    @observable calendarData = []
    @observable datainitFinished = false
    @observable canReTry = false
    

    @action.bound
    allowRetry() {
        this.canReTry = true
    }

    @action.bound
    disableRetry() {
        this.canReTry = false
    }

    static checkCache() {
        // const lastSave = Taro.getStorageSync('latest-save')
        // return lastSave && Math.abs((new Date()).valueOf()-lastSave)<86400000
        return false
    }

    @action.bound
    initData(data,fn) {
        this.siteMeta = data.siteMeta
        try {
            Taro.setStorageSync('siteMeta', data.siteMeta)
          } catch (e) { console.log(e) }
        const yearKey = []
        const typeKey = []
        const yearMonthMap = {}
        const yearMonthKey = {}
        let playingList = []
        let latestMovieList = []
        let latestOVAList = []

        data.items.forEach((element) => {
            element.id = md5(element.title)
            const year = dateStringToYearString(element.begin)
            const month = dateStringToMonthString(element.begin)
            element.year = year
            element.month = month
            if (!yearKey.includes(year)) {
                yearKey.push(year)
                yearMonthMap[year] = {}
                yearMonthKey[year] = []
            }
            if (!yearMonthKey[year].includes(month)) {
                yearMonthKey[year].push(month)
                yearMonthMap[year][month] = []
            }
            yearMonthMap[year][month].push(element)
            if (!typeKey.includes(element.type)) {
                typeKey.push(element.type)
            }
            
            if(element.type == 'tv' || element.type == 'web') {
                const playDate = new Date(element.begin)
                if(Math.abs(playDate.valueOf()-(new Date()).valueOf())<=100*86400000) {
                    playingList.push(element)
                }
            }
            if(element.type == 'movie') {
                const playDate = new Date(element.begin)
                if(Math.abs(playDate.valueOf()-(new Date()).valueOf())<=365*86400000) {
                    latestMovieList.push(element)
                }
            }
            if(element.type == 'ova') {
                const playDate = new Date(element.begin)
                if(Math.abs(playDate.valueOf()-(new Date()).valueOf())<=365*86400000) {
                    latestOVAList.push(element)
                }
            }
            if(element.sites) {
                element.sites.forEach(value=>{
                    if(value.site=='bangumi') {
                        element.bangumiID = value.id
                    }
                })
            }

        })
        playingList = playingList.sort(DataStore.compareBegin).slice(0,50)
        this.playingList = playingList
        try {
            Taro.setStorageSync('playingList', playingList)
          } catch (e) { console.log(e) }
        latestMovieList = latestMovieList.sort(DataStore.compareBegin).slice(0,10)
        this.latestMovieList = latestMovieList
        try {
            Taro.setStorageSync('latestMovieList', latestMovieList)
          } catch (e) { console.log(e) }
        latestOVAList = latestOVAList.sort(DataStore.compareBegin).slice(0,10)
        this.latestOVAList = latestOVAList
        try {
            Taro.setStorageSync('latestOVAList', latestOVAList)
          } catch (e) { console.log(e) }
        this.yearKey = yearKey
        this.typeKey = typeKey
        this.yearMonthKey = yearMonthKey
        try {
            Taro.setStorageSync('yearKey', yearKey)
          } catch (e) { console.log(e) }
        try {
            Taro.setStorageSync('typeKey', typeKey)
          } catch (e) { console.log(e) }
        try {
            Taro.setStorageSync('yearMonthKey', yearMonthKey)
          } catch (e) { console.log(e) }
        
        for(let y = 0; y < yearKey.length;y++) {
            const year = yearKey[y]
            try {
                Taro.setStorageSync(`${year}`,  yearMonthMap[year])
              } catch (e) { console.log(e) }
        }
        try {
            Taro.setStorageSync( `latest-save`,  (new Date()).valueOf())
          } catch (e) { console.log(e) }
        this.initCalendarData(data.calendar)
        this.datainitFinished = true
        fn()
    }

    @action.bound
    initDataFromCache(fn) {
        const lastSave = Taro.getStorageSync('latest-save')
        if(lastSave) {
            this.siteMeta = Taro.getStorageSync('siteMeta')
            this.yearKey = Taro.getStorageSync('yearKey')
            this.typeKey = Taro.getStorageSync('typeKey')
            this.yearMonthKey = Taro.getStorageSync('yearMonthKey')
            this.playingList = Taro.getStorageSync('playingList')
            this.latestMovieList = Taro.getStorageSync('latestMovieList')
            this.latestOVAList = Taro.getStorageSync('latestOVAList')
            this.datainitFinished = true
            this.initCalendarDataFromCache(fn)
        } else {
            fn(false)
        }
    }

    /**
     * 初始化每日放送表的数据
     * @param {Array} data 一个数组
     * @param {Function} fn 初始化完成之后调用
     */
    @action.bound
    initCalendarData(data) {
        const calendarData = []
        data.forEach(value=>{
            if(value.weekday.id == 7) {
                calendarData[0] = value.items
            }else {
                calendarData[value.weekday.id] = value.items
            }
        })
        this.calendarData = calendarData
        try {
            Taro.setStorageSync( 'calendarData', calendarData)
          } catch (e) { console.log(e) }
        this.hasCalendarData = true
    }

    @action.bound
    initCalendarDataFromCache(fn) {
        const calendarData = Taro.getStorageSync('calendarData')
        if(calendarData) {
            this.calendarData = calendarData
            this.hasCalendarData = true
            fn(true)
        }else {
            fn(false)
        }
    }

    @action.bound
    search (keyword) {
        this.searchResult = this.filterResult.filter((element) => {
            return DataStore.matchTitle(element,keyword)
        })
    }

    static matchTitle(element, keyword) {
        keyword = keyword.toUpperCase()
        if (element.title.toUpperCase().includes(keyword)) {
            return element.title
        } else if (element.titleTranslate['zh-Hans']) {
            for (let i = 0; i < element.titleTranslate['zh-Hans'].length; i++) {
                if (element.titleTranslate['zh-Hans'][i].toUpperCase().includes(keyword)) {
                    return element.titleTranslate['zh-Hans'][i]
                }
            }
        } else if (element.titleTranslate['zh-Hant']) {
            for (let i = 0; i < element.titleTranslate['zh-Hant'].length; i++) {
                if (element.titleTranslate['zh-Hant'][i].toUpperCase().includes(keyword)) {
                    return element.titleTranslate['zh-Hant'][i]
                }
            }
        } else if (element.titleTranslate.en) {
            for (let i = 0; i < element.titleTranslate.en.length; i++) {
                if (element.titleTranslate.en[i].toUpperCase().includes(keyword)) {
                    return element.titleTranslate.en[i]
                }
            }
        }
        return ''
    }

    filter (condition) {
        const filterType = condition.type || 'all'
        const filterYear = condition.year || 'all'
        const filterMonth = condition.month || 'all'
        console.log(`过滤条件：\ntype:${filterType}\nyear:${filterYear}\nmonth:${filterMonth}`)
        const cache = DataStore.getFilterCache()
        if(cache && condition.keyword && condition.keyword.includes(cache.keyword)) {
            console.info('本次查询有缓存')
            const filterResult = this.filterKeyword(cache.data,filterType,condition.keyword)
            DataStore.saveFilterCache(filterResult,condition.keyword)
            return filterResult
        }
        let baseFilterMap = []
        if (filterMonth !== 'all') {
            if (filterYear === 'all') {
                throw new Error('调用filter时如果指定month则year不能为all')
            }
            baseFilterMap = Taro.getStorageSync(filterYear)[filterMonth]
        } else if (filterYear !== 'all') {
            const yearData = Taro.getStorageSync(filterYear)
            for(let i = 0;i<this.yearMonthKey[filterYear].length;i++) {
                const monthKey = this.yearMonthKey[filterYear][i]
                const monthData = yearData[monthKey]
                baseFilterMap = baseFilterMap.concat(monthData)
            }
        } else {
            for(let x = 0;x<this.yearKey.length;x++) {
                const year = this.yearKey[x]
                const yearData = Taro.getStorageSync(year)
                for(let i = 0;i<this.yearMonthKey[year].length;i++) {
                    const monthKey = this.yearMonthKey[year][i]
                    const monthData = yearData[monthKey]
                    baseFilterMap =  baseFilterMap.concat(monthData)
                }
            }
        }
        const filterResult = this.filterKeyword(baseFilterMap, filterType,condition.keyword)
        if(condition.keyword) {
            DataStore.saveFilterCache(filterResult,condition.keyword)
        }
        return filterResult
    }

    filterKeyword(baseFilterMap,filterType,keyword) {
        if(keyword) {
            return baseFilterMap.filter((element) => {
                if(filterType === 'all') {
                    return DataStore.matchTitle(element,keyword)
                } else {
                    if (element.type === filterType) {
                        return DataStore.matchTitle(element,keyword)
                    } else {
                        return false
                    }
                }
            })
        }else {
            if(filterType === 'all') {
                return baseFilterMap
            } else {
                return baseFilterMap.filter((element) => {
                    if (element.type === filterType) {
                        return true
                    } else {
                        return false
                    }
                })
            }
        }
    }

    static getFilterCache() {
        return Taro.getStorageSync('filterCache')
    }

    static saveFilterCache(data,keyword) {
        try {
            Taro.setStorageSync('filterCache', {
                keyword:keyword,
                data:data
            })
          } catch (e) { console.log(e) }
        
    }

    static clearFilterCache() {
        Taro.removeStorage({
            key:'filterCache'
        })
    }

    static langCode2Text(lang) {
        switch(lang) {
            case 'ja': 
              return '日文'
            case 'zh-Hans': 
            return '简体中文'
            case 'zh-Hant': 
            return '繁体中文'
            case 'en':
                return '英文'
            default:
                return lang
          }
    }

    static compareBegin(a,b) {
        const ad = new Date(a.begin)
        const bd = new Date(b.begin)
        return bd.valueOf()- ad.valueOf() 
    }

}

export default new DataStore()