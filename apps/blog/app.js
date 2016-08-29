'use strict'

const Garage11App = require('../../lib/app')


class BlogApp extends Garage11App {

    constructor(...args) {
        super(...args)
        this.storage = require('./storage')
        this.permissions = require('./permissions')
    }


    get name() {
        return `${this.peer.name} [app-blog]`
    }


    init() {
        this.routes()
    }


    events() {
        const mapper = this.peer.network.currentNode.store.getMapper('blog')
        mapper.off('afterCreate')
        mapper.off('afterDestroy')
        mapper.off('afterUpdate')
        mapper.on('afterCreate', this.updateContext.bind(this))
        mapper.on('afterDestroy', this.updateContext.bind(this))
        mapper.on('afterUpdate', this.updateContext.bind(this))

        this.peer.on('starting', () => {
            this.peer.network.on('setCurrentNode', node => {
                this.setContext()
            })
        })
    }


    routes() {
        this.peer.router.route('/', {pushState: true}, (req, res) => {
            this.events()
            this.updateContext(res)
        })
    }


    updateContext(res) {
        const store = this.peer.network.currentNode.store
        return store.findAll('blog', {orderBy: [['created', 'DESC']]}, {with: ['user']})
        .then((posts) => {
            let html = this.peer.vdom.set('blog-list', {posts: posts})
            if (typeof res === 'function') {
                res(html)
            }
        })
    }
}


module.exports = BlogApp
