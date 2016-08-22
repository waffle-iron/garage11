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

    let context = {}


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    this.setContext = function() {
        let store = peer.node.store
        return Promise.all([
            store.findAll('user', {orderBy: [['created', 'ASC']]}, {with: ['user_permission']}),
            store.findAll('permission', {}),
        ])
        .then(([users, permissions]) => {
            for (let user of users) {
                console.log(user.permissions)
            }
            // Map the user's permissions.
            let usersData = store.getMapper('user').toJSON(users, {withAll: true})
            for (let user of usersData) {
                // These are the permission_ids which the user has; not the
                // user_permission id's!
                user.permission_ids = user.user_permissions.map((userPerm) => userPerm.permission_id)
            }

            context.users = usersData
            context.permissions = permissions.reduce((result, item) => {
                result[item.id] = {action: item.action, record: item.record}
                return result
            }, {})

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
