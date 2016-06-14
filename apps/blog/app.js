'use strict'

module.exports = (peer) => {
    this.setStore = function(store) {
        this.store = store
        if (!this.store.getMapperByName('blog')) {
            this.store.defineMapper('blog', {
                schema: {
                    properties: {
                      _id: { type: 'number' },
                      name: { type: 'string' },
                  },
                },
                relations: {
                    belongsTo: {
                        user: {
                            localField: 'user',
                            localKey: 'userId',
                        },
                    },
                },
            })
        }
    }

    this.pageActive = () => {
        // this.store.getMapper('blog').off('DS.change')
        this.store.getMapper('blog').on('DS.change', () => {
            peer.vdom.set('blog-list', {blogs: this.store.getMapper('blog').getAll()})
        })
    }

    peer.router.route('/', {pushState: true}, (req, res) => {
        this.pageActive()
        this.store.getMapper('blog').findAll({}, {bypassCache: true})
        .then((blogs) => {
            //this.store.getMapper('blog').loadRelations(blog, 'user')
            peer.vdom.set('blog-list', {blogs: blogs}).then((html) => {
                res(html)
            })
        })
    })

    return this
}
