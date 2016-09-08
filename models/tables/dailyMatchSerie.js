/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('dailyMatchSerie', {
        dailyMatchSerie_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
		hot_level: {
            type: Sequelize.INTEGER,
			allowNull: false
        },
		need_show: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        last_update: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'dailyMatchSerie',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            show: {
                where: {need_show: 1}
            },
            intro: {
                attributes: {
                    exclude: ['need_show', 'secret_key']
                }
            },
            detail: {
                attributes: {
                    exclude: ['need_show', 'secret_key']
                }
            }
        }
    })
}
