/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('city', {
        city_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        city: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        },
        city_en: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'city',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: ['city_id', 'city', 'city_en']
            },
            detail: {
                attributes: ['city_id', 'city', 'city_en']
            }
        }
    })
}
