'use strict'

const JSData = require('js-data')
const DSGarage11Adapter = require('garage11-db-adapter')


/**
 * This is the main store which glues some js-data setup
 * conventions together.
 */
class Store {

    constructor(peer, {dbname = 'default', node = null, apps = required, isLocal = false} = {}) {
        this.peer = peer
        const store = new JSData.DataStore({debug: false})
        store.isLocal = isLocal

        let permissions = {}
        // Initialize each app's ORM mappers.
        for (let [name, app] of apps) {
            if (app.storage && app.storage.mappers) {
                app.storage.mappers(store)
            }
            if (app.permissions) {
                Object.assign(permissions, app.permissions)
            }
        }

        if (isLocal) {
            if (peer.isHeadless) {
                store.registerAdapter('rethinkdb', new DSRethinkDBAdapter({
                    rOpts: {host: 'localhost', db: dbname},
                }), {default: true})
            } else {
                store.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
            }
            peer.logger.info(`${this.name} added ${store.mapperDefaults.defaultAdapter} js-data store`)
        } else {
            store.registerAdapter('garage11', new DSGarage11Adapter({
                node: node,
                permissions: permissions
            }), {default: true})
            peer.logger.info(`${this.name} added ${store.mapperDefaults.defaultAdapter} js-data store to ${node.id.sid()}`)
        }

        // Writes initial data; a minimal data set like initial permissions,
        // and permissions assigned to the peer user.
        if (isLocal) {
            for (let app of apps.values()) {
                if (app.storage && app.storage.mappers && app.storage.data) {
                    app.storage.data(store)
                }
            }
        }

        return store
    }


    get name() {
        return `${this.peer.name} [store]`
    }
}

module.exports = Store
