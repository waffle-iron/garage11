'use strict'

const JSData = require('js-data')
const DSHigh5Adapter = require('js-data-high5')

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
class Store {

    constructor(peer, {store = 'default', node = null, apps = required, isLocal = false} = {}) {
        let _store
        this.peer = peer

        this.Schema = JSData.Schema
        if(peer.isHeadless) {
            _store = new JSData.Container({})
        } else {
            _store = new JSData.DataStore({})
        }
        if(isLocal)
            if(peer.isHeadless) {
                _store.registerAdapter('rethinkdb', new DSRethinkDBAdapter({
                    rOpts: {
                        host: 'localhost',
                        db: store,
                    }
                }), {default: true})
            }
            else
                _store.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
        else
            _store.registerAdapter('rtcadapter', new DSHigh5Adapter({node: node}), {default: true})

        Object.keys(apps).forEach((appName) => {
            apps[appName].setStore(_store)
        })
        return _store
    }

}

module.exports = Store
