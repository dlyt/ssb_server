/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('bigMatchSerie', {
        bigMatchSerie_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
		type: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
		is_tour: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
		tour_image: {
            type: Sequelize.STRING(50)
        },
		image_url: {
            type: Sequelize.STRING(255)
        },
		intro_image_url: {
            type: Sequelize.STRING(255)
        },
		intro_title: {
            type: Sequelize.STRING(50)
        },
		intro_content: {
            type: Sequelize.TEXT
        },
		hot_level: {
            type: Sequelize.INTEGER,
			allowNull: false
        },
		need_show: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
		start_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
		end_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
		cooperated: {
            type: Sequelize.INTEGER,
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
        tableName: 'bigMatchSerie',
        freezeTableName: true,
        timestamps: false,
        scopes: {
            show: {
                where: {need_show: 1}
            },
            intro: {
                attributes: ['bigMatchSerie_id', 'name', 'type', 'image_url', 'start_date', 'end_date', 'last_update']
            },
            detail: {
                attributes: {
                    exclude: ['need_show', 'secret_key']
                }
            }
        }
    })
}
