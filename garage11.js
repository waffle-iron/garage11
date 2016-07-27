'use strict'

global.nesh = require('nesh')

const Console = require('./lib/console')
const Network = require('high5/lib/network')
const Peer = require('high5/lib/peer')
const Store = require('./lib/store')
const VDom = require('./lib/vdom')


class Garage11 extends Peer {

    constructor(...kwargs) {
        super(...kwargs)
    }

    init() {
        // First find all applications.
        return this.findApplications()
        .then(this.setupLocalStore.bind(this))
        .then((store) => {
            return this.apps.user.getOrCreateIdentity(store)
        })
        .then(([store, userRecord]) => {
            this.store.initialData()
            this.user = userRecord
            this.network = new Network(this, userRecord.user_id, this.settings.network)
            this.network.on('setCurrentNode', node => {
                this.apps.user.permissionsToData(node)
            })
            // Bind a store to each node.
            this.network.on('nodeAdded', (node) => {
                if (node.id === this.node.id) {
                    node.store = store
                } else {
                    node.store = new Store(this, {isLocal: false, apps: this.apps, node: node})
                }
            })
            this.network.connect()
            this.vdom = new VDom(this)
            return this.vdom.init()
        })
        .then(() => {
            this.console = new Console(this)
            // Add a shortcut to the default node console.
            if (this._name === 'default') {
                global._ = this.console
                nesh.config.load()
                // nesh.log.winston()
                nesh.start({autoload: true, prompt: '>> '}, err => {if (err) {nesh.log.error(err)}})
            }
        })
    }


    /**
     * Create a local store for the peer, because we first needs
     * to get the identify from the store, before we can establish the
     * initial (persistent) node.
     */
    setupLocalStore() {
        return new Promise((resolve) => {
            this.store = new Store(this, {isLocal: true, apps: this.apps, store: this.settings.store})
            // Then get the identity from the store.
            resolve(this.store)
        })
    }


    /**
     * Loads all app.js files in apps subdirectories and interpret them
     * as Garage 11 application files.
     */
    findApplications() {
        return new Promise((resolve) => {
            this.apps = {};
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
