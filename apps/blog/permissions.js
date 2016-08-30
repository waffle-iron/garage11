'use strict'

module.exports = {
    blog: {
        /**
         * All nodes may read all blog posts.
         */
        findAll: (store, data, node) => {
            return new Promise((resolve) => {
                resolve(data)
            })
        },
        /**
         * Only nodes with a user that have a blog create permission
         * may create a new blog.
         */
        create: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'blog', action: 'create'}})
                .then((permission) => {
                    store.findAll('user_permission', {
                        where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                    })
                    .then((userPermissions) => {
                        if (userPermissions.length) resolve(data)
                        else reject(data)
                    })
                })
            })
        },
        /**
         * Only nodes with a user that have a blog update permission
         * may update a blog article.
         */
        update: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'blog', action: 'update'}})
                .then((permission) => {
                    store.findAll('user_permission', {
                        where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                    })
                    .then((userPermissions) => {
                        if (userPermissions.length) resolve(data)
                        else reject(data)
                    })
                })
            })
        },
        /**
         * Only nodes with a user that have a blog delete permission
         * may update a blog article.
         */
        destroy: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'blog', action: 'delete'}})
                .then((permission) => {
                    store.findAll('user_permission', {
                        where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                    })
                    .then((userPermissions) => {
                        if (userPermissions.length) resolve(data)
                        else reject(data)
                    })
                })
            })
        },
    }
}
