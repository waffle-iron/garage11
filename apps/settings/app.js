'use strict'


module.exports = (peer) => {
    this.name = () => `${peer.name} [app-settings]`
    require('./lib')(this, peer)
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
        return peer.node.store.findAll('user', {})
        .then((users) => {
            let nodes = []
            let _nodes = peer.network.nodes()
            _nodes.forEach((node) => {
                let match = false
                users.forEach((user) => {
                    if (node.id === user._id) {
                        match = true
                    }
                })
                if (!match) {
                    nodes.push(node)
                }
            })
            let context = {
                users: users,
                nodes: nodes,
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
