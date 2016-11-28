/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('bigMatchSerieShare', {
        bigMatchSerieShare_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bigMatchSerie_id: {
          type: Sequelize.INTEGER,
        },
        introContent: {
            type: Sequelize.TEXT
        },
    		tips: {
            type: Sequelize.TEXT
        },
    		matchImageUrl: {
            type: Sequelize.STRING(255)
        },
        last_update: {
      			type: Sequelize.DATE,
      			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'bigMatchSerieShare',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            show: {
                where: {need_show: 1}
            },
            intro: {
                attributes: []
            },
            detail: {
                attributes: {
                    exclude: ['last_update']
                }
            }
        }
    })
}
