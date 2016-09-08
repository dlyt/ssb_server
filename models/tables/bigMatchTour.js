/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('bigMatchTour', {
        bigMatchTour_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'bigMatchTour',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: ['bigMatchTour_id', 'name', 'last_update']
            },
            detail: {
                attributes: ['bigMatchTour_id', 'name', 'last_update']
            }
        }
    })
}
