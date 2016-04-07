'use strict'

module.exports = (templates) => {
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
                    h5.collections.blogs.destroy(e.context.id)
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
