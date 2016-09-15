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
        mapper.on('afterCreate', this.updatefindAll.bind(this))
        mapper.on('afterDestroy', this.updatefindAll.bind(this))
        mapper.on('afterUpdate', this.updatefindAll.bind(this))
    }


    routes() {
        this.peer.router.route('/blog/', {pushState: true, default: true}, (req, res) => {
            this.events()
            this.updatefindAll(res)
            this.peer.network.on('setCurrentNode', node => {
                this.updatefindAll()
            })
        })

        this.peer.router.route('/blog/:slug', {pushState: true}, (req, res) => {
            this.events()
            this.updatefind(req.params.slug, res)

            this.peer.network.on('setCurrentNode', node => {
                this.updatefind(req.params.postid, res)
            })
        })
    }


    updatefind(slug, res) {
        const store = this.peer.network.currentNode.store
        return store.findAll('blog', {where: {'slug': {'==': slug}}}, {}, {with: ['user']})
        .then((posts) => {
            let html = this.peer.vdom.set('blog-list', {posts: posts, detail: true})
            if (typeof res === 'function') res(html)
        })
    }


    updatefindAll(res) {
        let currentPage = 1
        const PAGE_SIZE = 3
        const store = this.peer.network.currentNode.store
        return store.findAll('blog', {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (currentPage - 1),
            orderBy: [['created', 'DESC']],
        }, {with: ['user']})
        .then((posts) => {
            let html = this.peer.vdom.set('blog-list', {posts: posts, detail: false})
            if (typeof res === 'function') res(html)
        })
    }

    // PAGING
    // var PAGE_SIZE = 20;
    // var currentPage = 1;
    //
    // // Grab the first "page" of posts
    // Post.filter({
    //   offset: PAGE_SIZE * (currentPage - 1),
    //   limit: PAGE_SIZE
    // });
}


module.exports = BlogApp
