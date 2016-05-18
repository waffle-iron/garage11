'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['vdom-header'],
        oninit: function() {
            peer.router.on('router.route_changed', (request) => {
                this.get('pages').forEach((page, i) => {
                    if (page.path === request.url) {
                        this.set('pages.' + i + '.active', true)
                    } else {
                        this.set('pages.' + i + '.active', false)
                    }
                })
            })
        },
        data: () => {
            return {
                pages: [
                    {name: 'Blog', path: '/', active: true},
                    {name: 'Crowd', path: '/crowd/', active: false},
                    {name: 'Users', path: '/users/', active: false},
                ],
            }
        },
    })
}
