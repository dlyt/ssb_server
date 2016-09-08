module.exports = {
    log4js: {
        appenders: [{
            type: 'console'
        }, {
            type: 'dateFile',
            filename: 'logs/access.log',
            pattern: "-yyyy-MM-dd",

            maxLogSize: 1024,
            alwaysIncludePattern: false,

            backups: 4,
            category: 'normal'
        }, ],
        replaceConsole: true
    }
}
