const Sequelize = require('sequelize')

module.exports = {
    mysql: {
        host: '121.43.61.192',
        port: 3306,
        dialect: 'mysql',
        timezone: 'Asia/Shanghai',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    },
    redis: {
        host: '121.43.61.192',
        port: 6379,
        password: 'ssb_redis'
    }
}
