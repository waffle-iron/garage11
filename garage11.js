'use strict'

const Network = require('high5/lib/network')
const Peer = require('high5/lib/peer')
const Store = require('./lib/store')
const VDom = require('./lib/vdom')


class Garage11 extends Peer {

    constructor(...kwargs) {
        super(...kwargs)
    }

    init() {
        let localStore
        // First find all applications.
        return this.getApplications()
        .then((apps) => {
            this.apps = apps
            // Create a local store for the peer, because we first needs
            // to get the identify from the store, before we can establish the
            // initial (persistent) node.
            localStore = new Store(this, {isLocal: true, apps: apps, store: this.settings.store})
            localStore.initialData()
            // Then get the identity from the store.
            return this.apps.user.getOrCreateIdentity(localStore)
        })
        .then(() => {
            // Network requires an initial node id. `getOrCreateIdentity`
            // should come later, but we need a store and the id from the
            // store first, before we can create the initial node.
            this.network = new Network(this, this.id, localStore, this.settings.network)
            this.network.on('nodeAdded', (node) => {
                if (node.id !== this.node.id) {
                    node.store = new Store(this, {isLocal: false, apps: this.apps, node: node})
                }
            })
            this.vdom = new VDom(this)
            return this.vdom.init()
        })
        .then(() => {
            this.vdom.listeners()

        })

    }


    /**
     * Loads all app.js files in apps subdirectories and interpret them
     * as Garage 11 application files.
     */
    getApplications() {
        return new Promise((resolve) => {
            if(this.isHeadless) {
                let requireNames = []
                let projectDir = this.settings.headless.projectDir
                let b = browserify({basedir: path.join(projectDir)})
                fs.readdir(path.join(projectDir, 'apps'), (err, appNames) => {
                    appNames.forEach((appName) => {
                        let viewRequire = './' + path.join('apps', appName, 'app')
                        this.apps[appName] = require(viewRequire)(this)
                        requireNames.push([appName, viewRequire])
                        b.require(viewRequire)
                    })
                    var memStream = new MemoryStream()
                    let viewsFile = path.join('public', 'js', 'apps.js')
                    b.bundle().pipe(memStream)
                    var data = ''
                    memStream.on('data', (chunk) => {
                        data += chunk.toString()
                    })
                    memStream.on('end', function() {
                        data = 'window.__requires =' + JSON.stringify(requireNames) + ';' + data
                        fs.readFileAsync(viewsFile, 'utf8')
                        .then((content) => {
                            if (content !== data) {
                                fs.writeFileAsync(viewsFile, data)
                                .then(() => {
                                    resolve(this.apps)
                                })
                            } else {
                                resolve(this.apps)
                            }
                        })
                    })
                    resolve(this.apps)
                })
            } else {
                global.__requires.forEach((__require) => {
                    this.apps[__require[0]] = require(__require[1])(this)
                })
                resolve(this.apps)
            }
        })
    }
}


/**
 * Browser websocket transport initialization. Use a common _GLOBAL
 * variable for both environments.
 */
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        h5.peers.default = new Garage11('default', __runtime_config__)
        h5.peers.default.init()
    })
}

module.exports = Garage11
