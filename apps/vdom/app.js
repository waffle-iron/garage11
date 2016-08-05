'use strict'

module.exports = (peer) => {

    this.setStore = function(store) {

    }

    if (peer.isBrowser) {
        peer.on('starting', () => {
            let vdomDialog = document.querySelector('.vdom-dialog')
            vdomDialog.addEventListener('close', () => {
                // Triggers a route.
                location.hash = ''
            })

            // Event delegation for the js-dialog-close class.
            document.querySelector('html').addEventListener('click', e => {
                e.preventDefault()
                if (e.target.classList.contains('js-dialog-close')) {
                    let dialogElement = e.target.closest('dialog')
                    if (dialogElement.open) {
                        dialogElement.close()
                    }
                }
            })

            window.onhashchange = () => {
                peer.vdom.renderer.set('locationHash', location.hash)
            }
            // Trigger onhashchange manually when the page loads.
            let event = new Event('hashchange')
            window.dispatchEvent(event)
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
