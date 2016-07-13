'use strict'


module.exports = (peer) => {
    this.name = () => `${peer.name} [app-blog]`
    this.storage = require('./storage')

    this.setContext = () => {
        return peer.network.currentNode.store.findAll('blog', {}, {with: ['user']})
        .then((blogs) => {
            peer.vdom.set('blog-list', {blogs: blogs})
            return blogs
        })
    }

    this.pageActive = () => {
        let blogMapper = peer.network.currentNode.store.getMapper('blog')
        blogMapper.off('afterCreate')
        blogMapper.off('afterDestroy')
        blogMapper.off('afterUpdate')
        blogMapper.on('afterCreate', this.setContext)
        blogMapper.on('afterDestroy', this.setContext)
        blogMapper.on('afterUpdate', this.setContext)
    }


    peer.router.route('/', {pushState: true}, (req, res) => {
        this.pageActive()
        this.setContext()
        .then((blogs) => {
            res(peer.vdom.set('blog-list', {blogs: blogs}))
        })
    })

    return this
}
