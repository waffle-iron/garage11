'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        isolated: false,
        template: templates['blog-editor'],
        oninit: function() {
            this.on({
                saveArticle: (e) => {
                    let blogMapper = peer.network.currentNode.store.getMapper('blog')
                    let userMapper = peer.network.currentNode.store.getMapper('user')
                    let cleanedData = peer.vdom.validation.isValid(e.node.form)
                    if(cleanedData) {
                        cleanedData.created = new Date().getTime()
                        if (e.context.id) {
                            return blogMapper.update(e.context.id, cleanedData)
                        } else {
                            userMapper.findAll()
                            .then((users) => {
                                cleanedData.user_id = users[0].id
                                blogMapper.create(cleanedData)
                            })
                        }
                    }
                },
                openEditor: (e) => {
                    if (e.context.id)
                        // Instances with an existing article.
                        document.querySelector(`#edit-post-dialog-${e.context.id}`).showModal()
                    else
                        document.querySelector('#edit-post-dialog').showModal()


                },
                closeEditor: (e) => {
                    if (e.context.id)
                        // Instances with an existing article.
                        document.querySelector(`#edit-post-dialog-${e.context.id}`).close()
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
