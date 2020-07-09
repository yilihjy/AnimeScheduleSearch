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

    @action.bound
    initData(data,fn) {
        this.siteMeta = data.siteMeta
        const yearKey = []
        const typeKey = []
        const yearMonthMap = {}
        const yearMonthKey = {}

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
                    this.playingList.push(element)
                }
            }
            if(element.type == 'movie') {
                const playDate = new Date(element.begin)
                if(Math.abs(playDate.valueOf()-(new Date()).valueOf())<=365*86400000) {
                    this.latestMovieList.push(element)
                }
            }
            if(element.type == 'ova') {
                const playDate = new Date(element.begin)
                if(Math.abs(playDate.valueOf()-(new Date()).valueOf())<=365*86400000) {
                    this.latestOVAList.push(element)
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
        this.playingList = this.playingList.sort(DataStore.compareBegin)
        this.latestMovieList = this.latestMovieList.sort(DataStore.compareBegin)
        this.latestOVAList = this.latestOVAList.sort(DataStore.compareBegin)
        this.yearKey = yearKey
        this.typeKey = typeKey
        this.yearMonthKey = yearMonthKey
        
        for(let y = 0; y < yearKey.length;y++) {
            const year = yearKey[y]
            Taro.setStorage({
                key : `${year}`,
                data : yearMonthMap[year]
            })
        }
        fn()
    }

    /**
     * 初始化每日放送表的数据
     * @param {Array} data 一个数组
     * @param {Function} fn 初始化完成之后调用
     */
    @action.bound
    initCalendarData(data, fn) {
        const calendarData = []
        data.forEach(value=>{
            if(value.weekday.id == 7) {
                calendarData[0] = value.items
            }else {
                calendarData[value.weekday.id] = value.items
            }
        })
        this.calendarData = calendarData
        this.hasCalendarData = true
        fn()
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
        Taro.setStorage({
            key: 'filterCache',
            data: {
                keyword:keyword,
                data:data
            }
        })
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