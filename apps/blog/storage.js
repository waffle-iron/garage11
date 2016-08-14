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
                        created: {
                            type: 'number',
                            default: new Date().getTime(),
                        },
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
        // Initialize basic set of permissions.
        return store.findAll('permission')
        .then((permissions) => {
            if (!permissions.length) {
                // First create the permissions.
                return store.createMany('permission', [
                    {record: 'blog', action: 'create'},
                    {record: 'blog', action: 'read'},
                    {record: 'blog', action: 'update_own'},
                    {record: 'blog', action: 'delete_other'},
                    {record: 'blog', action: 'delete_own'},
                    {record: 'blog', action: 'delete_other'},
                ])
            }
        })
    },
    // The data and mappers of the settings app are loaded first.
    dependsOn: [
        'settings',
    ]
}
