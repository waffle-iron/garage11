'use strict'


/**
 * Native browser notifier.
 */
class Notifier {

    constructor(peer) {
        // Let's check if the browser supports notifications
        if (!peer.isBrowser) {
            return
        }
    }


    formatNotification(message) {
        return new Notification(message, {
            icon: '/public/img/logo.png',
        })
    }


    /**
     * First check if the notification facility is in place,
     * then send the notification and hide it again after `timeout` ms.
     */
    notify(message, timeout = 3000) {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification')
        } else if (Notification.permission === 'granted') {
            let notification = this.formatNotification(message)
            setTimeout(() => notification.close(), timeout)
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
                // If the user accepts, let's create a notification
                if (permission === 'granted') {
                    let notification = this.formatNotification(message)
                    setTimeout(() => notification.close(), timeout)
                }
            });
        }
    }
}

module.exports = Notifier
