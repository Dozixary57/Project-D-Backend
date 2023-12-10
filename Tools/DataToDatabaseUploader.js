const Logger = require("./Logger");
const path = require("path");
const fs = require("fs")
const mongodb = require("mongodb");

module.exports = function(fastify) {
    return {
        DispatchIcon: async function(fileName) {
            const dirPath = path.join(process.cwd(), 'GridFS', 'MediaDispatch', 'Icons');

            const db = fastify.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'icons' });

            if (!fs.existsSync(dirPath)) {
                Logger.Title(`Работа с директорией`);
                Logger.Server.Info(`Директория [${dirPath}] не существует. Создание...`);
                fs.mkdirSync(dirPath)
                if (dirPath)
                    Logger.Server.Info(`Директория [${dirPath}] создана!`);
                else {
                    Logger.Server.Info(`Не удалось создать директорию [${dirPath}]!`);
                    return;
                }
            }


            const filePath = path.join(dirPath, fileName)

            let fileCursor = bucket.find({ filename: fileName });
            await fileCursor.toArray().then((files) => {
                if (files.length > 0) {
                    Logger.Database.Warn(`В БД имеются похожие файлы. Заменяем...`)
                    files.forEach((file) => {
                        bucket.delete(file._id, (err) => {
                            if (err) {
                                Logger.Server.Err(`Ошибка при удалении файла [${file}] из БД.`);
                                return;
                            }
                            Logger.Database.Ok(`Устаревший файл [${file}] успешно удален из БД.`)
                        });
                    });
                }
            })

            const DataAggregationPipelines = require('./DataAggregationPipelines')
                    // Загрузить новый файл
            const uploadStream = bucket.openUploadStream(fileName);
            const fileStream = fs.createReadStream(filePath);
            Logger.Server.Info(`Загружаем новый файл [${fileName}] в БД.`)
            fileStream.pipe(uploadStream)
                .on('error', (error) => {
                    Logger.Server.Err(`Ошибка при загрузке файла [${fileName}].`);
                })
                .on('finish', () => {
                    Logger.Server.Ok(`Файл [${fileName}] успешно загружен в БД.`);

                    Logger.Database.Info(`Устанавливаем связь документов [${fileName.replace('.png', '')}]...`)
                    DataAggregationPipelines(fastify).UpdateItemIcon(fileName);

                    // Удаляем файл после обработки
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            Logger.Server.Err(`Ошибка удаления файла [${fileName}] из отправочной директории.`);
                            return;
                        }
                        Logger.Server.Ok(`Файл [${fileName}] успешно удален из отправочной директории.`)
                    }
                );
            })

        }

/*        ,
        function2: async function() {
            // Используйте 'fastify' здесь...
        }*/
    }
}