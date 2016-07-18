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
        return h5.id === id
    }

    helpers.hasPermission = function() {
        let currentNode = _this.peer.network.currentNode
        this.get('permission_trigger')
        if (currentNode.id === _this.peer.id) {
            console.log("PERMISSION")
            t
            //this.set('permission_trigger', true)
            return true
        }
        return false
            // //
            //
            // // Own node; super-powers here.

            //this.set('permission_trigger', false)
            //console.log("NO PERMISSION")
            // return false
            // return this.get( 'permissions' )
    }
}
