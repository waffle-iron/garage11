'use strict'

module.exports = (templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['user-nodes'],
        oninit: function() {
            this.on({
                saveUser: (e) => {
                    let node = h5.network.node(e.context.selectedNodeId)
                    h5.node.store.definitions.users.create({
                        id: node.id,
                        username: 'The other',
                        publicKey: node.id,
                    })
                },
            })
        },
        data: {},
    })
}
