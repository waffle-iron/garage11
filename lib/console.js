'use strict'

/**
 * Helper functions to manage a headless node with.
 */
class Console {

    constructor(peer) {
        this.peer = peer
        this.store = peer.store
    }


    /**
     * Create a new user from an available node.
     * @param nodeId (Node) - A currently connected node identified by it's id.
     */
    addUser(nodeId) {
        return this.store.find('user', nodeId)
        .then((user) => {
            if(!user) {
                let node = this.peer.network.node(nodeId)
                if (!node) throw 'Must be a valid node'
                this.peer.logger.info('New user created.')
                return this.store.create('user', {
                    id: node.id,
                    username: 'Guest',
                    publicKey: node.rawPublicKey,
                })
            } else {
                this.peer.logger.info('User already exists.')
                return user
            }
        })
    }


    /**
     * Add a user if it doesn't exist yet.  with all permissions.
     * @param nodeId (Node) - A currently connected node identified by it's id.
     */
    allPermissions(nodeId) {
        this.store.findAll('permission', {})
        .then((permissionRecords) => {
            this.addUser(nodeId)
            .then((userRecord) => {
                let userPerms = permissionRecords.map((permission) => ({user_id: userRecord.id, permission_id: permission.id}))
                this.store.findAll('user_permission', {user_id: userRecord.id})
                .then((userPermsRecords) => {
                    if(!userPermsRecords.length) {
                        this.peer.logger.info('Adding all permissions to user.')
                        return this.store.createMany('user_permission', userPerms)
                    } else {
                        this.peer.logger.info('Removing all permissions from user')
                        return this.store.destroyAll('user_permission', {where: {id: {in: userPermsRecords.map((item) => item.id)}}})
                    }
                })
            })
            .catch((err) => {
                this.peer.logger.error(err)
            })
        })
    }

    users() {

    }

}


module.exports = Console
