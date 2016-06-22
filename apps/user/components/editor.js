'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['user-editor'],
        oninit: function() {
            this.on({
              saveUser: (e) => {
                  let cleanedData = peer.vdom.validation.isValid(e.node.form)
                  if(cleanedData) {
                      if (e.context._id) {
                          return peer.node.store.getMapper('user').update(e.context._id, cleanedData)
                      } else {
                          peer.node.store.getMapper('user').create(cleanedData)
                      }
                  }
              },
              openEditor: (e) => {
                  if (e.context._id) {
                      // Instances with an existing article.
                      document.querySelector(`#edit-user-dialog-${e.context._id}`).showModal()
                  } else {
                      document.querySelector('#edit-user-dialog').showModal()
                  }

              },
              closeEditor: (e) => {
                  if (e.context._id) {
                      // Instances with an existing article.
                      document.querySelector(`#edit-user-dialog-${e.context._id}`).close()
                  } else {
                      document.querySelector('#edit-user-dialog').close()
                  }
              },
            })
        },
        data: {},
    })
}
