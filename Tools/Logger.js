const fs = require("fs");
const chalk = require("chalk");

function DataTime() {
    const DT = new Date();
    const DataTime = `${DT.getHours() % 12 ? (DT.getHours() % 12).toString().padStart(2, '0') : 12}:${DT.getMinutes().toString().padStart(2, '0')}:${DT.getSeconds().toString().padStart(2, '0')}:${Math.round(DT.getMilliseconds() / 10).toString().padStart(2, '0')} ${DT.getHours() > 12 ? 'PM' : 'AM'}  ${(DT.getMonth() + 1).toString().padStart(2, '0')}/${DT.getDate()}/${DT.getFullYear().toString().slice(-2).padStart(2, '0')}`;
    return DataTime
}
const Logger = {
    Ok: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + D + '] ') + chalk.bold.whiteBright.bgGreenBright(' Ok ') + chalk.bold.greenBright(' > ' + str))
        log('[' + D + ']' + ' Success     > ' + str)
    },
    Info: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + DataTime() + '] ') + chalk.bold.whiteBright.bgBlueBright(' Info ') + chalk.bold.blueBright(' > ' + str))
        log('[' + D + ']' + ' Information > ' + str)
    },
    Deb: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + DataTime() + '] ') + chalk.bold.whiteBright.bgMagentaBright(' Deb ') + chalk.bold.magentaBright(' > ' + str))
        log('[' + D + ']' + ' Debug       > ' + str)
    },
    Warn: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + DataTime() + '] ') + chalk.bold.whiteBright.bgYellowBright(' Warn ') + chalk.bold.yellowBright(' > ' + str))
        log('[' + D + ']' + ' Warning     > ' + str)
    },
    Err: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + DataTime() + '] ') + chalk.bold.whiteBright.bgRedBright(' Err ') + chalk.bold.redBright(' > ' + str))
        log('[' + D + ']' + ' Error       > ' + str)
    },
    Server: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + DataTime() + '] ') + chalk.bold.whiteBright.bgCyanBright(' Server ') + chalk.bold.cyanBright(' > ' + str))
        log('[' + D + ']' + ' Server      > ' + str)
    },
    DB: async (str) => {
        const D = DataTime()
        console.log(chalk.white('[' + DataTime() + '] ') + chalk.bold.whiteBright.bgBlackBright(' DB ') + chalk.bold.whiteBright(' > ' + str))
        log('[' + D + ']' + ' Database    > ' + str)
    }
}

const log = (message) => {
    fs.open(`${process.cwd()}/Logs/logs.txt`, 'a', (err, fd) => {
        if (err) throw err;
        fs.appendFile(fd, message + '\n', (err) => {
            if (err) throw err;
            fs.close(fd, (err) => {
                if (err) throw err;
            });
        });
    });
}

module.exports = Logger