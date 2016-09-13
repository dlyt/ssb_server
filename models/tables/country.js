/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('country', {
        country_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        country: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        },
        continent: {
            type: Sequelize.STRING(30),
            allowNull: false
        },
        image_url: {
            type: Sequelize.STRING(255)
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'country',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: ['country_id', 'country', 'continent']
            },
            detail: {
                attributes: ['country_id', 'country', 'continent', 'image_url']
            }
        }
    })
}
