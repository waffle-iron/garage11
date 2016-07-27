'use strict'

const JSData = require('js-data')
const DSGarage11Adapter = require('garage11-db-adapter')

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

    get name() {return `${this.peer.name} [store]`}

    constructor(peer, {store = 'default', node = null, apps = required, isLocal = false} = {}) {
        let _store
        this.peer = peer

        this.Schema = JSData.Schema
        if(peer.isHeadless) {
            _store = new JSData.Container({debug: true})
        } else {
            _store = new JSData.DataStore({debug: true})
        }

        _store.isLocal = isLocal

        if(isLocal) {
            if(peer.isHeadless) {
                // peer.logger.info(`[store] Adding rethinkdb store for node ${node.id}`)
                _store.registerAdapter('rethinkdb', new DSRethinkDBAdapter({
                    rOpts: {
                        host: 'localhost',
                        db: store,
                    },
                }), {default: true})
            } else {
                _store.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
            }
            peer.logger.info(`${this.name} added ${_store.mapperDefaults.defaultAdapter} js-data store`)
        } else {
            _store.registerAdapter('garage11', new DSGarage11Adapter({node: node}), {default: true})
            peer.logger.info(`${this.name} added ${_store.mapperDefaults.defaultAdapter} js-data store to ${node.id.sid()}`)
        }

        // Initialize each app's mappers for each store.
        Object.keys(apps).forEach((appName) => {
            if(apps[appName].storage && apps[appName].storage.mappers) {
                apps[appName].storage.mappers(_store)
            }
        })

        // Do the same for initial data.
        _store.initialData = () => {
            if(isLocal) {
                Object.keys(apps).forEach((appName) => {
                    if(apps[appName].storage && apps[appName].storage.mappers && apps[appName].storage.data) {
                        apps[appName].storage.data(_store)
                    }
                })
            }
        }
        return _store
    }



}

module.exports = Store
