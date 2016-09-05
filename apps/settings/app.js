'use strict'

const Garage11App = require('../../lib/app')
const SettingsLib = require('./lib')


class SettingsApp extends Garage11App {


    get name() {
        return `${this.peer.name} [app-settings]`
    }


    constructor(...args) {
        super(...args)
        this.lib = new SettingsLib(this.peer)
        this.storage = require('./storage')
        this.permissions = require('./permissions')
        this.routes()
    }


    init() {

    }


    events() {
        let userMapper = this.peer.network.currentNode.store.getMapper('user')
        userMapper.off('afterCreate')
        userMapper.off('afterDestroy')
        userMapper.off('afterUpdate')
        userMapper.on('afterCreate', this.updateContext.bind(this))
        userMapper.on('afterDestroy', this.updateContext.bind(this))
        userMapper.on('afterUpdate', this.updateContext.bind(this))
    }


    routes() {
        this.peer.router.route('/settings/', {pushState: true}, (req, res) => {
            this.events()
            this.updateContext()
            .then((context) => {
                res(context.html)
            })
        })
    }


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    updateContext() {
        const store = this.peer.network.currentNode.store
        let context = {}
        return Promise.all([
            store.findAll('user', {orderBy: [['created', 'ASC']]}, {with: ['user_permission']}),
            store.findAll('permission', {}),
            store.findAll('user_permission', {}),
        ])
        .then(([users, permissions]) => {
            // Map the user's permissions.
            const usersData = store.getMapper('user').toJSON(users, {withAll: true})
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

            // // Filter out nodes that have a user.
            const nodesWithoutUsers = this.peer.network.nodes({ownNode: true, serialized: true}).filter((node) => !(users.some((user) => node.id === user.id)))
            if (nodesWithoutUsers.length) context.nodes = nodesWithoutUsers
            context.html = this.peer.vdom.set('settings-list', context)
            return context
        })
    }
}


module.exports = SettingsApp
