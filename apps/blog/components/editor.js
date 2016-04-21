'use strict'

module.exports = (templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['blog-editor'],
        oninit: function() {
            this.on({
                saveArticle: (e) => {
                    let cleanedData = h5.vdom.validation.isValid(e.node.form)
                    cleanedData.created = new Date().getTime()
                    if(cleanedData) {
                        if (e.context.id) {
                            return h5.node.store.definitions.blogs.update(e.context.id, cleanedData)
                            .then((article) => {

                            })
                        } else {
                            cleanedData.user = h5.node.store.definitions.users.getAll()[0]
                            h5.node.store.definitions.blogs.create(cleanedData)
                        }
                    }
                },
                openEditor: (e) => {
                    if (e.context.id) {
                        // Instances with an existing article.
                        document.querySelector(`#edit-post-dialog-${e.context.id}`).showModal()
                    } else {
                        document.querySelector('#edit-post-dialog').showModal()
                    }

                },
                closeEditor: (e) => {
                    if (e.context.id) {
                        // Instances with an existing article.
                        document.querySelector(`#edit-post-dialog-${e.context.id}`).close()
                    } else {
                        document.querySelector('#edit-post-dialog').close()
                    }
                },
            })
        },
        data: {
            getTitle: function(title) {
                return title
            },
            getBody: function(body) {
                return body
            }
        }
    })
}
