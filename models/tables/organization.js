/*
 * 存放订单
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('organization', {
        organization_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'organization',
        freezeTableName: true,
        timestamps: false
    })
}
