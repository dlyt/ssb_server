/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('userPoint', {
        userPoint_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        add_point: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'userPoint',
        freezeTableName: true,
        timestamps: false
    })
}
