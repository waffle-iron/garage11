'use strict'


class SettingsLib {

    constructor(peer) {
        this.peer = peer
        this.name = () => `${peer.name} [app-settings]`
    }


    /**
     * Add a user with all permissions if it doesn't exist yet.
     * @param nodeId (Node) - A currently connected node identified by it's id.
     */
    allPermissions(store, nodeId) {
        return store.findAll('permission', {})
        .then((permissionRecords) => {
            console.log(permissionRecords)
            return this.addUser(store, nodeId)
            .then((userRecord) => {
                console.log(userRecord)
                let userPerms = permissionRecords.map((permission) => {
                    return {
                        user_id: userRecord.id,
                        permission_id: permission.id,
                    }
                })
                return store.findAll('user_permission', {user_id: userRecord.id})
                .then((userPermsRecords) => {
                    if (!userPermsRecords.length) {
                        this.peer.logger.info('Adding all permissions to user.')
                        return store.createMany('user_permission', userPerms)
                    } else {
                        this.peer.logger.info('Removing all permissions from user')
                        return store.destroyAll('user_permission', {where: {id: {in: userPermsRecords.map((item) => item.id)}}})
                    }
                })
            })
        })
        .catch((err) => {
            this.peer.logger.error(err)
        })
    }


    /**
     * Create a new user from an available node.
     * @param nodeId (Node) - A currently connected node identified by it's id.
     */
    addUser(store, nodeId) {
        console.log('FIND', nodeId)
        return store.find('user', nodeId)
        .then((user) => {
            console.log('USERRRR:', user)
            if (!user) {
                let node = this.peer.network.node(nodeId)
                console.log('peer:', this.peer.name)
                if (!node) throw 'Must be a valid node'
                this.peer.logger.info('New user created.')
                return store.create('user', {
                    id: node.id,
                    username: 'John/Jane Doe',
                    publicKey: node.rawPublicKey,
                })
            } else {
                this.peer.logger.info('User already exists.')
                return user
            }
        })
    }


    /**
     * First try to revive an identity from the store, or generate a fresh
     * new one. Either way, store the resulting identity to the store and
     * return the UserRecord that matches for this peer.
     */
    getOrCreateIdentity(store) {
        let userRecord
        this.peer.logger.info(`${this.name()} querying for identity`)
        // The first inserted user is the peer's user object.
        return store.findAll('user', {orderBy: [['created', 'ASC']]})
        .then((userRecords) => {
            if (userRecords.length) userRecord = userRecords[0]
            return userRecord
        })
        .then(this.peer.crypto.getOrCreateIdentity.bind(this.peer.crypto))
        .then(() => Promise.all([
            this.peer.crypto.exportPrivateKey(this.peer.crypto.keypair.privateKey),
            this.peer.crypto.exportPublicKey(this.peer.crypto.keypair.publicKey),
        ]))
        .then((keys) => {
            if (!userRecord) {
                return store.create('user', {
                    id: this.peer.id,
                    username: 'John/Jane Doe',
                    privateKey: keys[0],
                    publicKey: keys[1],
                })
                .then((_userRecord) => {
                    return this.allPermissions(store, _userRecord.id)
                    .then(() => {
                        return [store, _userRecord]
                    })
                })
            }
            return [store, userRecord]
        })
    }


    /**
     * Maps a user's permissions to Ractive variables.
     */
    permissionsToData(node) {
        let permissionData = new Map()
        node.store.findAll('permission')
        .then((permissionRecords) => {
            // First set all permissions to false.
            for (let perm of permissionRecords) {
                let permissionName = `perm_${perm.record}_${perm.action}`;
                permissionData.set(permissionName, false)
            }
            node.store.findAll('user_permission', {where: {user_id: this.peer.id}})
            .then((userPermissions) => {
                // Set the permissions to true, for permissions that have a user_permission record.
                for (let userPerm of userPermissions) {
                    let permissionName = `perm_${userPerm.permission.record}_${userPerm.permission.action}`;
                    permissionData.set(permissionName, true)
                }

                for (let perm of permissionRecords) {
                    let permissionName = `perm_${perm.record}_${perm.action}`
                    this.peer.vdom.renderer.set(permissionName, permissionData.get(permissionName))
                }
            })
        })
    }
}
/**
 * Helper functions for the settings app.
 */
module.exports = SettingsLib
