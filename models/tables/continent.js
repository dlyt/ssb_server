/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('continent', {
        continent_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'continent',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: []
            },
            detail: {
                attributes: ['name']
            }
        }
    })
}
