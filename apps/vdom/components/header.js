'use strict'

module.exports = (templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['vdom-header'],
        oninit: function() {
            h5.router.on('h5.router.route_changed', (request) => {
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
