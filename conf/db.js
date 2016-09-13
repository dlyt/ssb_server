const Sequelize = require('sequelize')

module.exports = {
    mysql: {
        host: '121.43.61.192',
        port: 3306,
        dialect: 'mysql',
        timezone: 'Asia/Shanghai',  /* 时区 */
        logging: false,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        /* 事务隔离级别为最高 */
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    },
    redis: {
        host: '121.43.61.192',
        port: 6379,
        password: 'ssb_redis'
    }
}
