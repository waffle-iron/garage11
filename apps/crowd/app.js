'use strict'


module.exports = (peer) => {

    this.setStore = function(store) {
        this.store = store
    }

    /**
     * Render the nodes page inside a modal.
     */
    peer.router.route('/crowd/', {pushState: true}, (req, res) => {
        let context = {
            me: peer.id,
            isEqual: (val1, val2) => {
                if (val1 === val2) {
                    return true
                }
                return false
            },
        }
        let html = peer.vdom.set('crowd-list', context, 'vdom-dialog')
        if (peer.isBrowser) {
            peer.vdom.renderer.on('submit', (e) => {
                e.original.preventDefault()
                let nodeId = e.node[0].id
                let data = {
                    message: this.get('val'),
                }
                let requestObj = Request.create({url: '/nodes/broadcast/message/', params: data})
                peer.nodes[nodeId].request(requestObj)
            })
                document.querySelector('.vdom-dialog').showModal()
        }
        res(html)
    })

    return this
}
