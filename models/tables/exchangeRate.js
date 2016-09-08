/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('exchangeRate', {
        exchangeRate_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        currency_name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
		exchange_rate: {
            type: Sequelize.DECIMAL(7, 3),
            allowNull: false
        },
        currency_code: {
            type: Sequelize.STRING(50)
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'exchangeRate',
        freezeTableName: true,
        timestamps: false
    })
}
