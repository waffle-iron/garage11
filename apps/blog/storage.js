'use strict'

module.exports = {
    mappers: function(store) {
        if (!store.getMapperByName('blog')) {
            store.defineMapper('blog', {
                schema: {
                    properties: {
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
                        {record: 'blog', action: 'update_own'},
                        {record: 'blog', action: 'delete_other'},
                        {record: 'blog', action: 'delete_own'},
                        {record: 'blog', action: 'delete_other'},
                        {record: 'user', action: 'create'},
                        {record: 'user', action: 'read'},
                        {record: 'user', action: 'update_own'},
                        {record: 'user', action: 'update_other'},
                        {record: 'user', action: 'delete_own'},
                        {record: 'user', action: 'delete_other'},
                    ])
                    .then((permissionRecords) => {
                        // Then use user_permissions to m2m bind permissions
                        // to the default user.
                        store.findAll('user', {})
                        .then((userRecords) => {
                            let userRecord = userRecords[0]
                            Promise.all(permissionRecords.map((permission) => {
                                return store.create('user_permission', {
                                    user_id: userRecord.id,
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
