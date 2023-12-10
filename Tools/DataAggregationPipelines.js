const Logger = require("./Logger");
const path = require("path");
const mongodb = require("mongodb");

module.exports = function(fastify) {
    return {
        UpdateItemIcon: async function(fileName) {
            const iconFile = await fastify.mongo.db.collection('icons.files').findOne({ filename: fileName })

            if (!iconFile) {
                Logger.Database.Warn(`Иконки с названием [${fileName}] еще не существует в БД.`)
                return;
            }

            // Получить название из filename, отрезав ".png"
            const title = fileName.replace('.png', '')

            // Обновить поле Icon в документе коллекции Items
            const result = await fastify.mongo.db.collection('Items').updateOne(
                { Title: title }, // условие выбора документа
                { $set: { 'Media.Icon': iconFile._id } } // операция обновления
            )

            if (result.modifiedCount !== 0) {
                Logger.Server.Ok(`Связь документов [${fileName.replace('.png', '')}] успешно установлена.`)
            } else {
                Logger.Server.Err(`Не удалось установить связь документов [${fileName.replace('.png', '')}].`)
            }
        }
    }
}