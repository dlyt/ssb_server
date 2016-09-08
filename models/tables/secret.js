/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('secret', {
        secret_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: Sequelize.STRING(128),
            allowNull: false
        }
    }, {
        tableName: 'secret',
        freezeTableName: true,
        timestamps: false
    })
}
