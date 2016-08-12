'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        template: templates['settings-entry'],
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
                    if(e.context.id !== peer.id) {
                        peer.node.store.getMapper('user').destroy(e.context.id)
                    } else {
                        // User decided to nuke it's own identity. Remove
                        // All other stored identities with it and reboot
                        // the application.
                        peer.node.store.getMapper('user').destroyAll()
                        .then(() => {
                            location.reload()
                        })
                    }
                },
            })
        },
    })
}
