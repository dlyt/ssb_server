/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('matchSetting', {
        matchSetting_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        structure: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        bonus: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'matchSetting',
        freezeTableName: true,
        timestamps: false
    })
}
