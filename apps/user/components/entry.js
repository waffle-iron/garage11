'use strict'

module.exports = (templates) => {
    return Ractive.extend({
        template: templates['user-entry'],
        oninit: function() {
            this.on({
                closeDeleteUserModal: (e) => {
                    document.querySelector(`#delete-dialog-${e.context.id}`).close()
                },
                openDeleteUserModal: (e) => {
                    document.querySelector(`#delete-dialog-${e.context.id}`).showModal()
                },
                openEditUserModal: (e) => {
                    document.querySelector(`#edit-user-dialog-${e.context.id}`).showModal()
                },
                deleteUser: function(e) {
                    if(e.context.id !== h5.id) {
                        h5.node.store.definitions.users.destroy(e.context.id)
                    } else {
                        // User decided to nuke it's own identity. Remove
                        // All other stored identities with it and reboot
                        // the application.
                        h5.node.store.definitions.users.destroyAll()
                        .then(() => {
                            location.reload()
                        })
                    }
                },
            })
        },
    })
}
