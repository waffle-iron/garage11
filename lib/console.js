
/**
 * Helper functions to manage a headless node with.
 */
class Console {

    constructor(peer) {
        this.peer = peer
        this.store = peer.store
    }


    /**
     * Add a user with all permissions.
     * @param nodeId (Node) - A currently connected node identified by it's id.
     */
    createAdmin(nodeId) {
        let node = this.peer.network.node(nodeId)
        if (!node) throw 'Must be a valid node'
        this.store.findAll('permission', {})
        .then((permissionRecords) => {
            // TODO: Probably should use `upsert`.
            this.store.find('user', nodeId)
            .then((user) => {
                if(!user) {
                    this.peer.logger.info('Creating new superuser.')
                    return this.store.create('user', {
                        id: nodeId,
                        username: 'Guest',
                        publicKey: node.rawPublicKey,
                    })
                } else {
                    this.peer.logger.info('Reusing exists user entry.')
                    return user
                }
            })
            .then((userRecord) => {
                let userPermissionData = permissionRecords.map((permission) => {
                    return {user_id: userRecord.id, permission_id: permission.id}
                })
                this.store.findAll('user_permission', {user_id: node.id})
                .then((userPermissions) => {
                    if(!userPermissions) {
                        this.peer.logger.info('Adding all permissions to user.')
                        return this.store.createMany('user_permission', userPermissionData)
                    } else {
                        this.peer.logger.info('Permissions already exists for this user')
                    }
                })
            })
        })
    }

    users() {

    }

}


module.exports = Console
