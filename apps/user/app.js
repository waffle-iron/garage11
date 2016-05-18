'use strict'


module.exports = (peer) => {

    this.name = () => `${peer.name} [app-user]`


    this.setStore = function(store) {
        store.defineResource('users')
    }


    this.pageActive = function() {
        peer.node.store.definitions.users.off('DS.change')
        peer.node.store.definitions.users.on('DS.change', () => {
            peer.vdom.set('user-list', this.getContext())
        })
    }


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    this.getContext = function() {
        let users = peer.node.store.definitions.users.getAll()
        let nodes = []
        let _nodes = peer.network.nodes()
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
        peer.logger.info(`${this.name()} querying for identity`)
        return collection.findAll({where: {me: {'===': true}}})
        .then(users => users ? users[0] : undefined)
        .then(peer.crypto.getOrCreateIdentity.bind(peer.crypto))
        .then(() => Promise.all([
            peer.crypto.exportPrivateKey(peer.crypto.keypair.privateKey),
            peer.crypto.exportPublicKey(peer.crypto.keypair.publicKey),
        ]))
        .then((keys) => collection.create({
            id: peer.id,
            username: 'Anonymous(you)',
            privateKey: keys[0],
            publicKey: keys[1],
            me: true,
        }))
    }


    peer.router.route('/users/', {pushState: true}, (req, res) => {
        this.pageActive()

        peer.node.store.definitions.users.findAll({}, {bypassCache: true})
        .then((users) => {
            peer.vdom.set('user-list', this.getContext(users)).then((html) => {
                res(html)
            })
        })
    })

    return this
}
