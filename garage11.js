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
        this.vdom = new VDom(this)
        return this.vdom.init()
        .then(this.getApplications.bind(this))
        .then((apps) => {
            this.apps = apps
            // Create a local store for the peer.
            let store = new Store(this, {isLocal: true, apps: apps, store: this.settings.store})
            return this.apps.user.getOrCreateIdentity(store.definitions.users)
            .then(() => {
                this.network = new Network(this, this.id, store, this.settings.network)
                this.network.on('network.nodeAdded', (node) => {
                    // Don't set a remote adapter on memory nodes.
                    if(node.transport.constructor.name.toLowerCase() !== 'memorytransport') {
                        node.store = new Store(this, {isLocal: false, apps: apps})
                    } else {
                        node.store = new Store(this, {isLocal: true, apps: apps})
                    }
                })
                this.vdom.listeners()
                return this
            })
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
                            if(content !== data) {
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
        window.garage11 = new Garage11('default', __runtime_config__)
        garage11.init()
    })
}

module.exports = Garage11
