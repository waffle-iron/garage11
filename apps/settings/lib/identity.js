'use strict'

module.exports = function(peer) {

    return {
        /**
         * First try to revive an identity from the store, or generate a fresh
         * new one. Either way, store the resulting identity to the store and
         * return the UserRecord that matches for this peer.
         */
        getOrCreateIdentity: function(store) {
            let userRecord
            // The first inserted user is the peer's user object.
            peer.logger.info(`${this.name()} querying for identity`)
            return store.findAll('user', {where: {me: {'===': true}}})
            .then((userRecords) => {
                if (userRecords.length) userRecord = userRecords[0]
                return userRecord
            })
            .then(peer.crypto.getOrCreateIdentity.bind(peer.crypto))
            .then(() => Promise.all([
                peer.crypto.exportPrivateKey(peer.crypto.keypair.privateKey),
                peer.crypto.exportPublicKey(peer.crypto.keypair.publicKey),
            ]))
            .then((keys) => {
                if (!userRecord) {
                    return store.create('user', {
                        id: peer.id,
                        username: 'Owner',
                        privateKey: keys[0],
                        publicKey: keys[1],
                        me: true,
                    })
                    .then((_userRecord) => {
                        return [store, _userRecord]
                    })
                }
                return [store, userRecord]
            })
        },
    }
}
