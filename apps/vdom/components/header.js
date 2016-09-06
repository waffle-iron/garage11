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


        },
        data: function() {
            let getItems = () => {
                return [
                    {icon: 'blog', name: 'Blog', path: '/', active: false},
                    {icon: 'cogs', name: 'Settings', path: '/settings/', active: false},
                ]
            }
            return {
                pages: getItems(),
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
