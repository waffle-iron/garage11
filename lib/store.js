'use strict'


/**
 * This is the main store which glues some js-data setup
 * conventions together.
 */
class Store extends JSData.DS {

    constructor(options) {
        super()
        h5.collections = this.definitions
        if(h5.isHeadless) {
            this.registerAdapter('mongo', new DSMongoDBAdapter('mongodb://localhost:27017/high5'), {default: true})
        } else {
            this.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
        }
    }
}

module.exports = Store
