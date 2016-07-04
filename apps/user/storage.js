'use strict'

module.exports = {
    mappers: function(store) {
        if (!store.getMapperByName('user')) {
            store.defineMapper('user', {
                schema: {
                    properties: {
                        node_id: { type: 'string' },
                        username: {type: 'string'},
                        privateKey: {type: 'string'},
                        publicKey: {type: 'string'},
                        me: {type: 'boolean'},
                    },
                },
                relations: {
                    hasMany: {
                        blog: {
                            localField: 'blogs',
                            foreignKey: 'user_id',
                        },
                    },
                },
            })
        }

        if (!store.getMapperByName('permission')) {
            store.defineMapper('permission', {
                schema: {
                    properties: {
                        record: {type: 'string'},
                        action: {type: 'string'},
                    },
                },
                relations: {
                    hasMany: {
                        blog: {
                            localField: 'blogs',
                            foreignKey: 'user_id',
                        },
                    },
                },
            })
        }
    },
    data: function(store) {
        if(store.isLocal) {
            // Initialize basic set of permissions.
            // store.getMapper('permission').create({record: 'blog', 'create'})
            // store.getMapper('permission').create({record: 'blog', 'create'})
        }
    },
}
