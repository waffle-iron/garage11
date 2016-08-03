'use strict'


module.exports = (peer) => {
    this.name = () => `${peer.name} [app-blog]`
    this.storage = require('./storage')

    this.setContext = (res) => {
        return peer.network.currentNode.store.findAll('blog', {orderBy: [['created', 'DESC']]}, {with: ['user']})
        .then((posts) => {
            console.log(posts)
            let html = peer.vdom.set('blog-list', {posts: posts})
            if (typeof res === 'function') {
                res(html)
            }
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
        this.setContext(res)
    })

    return this
}
