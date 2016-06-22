'use strict'

module.exports = (peer) => {
    this.setStore = function(store) {
        this.store = store
        if (!this.store.getMapperByName('blog')) {
            this.store.defineMapper('blog', {
                schema: {
                    properties: {
                      title: { type: 'string' },
                      content: { type: 'string' },
                      created: { type: 'number' },
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

    this.updateList = () => {
        this.store.getMapper('blog').findAll()
        .then((blogs) => {
            peer.vdom.set('blog-list', {blogs: blogs})
        })
    }

    this.pageActive = () => {
        this.store.getMapper('blog').on('afterCreate', this.updateList)
        this.store.getMapper('blog').on('afterDestroy', this.updateList)
        this.store.getMapper('blog').on('afterUpdate', this.updateList)
    }



    peer.router.route('/', {pushState: true}, (req, res) => {
        this.pageActive()
        this.store.getMapper('blog').findAll({}, {bypassCache: true})
        .then((blogs) => {
            res(peer.vdom.set('blog-list', {blogs: blogs}))
        })
    })

    return this
}
