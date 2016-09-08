'use strict'

const DSGarage11Adapter = require('garage11-db-adapter')


/**
 * A slightly customized DataStore which allows more control
 * over the way that items are cached.
 */
class DataStore extends JSData.DataStore {

    constructor(opts) {
        super(opts)
        this.isLocal = opts.isLocal
    }


    /**
     * Overrides the default `cachedFindAll`. Disables cache
     * when `this.isLocal` is set.
     */
    cachedFindAll(name, hashOrId, opts) {
        // Don't cache at all for remote stores.
        if (!this.isLocal) return
        const cached = this._completedQueries[name][hashOrId]
        if (JSData.utils.isFunction(cached)) {
            return cached(name, hashOrId, opts)
        }
        return cached
    }


    /**
     * Overrides the default `cachedFind`. Disables cache
     * when `this.isLocal` is set.
     */
    cachedFind(name, hashOrId, opts) {
        // Don't cache at all for remote stores.
        if (!this.isLocal) return
        const cached = this._completedQueries[name][hashOrId]
        if (JSData.utils.isFunction(cached)) {
            return cached(name, hashOrId, opts)
        }
        return cached
    }
}


/**
 * This is the Garage11Store class which glues some js-data setup
 * conventions together.
 */
class Garage11Store {

    constructor(peer, {dbname = 'default', node = null, apps = required, isLocal = false} = {}) {
        this.peer = peer
        const store = new DataStore({debug: false, isLocal: isLocal})
        // Initialize each app's ORM mappers.
        for (let [name, app] of apps) {
            if (app.storage && app.storage.mappers) {
                app.storage.mappers(store)
            }
        }

        if (store.isLocal) {
            if (peer.isHeadless) {
                store.registerAdapter('rethinkdb', new DSRethinkDBAdapter({
                    rOpts: {host: 'localhost', db: dbname},
                }), {default: true})
            } else {
                store.registerAdapter('localstorage', new DSLocalStorageAdapter(), {default: true})
            }
            peer.logger.info(`${this.name} added ${store.mapperDefaults.defaultAdapter} js-data store`)
        } else {
            // Maps a mapper/query to a permission.
            let permissions = {}
            for (let [name, app] of apps) {
                if (app.permissions) {
                    Object.assign(permissions, app.permissions)
                }
            }
            store.registerAdapter('garage11', new DSGarage11Adapter({node: node, permissions: permissions}), {default: true})
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

module.exports = Garage11Store
