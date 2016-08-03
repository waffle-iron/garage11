'use strict'

module.exports = (peer, templates) => {
    return Ractive.extend({
        template: templates['blog-post'],
        oninit: function() {
            this.on({
                closeDeletePostModal: (e) => {
                    document.querySelector(`#delete-dialog-${e.context.id}`).close()
                },
                openDeletePostModal: (e) => {
                    document.querySelector(`#delete-dialog-${e.context.id}`).showModal()
                },
                openEditPostModal: (e) => {
                    document.querySelector(`#edit-post-dialog-${e.context.id}`).showModal()
                },
                deleteBlogPost: function(e) {
                    peer.network.currentNode.store.destroy('blog', e.context.id)
                    peer.notifier.notify('Blogpost deleted')
                },
            })
        },
        data: {
            parseMarkdown: (text) => {
                return markdown.toHTML(text)
            },
            isAuthor: function(post) {
                if (post.user.id === peer.id) {
                    return true
                }
                return false
            }
        }
    })
}
