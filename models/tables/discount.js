/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('discount', {
        discount_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        abs_value: {
            type: Sequelize.DECIMAL(10, 2),
        },
        rel_value: {
            type: Sequelize.DECIMAL(10, 2),
        },
        last_update: {
      			type: Sequelize.DATE,
      			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'discount',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            show: { attributes: []}
        }
    })
}
