/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('dailyMatch', {
        dailyMatch_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        matchSetting_id: {
            type: Sequelize.INTEGER,
        },
        match_day: {
            type: Sequelize.DATE,
            allowNull: false
        },
        start_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        close_reg_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        unit_price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        state: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        style: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        remark: {
            type: Sequelize.STRING(50)
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'dailyMatch',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: {
                    exclude: []
                }
            },
            detail: {
                attributes: {
                    exclude: []
                }
            }
        }
    })
}
