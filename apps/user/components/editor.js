'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['user-editor'],
        oninit: function() {
            this.on({
              saveUser: (e) => {
                  let cleanedData = h5.vdom.validation.isValid(e.node.form)
                  if(cleanedData) {
                      if (e.context.id) {
                          return h5.node.store.definitions.users.update(e.context.id, cleanedData)
                      } else {
                          h5.node.store.definitions.users.create(cleanedData)
                      }
                  }
              },
              openEditor: (e) => {
                  if (e.context.id) {
                      // Instances with an existing article.
                      document.querySelector(`#edit-user-dialog-${e.context.id}`).showModal()
                  } else {
                      document.querySelector('#edit-user-dialog').showModal()
                  }

              },
              closeEditor: (e) => {
                  if (e.context.id) {
                      // Instances with an existing article.
                      document.querySelector(`#edit-user-dialog-${e.context.id}`).close()
                  } else {
                      document.querySelector('#edit-user-dialog').close()
                  }
              },
            })
        },
        data: {},
    })
}
