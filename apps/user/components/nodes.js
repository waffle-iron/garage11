'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['user-nodes'],
        oninit: function() {
            this.on({
                saveUser: (e) => {
                    let node = peer.network.node(e.context.selectedNodeId)
                    peer.node.store.definitions.users.create({
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
