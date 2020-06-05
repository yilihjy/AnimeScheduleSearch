import { observable } from 'mobx'

class dataStore {
    @observable data = {}
}

export default new dataStore()