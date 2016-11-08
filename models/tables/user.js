/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('user', {
        user_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user: {
            type: Sequelize.STRING(30)
        },
        password: {
            type: Sequelize.STRING(50)
        },
        realName: {
            type: Sequelize.STRING(20)
        },
        rickName: {
            type: Sequelize.STRING(20)
        },
        idCard: {
            type: Sequelize.STRING(30)
        },
        passportID: {
            type: Sequelize.STRING(30)
        },
        oneWayPermit: {
            type: Sequelize.STRING(30)
        },
        wechat_unionid: {
            type: Sequelize.STRING(128)
        },
        userPoint: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        user_spell: {
            type: Sequelize.STRING(50)
        },
        mobile: {
            type: Sequelize.STRING(20)
        },
        last_update: {
			      type: Sequelize.DATE,
    			  defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'user',
        freezeTableName: true,
        timestamps: false
    })
}
