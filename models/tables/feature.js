/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('feature', {
        feature_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        feature: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'feature',
        freezeTableName: true,
        timestamps: false
    })
}
