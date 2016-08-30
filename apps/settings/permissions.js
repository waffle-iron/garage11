'use strict'

module.exports = {
    user: {
        findAll: (store, data, node) => {
            return new Promise((resolve, reject) => {
                resolve(data)
            })
        },
        create: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'user', action: 'create'}})
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
        update: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'user', action: 'update'}})
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
                store.findAll('permission', {where: {record: 'user', action: 'delete'}})
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
    },
    permission: {
        findAll: (store, data, node) => {
            return new Promise((resolve, reject) => {
                resolve(data)
            })
        },
        create: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'permission', action: 'create'}})
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
        update: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'permission', action: 'update'}})
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
                store.findAll('permission', {where: {record: 'permission', action: 'delete'}})
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
    },
    user_permission: {
        findAll: (store, data, node) => {
            return new Promise((resolve, reject) => {
                resolve(data)
            })
        },
        create: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'user_permission', action: 'create'}})
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
        update: (store, data, node) => {
            store.findAll('permission', {where: {record: 'user_permission', action: 'update'}})
            .then((permission) => {
                store.findAll('user_permission', {
                    where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                })
                .then((userPermissions) => {
                    if (userPermissions.length) resolve(data)
                    else reject(data)
                })
            })
        },
        destroy: (store, data, node) => {
            store.findAll('permission', {where: {record: 'user_permission', action: 'delete'}})
            .then((permission) => {
                store.findAll('user_permission', {
                    where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                })
                .then((userPermissions) => {
                    if (userPermissions.length) resolve(data)
                    else reject(data)
                })
            })
        },
    },
    settings: {
        findAll: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'settings', action: 'read'}})
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
        create: (store, data, node) => {
            return new Promise((resolve, reject) => {
                store.findAll('permission', {where: {record: 'settings', action: 'create'}})
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
        update: (store, data, node) => {
            store.findAll('permission', {where: {record: 'settings', action: 'update'}})
            .then((permission) => {
                store.findAll('user_permission', {
                    where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                })
                .then((userPermissions) => {
                    if (userPermissions.length) resolve(data)
                    else reject(data)
                })
            })
        },
        destroy: (store, data, node) => {
            store.findAll('permission', {where: {record: 'settings', action: 'delete'}})
            .then((permission) => {
                store.findAll('user_permission', {
                    where: {user_id: {'==': node.id}, permission_id: {'==' : permission[0].id}}
                })
                .then((userPermissions) => {
                    if (userPermissions.length) resolve(data)
                    else reject(data)
                })
            })
        },
    }
}
