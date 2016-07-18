'use strict'


module.exports = (peer) => {
    this.name = () => `${peer.name} [app-user]`
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
                    if(node.id === user._id) {
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
            context.html = peer.vdom.set('user-list', context)
            return context
        })
    }


    this.loadPermissions = function(node) {
        return node.store.findAll('permission')
        .then((permissionRecords) => {
            return permissionRecords
        })
    }


    /**
     * Maps a user's permissions to Ractive variables.
     */
    this.permissionsToData = function(node) {
        this.loadPermissions(node)
        .then((permissionRecords) => {
            let permission = permissionRecords.filter((rec) => (rec.record === 'user' && rec.action === 'read'))[0]
            node.store.findAll('user_permission', {
                where: {user_id: peer.id, permission_id: permission.id}
            })
            .then((permissionRecords) => {
                peer.vdom.renderer.set('userReadPermission', permissionRecords.length)
            })
        })

    }


    /**
     * First try to revive an identity from the store, or generate a fresh
     * new one. Either way, store the resulting identity to the store and
     * return the UserRecord that matches for this peer.
     */
    this.getOrCreateIdentity = function(store) {
        let userRecord
        // The first inserted user is the peer's user object.
        peer.logger.info(`${this.name()} querying for identity`)
        return store.findAll('user', {where: {me: {'===': true}}})
        .then((userRecords) => {
            if (userRecords.length) {
                userRecord = userRecords[0]
                return userRecord
            }
        })
        .then(peer.crypto.getOrCreateIdentity.bind(peer.crypto))
        .then(() => Promise.all([
            peer.crypto.exportPrivateKey(peer.crypto.keypair.privateKey),
            peer.crypto.exportPublicKey(peer.crypto.keypair.publicKey),
        ]))
        .then((keys) => {
            if (!userRecord) {
                return store.create('user', {
                    id: peer.id,
                    username: 'Owner',
                    privateKey: keys[0],
                    publicKey: keys[1],
                    me: true,
                })
                .then((_userRecord) => {
                    return [store, _userRecord]
                })
            }
            return [store, userRecord]
        })
    }


    peer.router.route('/users/', {pushState: true}, (req, res) => {
        this.pageActive()

        peer.node.store.getMapper('user').findAll({}, {bypassCache: true})
        .then((users) => {
            this.setContext(users)
            .then((context) => {
                res(context.html)
            })
        })
    })

    return this
}
