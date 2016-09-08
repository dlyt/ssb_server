/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('casinoFeature', {
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'casino_feature',
        freezeTableName: true,
        timestamps: false
    })
}
