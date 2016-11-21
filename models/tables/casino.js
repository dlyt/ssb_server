/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('casino', {
        casino_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        casino: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        open_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        close_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        contact_phone: {
            type: Sequelize.STRING(30)
        },
        contact_person: {
            type: Sequelize.STRING(30)
        },
        logo_url: {
            type: Sequelize.STRING(255)
        },
        web_url: {
            type: Sequelize.STRING(255)
        },
        intorduction: {
            type: Sequelize.TEXT
        },
        isTempClub: {
            type: Sequelize.INTEGER,
        },
        cooperated: {
            type: Sequelize.INTEGER,
        },
        last_update: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'casino',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            intro: {
                attributes: {
                    exclude: ['contact_person']
                }
            },
            detail: {
                attributes: {
                    exclude: ['contact_person']
                }
            },
            club: {
                attributes: ['isTempClub']
            },
        }
    })
}
