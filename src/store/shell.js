import Taro from '@tarojs/taro'
import { observable, action, computed } from 'mobx'
import Routes from '../routes'

class shellStore {
    routes = Routes

    @observable title = '首页'
    @observable name = 'index'
    @observable loading = false

    @computed get meumItems() {
        return this.routes.filter((value)=>{
            return value.isInMuen
        }).map((value)=>{
            return value.title
        })
    }

    @computed get hideSearchButton() {
        return this.name == 'search'
    }

    @action.bound
    whenInitPage(name) {
        for(let i = 0;i<this.routes.length;i++) {
            if(name == this.routes[i].name) {
                this.title = this.routes[i].title
                this.name = name
                return
            }
        }
        this.title = name
        this.name = name
    }

    @action.bound
    changeMeum(key){
        console.info(`changeMeum(${key})`)
        this.navigateByTitle(this.meumItems[key])
    }

    @action.bound
    navigateByTitle(title) {
        console.info(`navigateByTitle(${title})`)
        if(title ==this.title) return
        for(let i = 0;i<this.routes.length;i++) {
            if(title===this.routes[i].title) {
                this.title = title
                this.name = this.routes[i].name
                const url = `/pages/${this.routes[i].name}/index`
                if(this.isNewPage) {
                    Taro.navigateTo({
                        url: url
                      })
                }else{
                    Taro.redirectTo({
                        url: url
                      })
                }
                return
            }
        }
    }

    @action.bound
    navigateByName(name) {
        console.info(`navigateByName(${name})`)
        for(let i = 0;i<this.routes.length;i++) {
            if(name===this.routes[i].name) {
                this.title = this.routes[i].title
                this.name = name
                const url = `/pages/${this.routes[i].name}/index`
                if(this.isNewPage) {
                    Taro.navigateTo({
                        url: url
                      })
                }else{
                    Taro.redirectTo({
                        url: url
                      })
                }
                return
            }
        }
    }

    @action.bound
    showLoading() {
        this.loading = true
    }

    @action.bound
    hideLoading() {
        this.loading = false
    }
}

export default new shellStore()