const Logger = require("./Logger");
const path = require("path");
const fs = require("fs")

module.exports = function(fastify) {
    return {
        DispatchIcon: async function() {
            const dirPath = path.join(process.cwd(), 'GridFS', 'MediaDispatch', 'Icons');
            // await Logger.Deb(dirPath)

            if (!fs.existsSync(dirPath)) {
                // await Logger.Deb(`Каталог [${dirPath}] не существует. Создание...`);
                fs.mkdirSync(dirPath)
                if (dirPath) {}
                    // await Logger.Deb(`Каталог [${dirPath}] создан!`);
                else {
                    // await Logger.Deb(`Не удалось создать каталог [${dirPath}]!`);
                    return;
                }
            }

        }

/*        ,
        function2: async function() {
            // Используйте 'fastify' здесь...
        }*/
    }
}