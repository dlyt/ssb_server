/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('globalSetting', {
        globalSetting_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        int: {
            type: Sequelize.INTEGER,
            defaultValue: null
        },
		double: {
            type: Sequelize.DOUBLE,
            defaultValue: null
        },
		text: {
            type: Sequelize.TEXT,
            defaultValue: null
        },
        date: {
            type: Sequelize.DATE,
            defaultValue: null
        }
    }, {
        tableName: 'globalSetting',
        freezeTableName: true,
        timestamps: false
    })
}
