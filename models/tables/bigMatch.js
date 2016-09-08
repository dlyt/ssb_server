/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('bigMatch', {
        bigMatch_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
		real_buyin: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        rake_buyin: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        match_day: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        open_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        close_reg_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        can_register: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        unit_price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        need_exchange: {
            type: Sequelize.BOOLEAN,
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
        tableName: 'bigMatch',
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
