/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('payment', {
        orderPayment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        payment_No: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        certificate: {
            type: Sequelize.STRING(50)
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        state: {
            type: Sequelize.INTEGER,
	          allowNull: false
        },
        trade_state: {
            type: Sequelize.STRING(50)
        },
        trade_state_desc: {
            type: Sequelize.STRING(255)
        },
        pay_type: {
            type: Sequelize.INTEGER,
			allowNull: false
        },
        pay_datetime: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        last_update: {
      			type: Sequelize.DATE,
      			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'payment',
        freezeTableName: true,
        timestamps: false
    })
}
