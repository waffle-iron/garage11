'use strict'

module.exports = (templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['vdom-main'],
        oninit: () => {

        },
        onrender: function() {

        },
        data: () => {

        },
    })
}
