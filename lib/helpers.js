'use strict'

module.exports = (helpers) => {

    helpers.formatTime = (timestamp) => {
        let date = new Date(timestamp)
        return date.toLocaleString()
    }

    helpers.unbind = function(name) {
        return name
    }

    helpers.isOwnId = function(id) {
        return lib11.peers.default.id === id
    }
}
