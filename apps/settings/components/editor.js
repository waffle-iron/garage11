'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['settings-editor'],
        oninit: function() {
            this.on({
                saveUser: (e) => {
                    let cleanedData = peer.vdom.validation.isValid(e.node.form)
                    if (cleanedData) {
                        if (e.context.id) {
                            peer.node.store.update('user', e.context.id, cleanedData)
                        } else {
                            peer.node.store.create('user', cleanedData)
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
        data: {},
    })
}
