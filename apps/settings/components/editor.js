'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['settings-editor'],
        oninit: function() {
            this.on({
                saveUser: (e) => {
                    let store = peer.node.store
                    let cleanedData = peer.vdom.validation.isValid(e.node.form)
                    // The permission id's that this user is bound to.
                    let permissionIds = e.get('permission_ids')
                    let userPerms = []
                    for (let permissionId of permissionIds) {
                        console.log('Storing with user id:', e.context.id)
                        userPerms.push({
                            permission_id: permissionId,
                            user_id: e.context.id
                        })
                    }

                    if (cleanedData) {
                        if (e.context.id) {
                            // Check which permissions the user has, and
                            // which are to be posted. This ends up in a serie
                            // to be deleted or to be added permissions.
                            store.createMany('user_permission', userPerms)
                            .then((user) => {
                                console.log("CREATE USERPERMISSIONS", userPerms)
                                store.find('user', e.context.id)
                                .then((user) => {
                                    user.username = cleanedData.username
                                    user.save()

                                })
                            })



                        } else {
                            store.create('user', cleanedData)
                            // store.createMany('user_permission', userPerms)
                        }
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
