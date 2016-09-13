'use strict'

const Sequelize = require('sequelize')

const db = new Sequelize('saishibao', 'ssb_admin', '123465', Conf.db.mysql)

/* 导入表格 */
const t = require('./tables')(db)

t.Country.hasMany(t.City, {foreignKey: 'country_id'})
t.City.belongsTo(t.Country, {foreignKey: 'country_id'})

t.City.hasMany(t.Address, {foreignKey: 'city_id'})
t.Address.belongsTo(t.City, {foreignKey: 'city_id'})

t.Casino.belongsTo(t.Address, {foreignKey: 'address_id'})
t.Address.hasOne(t.Casino, {foreignKey: 'address_id'})

t.Organization.belongsTo(t.Casino, {foreignKey: 'casino_id'})
t.Casino.hasOne(t.Organization, {foreignKey: 'casino_id'})

t.Casino.hasMany(t.CasinoImage, {foreignKey: 'casino_casino_id'})

t.Feature.belongsToMany(t.Casino, {through:t.CasinoFeature , foreignKey: 'feature_id'})
t.Casino.belongsToMany(t.Feature, {through:t.CasinoFeature , foreignKey: 'casino_id'})

t.BigMatchTour.hasMany(t.BigMatchSerie, {foreignKey: 'bigMatchTour_id'})
t.Organization.hasMany(t.BigMatchSerie, {foreignKey: 'organization_id'})
t.BigMatchSerie.belongsTo(t.Organization, {foreignKey: 'organization_id'})
t.Organization.hasMany(t.DailyMatchSerie, {foreignKey: 'organization_id'})
t.DailyMatchSerie.belongsTo(t.Organization, {foreignKey: 'organization_id'})

t.DailyMatchSerie.belongsTo(t.Secret, {foreignKey: 'secret_id'})
t.BigMatchSerie.belongsTo(t.Secret, {foreignKey: 'secret_id'})

t.BigMatchSerie.hasMany(t.BigMatch, {foreignKey: 'bigMatchSerie_id'})
t.BigMatch.belongsTo(t.BigMatchSerie, {foreignKey: 'bigMatchSerie_id'})
t.BigMatchSerie.hasMany(t.SerialNumber, {foreignKey: 'bigMatchSerie_id'})
t.BigMatch.belongsTo(t.ExchangeRate, {foreignKey: 'exchangeRate_id'})
t.BigMatch.hasOne(t.BigMatchResult, {foreignKey: 'bigMatch_id'})
t.BigMatch.belongsTo(t.MatchSetting, {foreignKey: 'matchSetting_id'})
t.BigMatch.hasMany(t.Order, {foreignKey: 'bigMatch_id'})

t.DailyMatchSerie.hasMany(t.DailyMatch, {foreignKey: 'dailyMatchSerie_id'})
t.DailyMatch.belongsTo(t.DailyMatchSerie, {foreignKey: 'dailyMatchSerie_id'})
t.DailyMatchSerie.hasMany(t.SerialNumber, {foreignKey: 'dailyMatchSerie_id'})
t.DailyMatch.hasOne(t.DailyMatchResult, {foreignKey: 'dailyMatch_id'})
t.DailyMatch.belongsTo(t.MatchSetting, {foreignKey: 'matchSetting_id'})
t.DailyMatch.hasMany(t.Order, {foreignKey: 'dailyMatch_id'})

t.Order.belongsTo(t.BigMatch, {foreignKey: 'bigMatch_id'})
t.Order.belongsTo(t.DailyMatch, {foreignKey: 'dailyMatch_id'})
t.Order.hasMany(t.Payment, {foreignKey: 'order_id'})
t.Order.hasMany(t.OrderDetail, {foreignKey: 'order_id'})
t.OrderDetail.belongsTo(t.Order, {foreignKey: 'order_id'})
t.Payment.belongsTo(t.Order, {foreignKey: 'order_id'})

t.SerialNumber.belongsTo(t.OrderDetail, {foreignKey: 'orderDetail_id'})
t.UserPoint.belongsTo(t.SerialNumber, {foreignKey: 'serialNumber_id'})

t.User.hasMany(t.Order, {foreignKey: 'user_id'})
t.User.hasMany(t.SerialNumber, {foreignKey: 'user_id'})
t.User.hasMany(t.UserPoint, {foreignKey: 'user_id'})

t.User.belongsToMany(t.Casino, {through:t.CasinoVip , foreignKey: 'user_id'})
t.Casino.belongsToMany(t.User, {through:t.CasinoVip , foreignKey: 'casino_id'})

/* 数据库鉴权 */
db.authenticate().then(function(err) {
    console.log('Connection has been established successfully.')
}).catch(function (err) {
    console.log('Unable to connect to the database:', err)
})

module.exports = {
    t: t,
    db: db
}
