'use strict'


module.exports = (h5) => {

    this.setStore = function(store) {
        
    }

    /**
     * Renders the nodes page.
     */
    h5.router.page('/crowd/', {pushState: true}, (req, res) => {
        let context = {
            me: h5.id,
            isEqual: (val1, val2) => {
                if (val1 === val2) {
                    return true;
                }
                return false
            },
        }
        h5.vdom.set('crowd-list', context)
        .then((html) => {
            if (h5.isBrowser) {
                h5.vdom.renderer.on('submit', (e) => {
                    e.original.preventDefault()
                    let nodeId = e.node[0].id
                    let data = {
                        message: this.get('val'),
                    }
                    let requestObj = Request.create({url: '/nodes/broadcast/message/', params: data})
                    h5.nodes[nodeId].request(requestObj)
                })
            }
            res(html)
        })
    })

    return this
}
