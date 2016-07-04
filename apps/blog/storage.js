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
            let permissionMapper = store.getMapper('permission')
            // Initialize basic set of permissions.
            permissionMapper.findAll({})
            .then((permissions) => {
                if(!permissions.length) {
                    permissionMapper.create({record: 'blog', action: 'create'})
                    permissionMapper.create({record: 'blog', action: 'delete_own'})
                    permissionMapper.create({record: 'blog', action: 'update_own'})
                    permissionMapper.create({record: 'blog', action: 'read_own'})
                }
            })

        }
    },
}
