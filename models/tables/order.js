/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('order', {
        order_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_No: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        desc: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        have_pay: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        rel_discount: {
            type: Sequelize.DECIMAL(7, 2),
            allowNull: false,
            defaultValue: 1
        },
        abs_discount: {
            type: Sequelize.DECIMAL(7, 2),
            allowNull: false,
            defaultValue: 0
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        create_time: {
      			type: Sequelize.DATE,
      			defaultValue: Sequelize.NOW
        },
        last_update: {
      			type: Sequelize.DATE,
      			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'order',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: {
                    exclude: ['user_id']
                }
            },
            detail: {
                attributes: {
                    exclude: ['user_id']
                }
            }
        }
    })
}
