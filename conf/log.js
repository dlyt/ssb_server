
const fs = require('fs')
const prefix = 'logs'

const server_name = process.env.name || 'test'
const path_access = `${prefix}/access/${server_name}`
const path_work = `${prefix}/work/${server_name}`

/* 判断并创建目录 */
function prepare(logpath) {
    var stuts
	try {
		stuts = fs.statSync(logpath)
    } catch (e) {}

    if (!stuts || !stuts.isDirectory()) {
        console.log(`创建目录: ${logpath}`)
        fs.mkdirSync(logpath)
    }
    return logpath
}

module.exports = {
    log4js: {
        appenders: [{
            type: 'dateFile',
            filename: `${prepare(path_work)}/log`,
            pattern: "-yyyy-MM-dd"
        }, {
            type: 'dateFile',
            filename: `${prepare(path_access)}/log`,
            pattern: "-yyyy-MM-dd",
            category: 'access'
        }],
        //replaceConsole: true
    }
}
