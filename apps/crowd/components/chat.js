'use strict'

let Request = require('high5/lib/request')


module.exports = (templates) => {
    let hooks
    let messages = []

    let Hooks = function() {
        h5.router.page('/messages/', {pushState: false}, (req) => {
            messages.push(req.params.message)
            if(h5.isHeadless) {
                let messageBody = '<b>' + req.params.message.nodeId.substring(0, 6) + '...</b>' + req.params.message.body
                notifier.notify({
                    title: 'High5 nodechat',
                    message: messageBody,
                    icon: h5.settings.projectDir + '/public/img/high5.png',
                })
            }
        })
    }

    return Ractive.extend({
        isolated: false,
        template: templates['crowd-chat'],
        oninit: () => {
            this.messages = []
            if(!hooks) {
                hooks = new Hooks(this)
            }
        },
        onrender: function() {
            let messagesSelector = document.querySelector('.nodechat .messages')
            this.on('messageHandler', (e) => {
                // Enter pressed.
                if(e.original.keyCode === 13 && e.node.value) {
                    let message = {nodeId: h5.network.currentNode.id, body: e.node.value}
                    messages.push(message)
                    // Scroll down on new message.
                    messagesSelector.scrollTop = messagesSelector.scrollHeight
                    e.node.value = null
                    // let the node find out how to route the request.
                    h5.network.currentNode.request(
                        new Request({url: '/messages/', params: {message: message}}), () => {
                        // Remove the node again by disconnecting the transport and
                        // // return the http response data.
                        // transport.disconnect()
                        // res.end(data)
                    })
                }
            })
        },
        onteardown: () => {

        },
        data: () => {
            return {
                messages: messages,
            }
        },
    })
}
