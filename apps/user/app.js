'use strict'


module.exports = (peer) => {

    this.name = () => `${peer.name} [app-user]`

    this.setStore = function(store) {
        this.store = store
        if (!this.store.getMapperByName('user')) {
            this.store.defineMapper('user', {
                schema: {
                    properties: {
                      username: { type: 'string' },
                      privateKey: { type: 'string' },
                      publicKey: { type: 'string' },
                      me: {type: 'boolean'}
                  },
                },
                relations: {
                    hasMany: {
                        blog: {
                            foreignKey: 'userId',
                            localField: 'blogs',
                        },
                    },
                },
            })
        }
    }


    this.pageActive = function() {
        peer.node.store.getMapper('user').off('DS.change')
        peer.node.store.getMapper('user').on('change', () => {
            peer.vdom.set('user-list', this.getContext())
        })
    }


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    this.getContext = function() {
        let users = peer.node.store.getMapper('user').getAll()
        let nodes = []
        let _nodes = peer.network.nodes()
        _nodes.forEach((node) => {
            let match = false
            users.forEach((user) => {
                if(node.id === user._id) {
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
        let userExists;
        // The first inserted user is the peer's user object.
        peer.logger.info(`${this.name()} querying for identity`)
        return collection.findAll({where: {me: {'===': true}}})
        .then((result) => {
            if (result[0]) {
                userExists = true;
                return result[0]
            }
        })
        .then(peer.crypto.getOrCreateIdentity.bind(peer.crypto))
        .then(() => Promise.all([
            peer.crypto.exportPrivateKey(peer.crypto.keypair.privateKey),
            peer.crypto.exportPublicKey(peer.crypto.keypair.publicKey),
        ]))
        .then((keys) => {
            if (!userExists) {
                collection.create({
                    _id: peer.id,
                    username: 'Anonymous(you)',
                    privateKey: keys[0],
                    publicKey: keys[1],
                    me: true,
                })
            }
        })
    }


    peer.router.route('/users/', {pushState: true}, (req, res) => {
        this.pageActive()

        peer.node.store.getMapper('user').findAll({}, {bypassCache: true})
        .then((users) => {
            peer.vdom.set('user-list', this.getContext(users)).then((html) => {
                res(html)
            })
        })
    })

    return this
}
