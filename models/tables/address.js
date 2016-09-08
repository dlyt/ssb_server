/*
 * 存放订单
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('address', {
        address_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        address: {
            type: Sequelize.STRING(60),
            allowNull: false
        },
        longitude: {
            type: Sequelize.DECIMAL(10, 7)
        },
        latitude: {
            type: Sequelize.DECIMAL(10, 7)
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'address',
        freezeTableName: true,
        timestamps: false
    })
}
