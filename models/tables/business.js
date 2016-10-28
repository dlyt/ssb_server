/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('business', {
        business_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        organization_id: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING(45),
        },
        account: {
            type: Sequelize.STRING(45)
        },
        password: {
            type: Sequelize.STRING(255)
        },
        role: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        create_time: {
			    type: Sequelize.DATE,
    			defaultValue: Sequelize.NOW
        },
        last_update: {
			    type: Sequelize.DATE,
    			defaultValue: Sequelize.NOW
        },
    }, {
        tableName: 'business',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: {
                    exclude: ['last_update']
                }
            },
            detail: {
                attributes: {
                    exclude: ['create_time', 'last_update']
                }
            }
        }
    })
}
