/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('versionManager', {
        versionManager_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        version: {
            type: Sequelize.STRING(10)
        },
        remark: {
            type: Sequelize.STRING(255)
        },
        last_update: {
			      type: Sequelize.DATE,
    			  defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'versionManager',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            info: {
                attributes: ['version', 'remark']
            },
        }
    })
}
