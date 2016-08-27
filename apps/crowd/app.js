'use strict'

const Garage11App = require('../../lib/app')


class App extends Garage11App {


    get name() {
        return `${this.peer.name} [app-crowd]`
    }


    constructor(...args) {
        super(...args)
        this.routes()
    }


    init() {

    }


    setStore(store) {
        this.store = store
    }


    routes() {
        /**
         * Render the nodes page inside a modal. This routes to a
         * hash, which allows another route to kick in on the
         * pathname.
         */
        this.peer.router.route('#crowd', {pushState: true, overlay: true}, (req, res) => {
            const context = {
                me: this.peer.id,
                isEqual: (val1, val2) => {
                    if (val1 === val2) {
                        return true
                    }
                    return false
                },
            }
            const html = this.peer.vdom.set('crowd-list', context, 'vdom-dialog')

            if (this.peer.isBrowser) {
                const vdomDialog = document.querySelector('.vdom-dialog')
                if (!vdomDialog.open) {
                    vdomDialog.showModal()
                }

                this.peer.vdom.renderer.on('submit', (e) => {
                    e.original.preventDefault()
                    const nodeId = e.node[0].id
                    const data = {
                        message: this.get('val'),
                    }
                    const requestObj = Request.create({url: '/nodes/broadcast/message/', params: data})
                    this.peer.nodes[nodeId].request(requestObj)
                })
            }
            res(html)
        })
    }
}


module.exports = App
