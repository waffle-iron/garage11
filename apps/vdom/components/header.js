'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['vdom-header'],
        oninit: function() {
            peer.router.on('router.route_changed', (request) => {
                this.get('pages').forEach((page, i) => {
                    if (page.path === request.pathname) {
                        this.set('pages.' + i + '.active', true)
                    } else {
                        this.set('pages.' + i + '.active', false)
                    }
                })
            })
            if (peer.isBrowser) {
                window.addEventListener('popstate', function(e) {
                    console.log("poPS")
                }, false)
            }

            peer.network.on('setCurrentNode', node => {
                peer.vdom.renderer.set('currentNode', node)
            })

        },
        data: function() {
            return {
                pages: [
                    {icon: 'blog', name: 'Blog', path: '/blog/', active: false},
                    {icon: 'cogs', name: 'Settings', path: '/settings/', active: false},
                ],
                hashActive: (locationHash) => {
                    if (locationHash === '#crowd') {
                        return true
                    }
                    return false
                },
                activePage: (page) => {
                    if (peer.location.pathname === page.path) {
                        page.active = true
                        return true
                    }
                    page.active = false
                    return false
                }
            }
        },
    })
}
