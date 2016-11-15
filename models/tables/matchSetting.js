/*
 *
 */
const Sequelize = require('sequelize')

module.exports = (db) => {
    return db.define('matchSetting', {
        matchSetting_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        blindTime: {
            type: Sequelize.INTEGER,
        },
        chip: {
            type: Sequelize.INTEGER,
        },
        organization_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        structure: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        bonuses: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        setting: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        remark: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        last_update: {
      			type: Sequelize.DATE,
      			defaultValue: Sequelize.NOW
        }
    }, {
        tableName: 'matchSetting',
        freezeTableName: true,
        timestamps: false,
        scopes: {
          list: {
                attributes: ['matchSetting_id', 'name']
          },
          detail: {
                attributes: ['blindTime', 'chip', 'bonuses', 'setting', 'remark']
          },
        }
    })
}
