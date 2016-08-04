'use strict'

module.exports = (peer) => {

    this.setStore = function(store) {

    }

    if (peer.isBrowser) {
        peer.on('starting', function(event) {
            let vdomDialog = document.querySelector('.vdom-dialog')
            vdomDialog.addEventListener('close', () => {
                // Triggers a route.
                location.hash = ''
            })
        });
    }


    /**
     * Simple route that closes all dialogs.
     */
    peer.router.route('', {pushState: true, overlay: true}, (req, res) => {
        for (let node of document.querySelectorAll('dialog')) {
            if (node.open) {
                node.close()
            }
        }
    })

    return this
}
