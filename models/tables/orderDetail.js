/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('orderDetail', {
        orderDetail_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        have_createSerial: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'orderDetail',
        freezeTableName: true,
        timestamps: false
    })
}
