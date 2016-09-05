'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['settings-editor'],
        oninit: function() {
            this.on({
                saveUser: (e) => {
                    const store = peer.network.currentNode.store
                    let cleanedData = peer.vdom.validation.isValid(e.node.form)
                    // The permission id's that this user is bound to.
                    let selectedIds = e.get('permission_ids')

                    if (cleanedData) {
                        if (!e.context.id) {
                            // Always only store the user first. Permissions
                            // can be added when editing the user.
                            return store.create('user', cleanedData)
                        }

                        // Get the current user permissions.
                        return store.findAll('user_permission', {where: {user_id: {'==': e.context.id}}})
                        .then((currentUserPermissions) => {
                            let currentIds = currentUserPermissions.map((i) => i.permission_id)
                            // permissions id's that are in current but not in selected.
                            let delIds = currentIds.filter((i) => !selectedIds.includes(i))
                            // permissions id's that are in selected but not in current.
                            let newIds = selectedIds.filter((i) => !currentIds.includes(i))
                            let actions = []
                            if (delIds.length) {
                                actions.push(
                                    store.destroyAll('user_permission', {
                                        where: {permission_id: {'in': delIds}},
                                    })
                                )
                            }
                            if (newIds.length) {
                                actions.push(
                                    store.createMany('user_permission', newIds.map((i) => ({
                                        permission_id: i, user_id: e.context.id,
                                    })))
                                )
                            }

                            Promise.all(actions)
                            .then((actions) => {
                                // First store user.
                                return store.find('user', e.context.id)
                                .then((user) => {
                                    user.username = cleanedData.username
                                    user.save()
                                    peer.notifier.notify('User updated')
                                })
                            })
                        })
                    }
                },
                openEditor: (e) => {
                    if (e.context.id) {
                    // Instances with an existing article.
                        document.querySelector(`#edit-user-dialog-${e.context.id}`).showModal()
                    } else {
                        document.querySelector('#edit-user-dialog').showModal()
                    }
                },
            })
        },
        data: {
            /**
             * Check if a user has a certain permission.
             * @param permissionRecord: The permission record to check.
             */
            hasPermission: function(userId, permissionId, userPermissions) {
                if (userPermissions[userId].includes(permissionId)) {
                    return true
                }
                return false
            }
        },
    })
}
