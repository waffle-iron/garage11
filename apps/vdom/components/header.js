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
            // Query user read permission.
            let getItems = () => {
                return [
                    {icon: 'pencil', name: 'Blog', path: '/', active: true},
                    {icon: 'cogs', name: 'Settings', path: '/users/', active: false},
                ]
            }
            return {
                pages: getItems(),
                hashActive: (locationHash) => {
                    if(locationHash === '#crowd') {
                        return true
                    }
                    return false
                }
            }
        },
    })
}
