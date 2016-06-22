'use strict'


module.exports = (peer) => {

    this.name = () => `${peer.name} [app-user]`

    this.setStore = function(store) {
        this.store = store

        if (!store.getMapperByName('user')) {
            store.defineMapper('user', {
                schema: {
                    properties: {
                      username: { type: 'string' },
                      privateKey: { type: 'string' },
                      publicKey: { type: 'string' },
                      me: {type: 'boolean'},
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
        this.store.getMapper('user').on('afterCreate', this.setContext)
        this.store.getMapper('user').on('afterDestroy', this.setContext)
        this.store.getMapper('user').on('afterUpdate', this.setContext)
    }


    /**
     * Returns users and nodes, where nodes aren't
     * represented by users yet.
     */
    this.setContext = function() {
        return peer.node.store.getMapper('user').findAll()
        .then((users) => {
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
            let context = {
                users: users,
                nodes: nodes,
            }
            context.html = peer.vdom.set('user-list', context)
            return context
        })
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
                    username: 'Anonymous',
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
            this.setContext(users)
            .then((context) => {
                res(context.html)
            })
        })
    })

    return this
}
