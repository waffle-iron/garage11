'use strict'

module.exports = function(peer) {

    return {
        /**
         * Maps a user's permissions to Ractive variables.
         */
        permissionsToData: function(node) {
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
    }
}
