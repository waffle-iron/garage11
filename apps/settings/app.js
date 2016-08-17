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
            // We need to serve a datastrure
            let userPermissions = {}

            for (let user of users) {
                let _permissions = []
                for (let permission of user.permissions) {
                    _permissions.push(permission.id)
                }
                userPermissions[user.id] = (_permissions)
            }
            let context = {
                users: users,
                userPermissions: userPermissions,
                permissions: permissions,
            }
            // Filter out nodes that have a user.
            let nodesWithoutUsers = peer.network.nodes().filter((node) => !(users.some((user) => node.id === user.id)))
            if (nodesWithoutUsers.length) context.nodes = nodesWithoutUsers
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
