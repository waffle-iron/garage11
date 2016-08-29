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
         * Only authors of a blog may update a blog.
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
        destroy: (store, data, node) => {
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
    }
}
