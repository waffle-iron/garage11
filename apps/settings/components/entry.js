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
                    let store = peer.node.store
                    if (e.context.id !== peer.id) {
                        return Promise.all([
                            store.destroy('user', e.context.id),
                            store.destroyAll('user_permission', {where: {user_id: {'==': e.context.id}}}),
                        ])
                    } else {
                        // User decided to nuke it's own identity. Remove
                        // All other stored identities with it and reboot.
                        return Promise.all([
                            store.destroyAll('user'),
                            store.destroyAll('blog', {where: {user_id: {'==': e.context.id}}}),
                            store.destroyAll('user_permission', {where: {user_id: {'==': e.context.id}}}),
                        ])
                        .then(() => {
                            location.reload()
                        })
                    }
                },
            })
        },
    })
}
