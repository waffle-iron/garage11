'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        template: templates['blog-post'],
        oninit: function() {
            this.on({
                closeDeletePostModal: (e) => {
                    document.querySelector(`#delete-dialog-${e.context._id}`).close()
                },
                openDeletePostModal: (e) => {
                    document.querySelector(`#delete-dialog-${e.context._id}`).showModal()
                },
                openEditPostModal: (e) => {
                    document.querySelector(`#edit-post-dialog-${e.context._id}`).showModal()
                },
                deleteBlogPost: function(e) {
                    peer.network.currentNode.store.getMapper('blog').destroy(e.context._id)
                },
            })
        },
        data: {
            parseMarkdown: (text) => {
                return markdown.toHTML(text)
            },
        }
    })
}
