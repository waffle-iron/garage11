'use strict'

class BaseUserRecord extends JSData.Record {
    get permissions() {
        const mapper = this._mapper()
        const userPermissions = mapper.datastore.getAll('user_permission', this.id, {index: 'user_id'})
        return userPermissions.map((userPermission) => {
            return userPermission.permission;
        }).filter((permission) => permission);
    }
}


class BasePermissionRecord extends JSData.Record {
    get users() {
        const mapper = this._mapper();
        const userPermissions = mapper.datastore.getAll('user_permission', this.id, {index: 'permission_id'});
        return userPermissions.map((userPermission) => {
            return userPermission.user;
        }).filter((user) => user);
    }
}


module.exports = {
    mappers: function(store) {
        if (!store.getMapperByName('user')) {
            store.defineMapper('user', {
                recordClass: class UserRecord extends BaseUserRecord {},
                schema: {
                    properties: {
                        id: {type: 'string'},
                        created: {
                            type: 'number',
                            default: new Date().getTime(),
                        },
                        username: {type: 'string'},
                        privateKey: {type: 'string'},
                        publicKey: {type: 'string'},
                    },
                },
                relations: {
                    hasMany: {
                        blog: {
                            foreignKey: 'user_id',
                            localField: 'blogs',
                        },
                        user_permission: {
                            foreignKey: 'user_id',
                            localField: 'user_permissions',
                        },
                    },
                },
            })
        }

        if (!store.getMapperByName('permission')) {
            store.defineMapper('permission', {
                recordClass: class PermissionRecord extends BasePermissionRecord {},
                schema: {
                    properties: {
                        id: {type: 'string'},
                        record: {type: 'string'},
                        action: {type: 'string'},
                    },
                },
                relations: {
                    hasMany: {
                        user_permission: {
                            foreignKey: 'permission_id',
                            localField: 'user_permissions',
                        },
                    },
                },
            })
        }

        // Binding users and permissions together.
        if (!store.getMapperByName('user_permission')) {
            store.defineMapper('user_permission', {
                schema: {
                    properties: {
                        id: {type: 'string'},
                    },
                },
                relations: {
                    belongsTo: {
                        permission: {
                            foreignKey: 'permission_id',
                            localField: 'permission',
                        },
                        user: {
                            foreignKey: 'user_id',
                            localField: 'user',
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
                    {record: 'user', action: 'create'},
                    {record: 'user', action: 'read'},
                    {record: 'user', action: 'update_own'},
                    {record: 'user', action: 'update_other'},
                    {record: 'user', action: 'delete_own'},
                    {record: 'user', action: 'delete_other'},
                ])
            }
        })
    },
}
