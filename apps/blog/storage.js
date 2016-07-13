'use strict'

module.exports = {
    mappers: function(store) {
        if (!store.getMapperByName('blog')) {
            store.defineMapper('blog', {
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
                            localField: 'user',
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
            store.findAll('permission')
            .then((permissions) => {
                if(!permissions.length) {
                    // First create the permissions.
                    store.createMany('permission', [
                        {record: 'blog', action: 'create'},
                        {record: 'blog', action: 'read'},
                        {record: 'blog', action: 'update'},
                        {record: 'blog', action: 'delete'},
                        {record: 'user', action: 'create'},
                        {record: 'user', action: 'read'},
                        {record: 'user', action: 'update'},
                        {record: 'user', action: 'delete'},
                    ])
                    .then((permissionRecords) => {
                        // Then use user_permissions to m2m bind permissions
                        // to the default user.
                        store.findAll('user', {where: {node_id: h5.peers.default.id}}, {with: ['user']})
                        .then((users) => {
                            let user = users[0]
                            Promise.all(permissionRecords.map((permission) => {
                                return store.create('user_permission', {
                                    user_id: user.id,
                                    permission_id: permission.id,
                                })
                            }))
                        })
                    })
                }
            })

        }
    },
}
