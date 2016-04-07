'use strict'

module.exports = (h5) => {

    this.setStore = function(store) {
        store.defineResource('blogs', {
            relations: {
                belongsTo: {
                    user: {
                        localField: 'user',
                        foreignKey: 'id',
                    },
                },
            },
        })
    }

    this.pageActive = function() {
        h5.collections.blogs.off('DS.change')
        h5.collections.blogs.on('DS.change', () => {
            h5.vdom.set('blog-list', {blogs: h5.collections.blogs.getAll()})
        })

    }

    h5.router.page('/', {pushState: true}, (req, res) => {
        this.pageActive()
        h5.collections.blogs.findAll({}, {bypassCache: true})
        .then(function(blogs) {
            h5.vdom.set('blog-list', {blogs: blogs}).then((html) => {
                res(html)
            })
        })
    })

    return this
}
