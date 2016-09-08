/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('casinoVip', {
        casinoVip_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        vip_No: {
            type: Sequelize.STRING(50)
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'casinoVip',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            show: { attributes: ['vip_No']}
        }
    })
}
