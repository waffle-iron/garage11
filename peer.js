'use strict'

const Console = require('./lib/console')
const Network = require('lib11/lib/network')
const Notifier = require('./lib/notifier')
const Peer = require('lib11/lib/peer')
const Store = require('./lib/store')
const VDom = require('./lib/vdom')


class Garage11 extends Peer {

    constructor(...kwargs) {
        super(...kwargs)
    }

    init() {
        // First find all applications.
        return this.initApps()
        .then(this.setupLocalStore.bind(this))
        .then((store) => {
            return this.apps.get('settings').lib.getOrCreateIdentity(store)
        })
        .then(([store, userRecord]) => {
            // With `passiveMode`, the active node will be the first node
            // the peer connects to, instead of the peer's own node reference.
            // This can be overriden by the user, by settings a default
            // node.
            this.passiveMode = true
            this.user = userRecord
            this.logger.info(`${this.name} [garage11] peer identified as ${this.user.id}`)
            this.network = new Network(this, userRecord.id, this.settings.network)

            this.network.on('setCurrentNode', node => {
                this.apps.get('settings').lib.permissionsToData(node)
            })

            this.network.on('nodeInitialAdded', (node) => {
                this.vdom = new VDom(this)
                this.vdom.init()
                .then(() => {
                    this.emit('starting')
                })
            })

            // Bind a store to each node.
            this.network.on('nodeAdded', (node) => {
                if (node.id === this.node.id) {
                    node.store = store
                } else {
                    node.store = new Store(this, {isLocal: false, apps: this.apps, node: node})
                }
            })

            this.console = new Console(this)
            this.notifier = new Notifier(this)

            // Add a shortcut to the default node console.
            if (this._name === 'default') {
                global.cmd = this.console
                if (this.isHeadless) {
                    nesh.config.load()
                    nesh.log.winston()
                    nesh.start({autoload: true, prompt: '>> '}, err => {
                        if (err) {
                            nesh.log.error(err)
                        }
                    })
                }
            }
            for (let app of this.apps.values()) {
                app.init()
            }
            this.network.connect()
        })
    }


    /**
     * Create a local store for the peer, because we first needs
     * to get the identify from the store, before we can establish the
     * initial (persistent) node.
     */
    setupLocalStore() {
        return new Promise((resolve) => {
            this.store = new Store(this, {isLocal: true, apps: this.apps, dbName: this.settings.dbName})
            // Then get the identity from the store.
            resolve(this.store)
        })
    }


    /**
     * Loads all app.js files in apps subdirectories and interpret them
     * as Garage 11 application files.
     */
    initApps() {
        return new Promise((resolve) => {
            this.apps = new Map()
            if (this.isBrowser) {
                global.__requires.forEach((__require) => {
                    const _module = require(__require[1])
                    this.apps.set(__require[0], new _module(this))
                })
                resolve(this.apps)
            } else {
                let requireNames = []
                const projectDir = this.settings.headless.projectDir
                const b = browserify({basedir: path.join(projectDir)})
                fs.readdir(path.join(projectDir, 'apps'), (err, appNames) => {
                    appNames.forEach((appName) => {
                        const viewRequire = './' + path.join('apps', appName, 'app')
                        const _module = require(viewRequire)
                        this.apps.set(appName, new _module(this))
                        requireNames.push([appName, viewRequire])
                        b.require(viewRequire)
                    })
                    const memStream = new MemoryStream()
                    const viewsFile = path.join('public', 'js', 'apps.js')
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
                })
            }
        })
    }
}


/**
 * Browser websocket transport initialization. Use a common _GLOBAL
 * variable for both environments.
 */
if (typeof window !== 'undefined') {
    lib11.peers.default = new Garage11('default', __runtime_config__)
    lib11.peers.default.init()
}

module.exports = Garage11
