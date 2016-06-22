'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['blog-editor'],
        oninit: function() {
            this.on({
                saveArticle: (e) => {
                    let cleanedData = peer.vdom.validation.isValid(e.node.form)
                    if(cleanedData) {
                        cleanedData.created = new Date().getTime()
                        if (e.context._id) return peer.network.currentNode.store.getMapper('blog').update(e.context._id, cleanedData)
                        else
                            peer.node.store.getMapper('user').findAll()
                            .then((users) => {
                                cleanedData.userId = users[0]._id
                                peer.network.currentNode.store.getMapper('blog').create(cleanedData)
                            })
                    }
                },
                openEditor: (e) => {
                    if (e.context._id)
                        // Instances with an existing article.
                        document.querySelector(`#edit-post-dialog-${e.context._id}`).showModal()
                    else
                        document.querySelector('#edit-post-dialog').showModal()


                },
                closeEditor: (e) => {
                    if (e.context._id)
                        // Instances with an existing article.
                        document.querySelector(`#edit-post-dialog-${e.context._id}`).close()
                    else
                        document.querySelector('#edit-post-dialog').close()

                },
            })
        },
        data: {
            getTitle: function(title) {
                return title
            },
            getContent: function(content) {
                return content
            },
        },
    })
}
