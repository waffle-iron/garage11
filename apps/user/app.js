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


    /**
     * Maps a user's permissions to Ractive variables.
     */
    this.permissionsToData = function(node) {
        let permissionData = new Map()
        node.store.findAll('permission')
        .then((permissionRecords) => {
            // First set all permissions to false.
            for (let perm of permissionRecords) {
                let permissionName = `perm_${perm.record}_${perm.action}`;
                permissionData.set(permissionName, false)
            }
            node.store.findAll('user_permission', {where: {user_id: peer.id}})
            .then((userPermissions) => {
                // Set the permissions to true, for permissions that have a user_permission record.
                for (let userPerm of userPermissions) {
                    let permissionName = `perm_${userPerm.permission.record}_${userPerm.permission.action}`;
                    permissionData.set(permissionName, true)
                }

                for (let perm of permissionRecords) {
                    let permissionName = `perm_${perm.record}_${perm.action}`
                    peer.vdom.renderer.set(permissionName, permissionData.get(permissionName))
                }
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
