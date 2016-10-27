/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('feedback', {
        feedback_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
        },
        title: {
            type: Sequelize.STRING(255)
        },
        content: {
            type: Sequelize.TEXT
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'feedback',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            detail: {
                attributes: {
                    exclude: ['last_update']
                }
            }
        }
    })
}
