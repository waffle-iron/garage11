'use strict'


module.exports = (peer) => {
    this.name = () => `${peer.name} [app-settings]`
    Object.assign(this, require('./lib')(peer))
    this.storage = require('./storage')

    this.pageActive = function() {
        let userMapper = peer.network.currentNode.store.getMapper('user')
        userMapper.off('afterCreate')
        userMapper.off('afterDestroy')
        userMapper.off('afterUpdate')
        userMapper.on('afterCreate', this.setContext)
        userMapper.on('afterDestroy', this.setContext)
        userMapper.on('afterUpdate', this.setContext)
    }


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    this.setContext = function() {
        return Promise.all([
            peer.node.store.findAll('user', {orderBy: [['created', 'ASC']]}, {with: ['user_permission']}),
            peer.node.store.findAll('permission', {}),
        ])
        .then(([users, permissions]) => {
            let nodes = peer.network.nodes().filter((node) => {
                let match = false
                users.forEach((user) => {
                    // Exclude nodes that have a user.
                    if (node.id === user.id) match = true
                })
                return !match
            })
            let context = {
                users: users,
                permissions: permissions,
            }
            if (nodes.length) {
                context['nodes'] = nodes
            }
            context.html = peer.vdom.set('settings-list', context)
            return context
        })
    }

    peer.router.route('/settings/', {pushState: true}, (req, res) => {
        this.pageActive()
        this.setContext()
        .then((context) => {
            res(context.html)
        })

    })

    return this
}
