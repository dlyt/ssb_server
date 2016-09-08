/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('casinoImage', {
        casinoImage_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        url: {
            type: Sequelize.STRING(255),
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
        tableName: 'casinoImage',
        freezeTableName: true,
        timestamps: false
    })
}
