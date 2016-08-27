'use strict'

const JSData = require('js-data')
const DSGarage11Adapter = require('garage11-db-adapter')


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
        _store = new JSData.DataStore({debug: true})
        _store.isLocal = isLocal

        if (isLocal) {
            if (peer.isHeadless) {
                // peer.logger.info(`[store] Adding rethinkdb store for node ${node.id}`)
                _store.registerAdapter('rethinkdb', new DSRethinkDBAdapter({
                    rOpts: {host: 'localhost', db: store},
                }), {default: true})
            } else {
                _store.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
            }
            peer.logger.info(`${this.name} added ${_store.mapperDefaults.defaultAdapter} js-data store`)
        } else {
            _store.registerAdapter('garage11', new DSGarage11Adapter({node: node}), {default: true})
            peer.logger.info(`${this.name} added ${_store.mapperDefaults.defaultAdapter} js-data store to ${node.id.sid()}`)
        }

        // Initializes the ORM structure.
        for (let app of apps.values()) {
            if (app.storage && app.storage.mappers) {
                app.storage.mappers(_store)
            }
        }

        // Writes initial data; a minimal data set like initial permissions,
        // and permissions assigned to the peer user.
        if (isLocal) {
            for (let app of apps.values()) {
                if (app.storage && app.storage.mappers && app.storage.data) {
                    app.storage.data(_store)
                }
            }
        }

        return _store
    }



}

module.exports = Store
