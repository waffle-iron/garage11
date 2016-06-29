'use strict'

module.exports = (peer) => {
    this.setStore = function(store) {
        this.store = store
        if (!this.store.getMapperByName('blog'))
            this.store.defineMapper('blog', {
                name: 'blog',
                schema: {
                    properties: {
                        id: { type: 'string' },
                        user_id: {type: 'string', indexed: true},
                        title: {type: 'string'},
                        content: {type: 'string'},
                        created: {type: 'number'},
                  },
                },
                relations: {
                    belongsTo: {
                        user: {
                            localField: 'author',
                            foreignKey: 'user_id',
                        },
                    },
                },
            })
    }

    this.updateList = () => {
        this.store.getMapper('blog').findAll()
        .then((blogs) => {
            peer.vdom.set('blog-list', {blogs: blogs})
        })
    }

    this.pageActive = () => {
        this.store.getMapper('blog').off('afterCreate')
        this.store.getMapper('blog').off('afterDestroy')
        this.store.getMapper('blog').off('afterUpdate')
        this.store.getMapper('blog').on('afterCreate', this.updateList)
        this.store.getMapper('blog').on('afterDestroy', this.updateList)
        this.store.getMapper('blog').on('afterUpdate', this.updateList)
    }



    peer.router.route('/', {pushState: true}, (req, res) => {
        this.pageActive()

        this.store.getMapper('blog').findAll({}, {})
        .then((blogs) => {
            res(peer.vdom.set('blog-list', {blogs: blogs}))
        })
    })

    return this
}
