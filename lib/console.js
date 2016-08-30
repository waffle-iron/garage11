'use strict'

/**
 * Helper functions to manage a headless node with.
 */
class Console {

    constructor(peer) {
        this.peer = peer
        this.store = peer.store
    }

    users() {

    }

    assignPermissions(nodeId) {
        this.peer.apps.get('settings').lib.allPermissions(this.peer.store, nodeId)
    }

}


module.exports = Console
