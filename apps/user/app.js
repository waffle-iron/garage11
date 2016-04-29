'use strict'


module.exports = (h5) => {


    this.setStore = function(store) {
        store.defineResource('users')
    }


    this.pageActive = function() {
        h5.node.store.definitions.users.off('DS.change')
        h5.node.store.definitions.users.on('DS.change', () => {
            h5.vdom.set('user-list', this.getContext())
        })
    }


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    this.getContext = function() {
        let users = h5.node.store.definitions.users.getAll()
        let nodes = []
        let _nodes = h5.network.nodes()
        _nodes.forEach((node) => {
            let match = false
            users.forEach((user) => {
                if(node.id === user.id) {
                    match = true
                }
            })
            if(!match) {
                nodes.push(node)
            }
        })
        return {
            users: users,
            nodes: nodes,
        }
    }


    /**
     * First try to revive an identity from the store, or generate a fresh
     * new one. Either way, store the resulting identity to the store.
     */
    this.getOrCreateIdentity = function(collection) {
        // The first inserted user is the peer's user object.
        h5.logger.info('[app-user] querying for identity')
        return collection.findAll({where: {me: {'===': true}}})
        .then(users => users ? users[0] : undefined)
        .then(h5.crypto.getOrCreateIdentity.bind(h5.crypto))
        .then(() => Promise.all([
            h5.crypto.exportPrivateKey(h5.crypto.keypair.privateKey),
            h5.crypto.exportPublicKey(h5.crypto.keypair.publicKey),
        ]))
        .then((keys) => collection.create({
            id: h5.id,
            username: 'Anonymous(you)',
            privateKey: keys[0],
            publicKey: keys[1],
            me: true,
        }))
    }


    h5.router.route('/users/', {pushState: true}, (req, res) => {
        this.pageActive()

        h5.node.store.definitions.users.findAll({}, {bypassCache: true})
        .then((users) => {
            h5.vdom.set('user-list', this.getContext(users)).then((html) => {
                res(html)
            })
        })
    })

    return this
}
