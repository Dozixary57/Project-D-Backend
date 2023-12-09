const chokidar = require('chokidar');
const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");

module.exports = {
    ItemIconsWatcher: function (fastify) {
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
    }
};