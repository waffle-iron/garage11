'use strict'
let JSData = require('js-data')

/**
 * The js-data-rtc adapter uses unmodified high5 request router(TBD).
 * For Garage11, we give it a transport wrapper which encrypts the data
 * first, before it's transported.
 */
class DsRtcTransport {

    constructor() {

    }

    request(request) {

    }
}

/**
 * This is the main store which glues some js-data setup
 * conventions together.
 */
class Store extends JSData.DS {

    constructor(peer, options) {
        super()
        if(options.isLocal) {
            if(peer.isHeadless) {
                this.registerAdapter('mongo', new DSMongoDBAdapter('mongodb://localhost:27017/' + options.store), {default: true})
            } else {
                this.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
            }
        } else {
            this.registerAdapter('rtcadapter', new DSRtcAdapter({transport: new DsRtcTransport()}), {default: true})
        }

        Object.keys(options.apps).forEach((appName) => {
            options.apps[appName].setStore(this)
        })
    }
}

module.exports = Store
