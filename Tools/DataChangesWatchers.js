const chokidar = require('chokidar');
const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");

module.exports = function(fastify) {
    return {
        ItemIconsWatcher: function() {
            const DataToDatabaseUploader = require('./DataToDatabaseUploader')(fastify)

            const dirPath = path.join(process.cwd(), 'GridFS', 'MediaDispatch', 'Icons');
            const MediaDispatchIconsWatcher = chokidar.watch(dirPath);

            MediaDispatchIconsWatcher.on('add', (pathToFile) => {
                Logger.Server.Info(`Файл [${pathToFile.split('/').pop()}] был добавлен.`);
                fs.readdir(dirPath, (err, files) => {
                    if (err) {
                        Logger.Server.Err(`Ошибка чтения директории [${dirPath}].`);
                        return;
                    }

                    Logger.Title('Работа с файлами');
                    // Обрабатываем каждый файл
                    files.forEach(file => {
                        const filePath = path.join(dirPath, file);

                        fs.stat(filePath, (err, stats) => {
                            if (err) {
                                Logger.Server.Err(`Ошибка получения информации о файле [${file}].`);
                                return;
                            }

                            // Если это файл, обрабатываем его
                            if (stats.isFile()) {
                                Logger.Server.Info(`Обработка файла [${file}].`);

                                // Здесь вы можете добавить свой код для обработки файла
                                const ext = path.extname(filePath);

                                switch (ext) {
                                    case '.png':
                                        DataToDatabaseUploader.DispatchIcon(file)
                                        break;
                                    default:
                                        Logger.Server.Warn(`Неверный формат файла [${file}].`)
                                }
                            }
                        });
                    });
                });
            });
        },
        ItemsCollectionWatcher: function() {
            try {
                const changeStream = fastify.mongo.db.collection('Items').watch([
                    {$match: {'operationType': 'insert'}}
                ]);

                changeStream.on('change', async (change) => {
                    const newDoc = change.fullDocument;
                    const title = newDoc.Title;

                    Logger.Title(`Установка связей документов [${title}].`)
                    Logger.Database.Info(`Обнаружен новый документ [${title}] коллекции Items. Поиск соответствующей иконки [${title}]...`)
                    const iconFile = await fastify.mongo.db.collection('icons.files').findOne({filename: `${title}.png`})

                    if (iconFile) {
                        Logger.Database.Info(`Обнаружена соответствующая иконка документа [${title}]. Установка связей...`)
                        await fastify.mongo.db.collection('Items').updateOne(
                            {_id: newDoc._id},
                            {$set: {'Media.Icon': iconFile._id}}
                        )
                        Logger.Database.Ok(`Связь между документами [${title}] успешно установлена.`)
                    } else {
                        Logger.Database.Warn(`Соответствующая иконка документа [${title}] не была обнаружена.`)
                    }
                });
            } catch (err) {
                Logger.Database.Err(`Не удалось установить связь между документами: ${err}.`)
            }
        }
    }
};