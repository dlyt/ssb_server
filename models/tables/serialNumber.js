/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('serialNumber', {
        serialNumber_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bigMatchSerie_id: {
            type: Sequelize.INTEGER,
        },
        dailyMatchSerie_id: {
            type: Sequelize.INTEGER,
        },
		    have_used: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
		    used_time: {
            type: Sequelize.DATE
        },
		    valid: {
            type: Sequelize.BOOLEAN,
			      allowNull: false
        },
        create_time: {
            type: Sequelize.DATE,
            allowNull: false
        },
        expire_time: {
            type: Sequelize.DATE
        },
        seria_No: {
            type: Sequelize.STRING(50)
        },
        desc: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        last_update: {
			      type: Sequelize.DATE,
			      defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'serialNumber',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: {
                    exclude: ['user_id', 'last_update']
                }
            },
            detail: {
                attributes: {
                    exclude: ['user_id', 'last_update']
                }
            }
        }
    })
}
