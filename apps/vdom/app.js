'use strict'

const Garage11App = require('../../lib/app')


class App extends Garage11App {


    get name() {
        return `${this.peer.name} [app-vdom]`
    }


    constructor(...args) {
        super(...args)
        if (this.peer.isBrowser) {
            this.peer.on('starting', () => {
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
                    this.peer.vdom.renderer.set('locationHash', location.hash)
                }
                // Trigger onhashchange manually when the page loads.
                let event = new Event('hashchange')
                window.dispatchEvent(event)
            });
        }

        this.routes()
    }


    init() {

    }


    routes() {
        /**
         * Simple route that closes all dialogs.
         */
        this.peer.router.route('', {pushState: true, overlay: true}, (req, res) => {
            for (let node of document.querySelectorAll('dialog')) {
                if (node.open) {
                    node.close()
                }
            }
        })
    }

}


module.exports = App
