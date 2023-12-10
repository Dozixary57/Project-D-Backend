const mongodb = require('mongodb')
const fs = require('fs')
const path = require('path');
const Logger = require('../Tools/Logger')

module.exports = async function (fastify) {

    fastify.get('/GridFS/Icon/:id', async function (req, reply) {
        try {
            const host = req.headers.host;
            const protocol = req.protocol;
            let fileUrl;

            Logger.Title(`Поиск иконки [${req.params.id}]`)

            const db = fastify.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'icons' });

            Logger.Database.Info(`Поиск иконки [${req.params.id}] по filename в БД.`)
            let fileCursor = bucket.find({ filename: (req.params.id.replace(/_/g, ' ') + '.png') });
            if (await fileCursor.hasNext()) {
                Logger.Database.Info(`Иконка [${req.params.id}] найдена в БД. Поиск иконки [${req.params.id}] на сервере...`);
                const fileName = (await fileCursor.next()).filename;
                if (fs.existsSync(path.join('GridFS', 'MediaStore', 'Icons', `${ fileName }`))) {
                    Logger.Server.Info(`Иконка [${req.params.id}] найдена на сервере. Отправка на клиент...`);
                    // http://localhost:5000/Covers/Branch.png
                    fileUrl = `${protocol}://${host}/Icon/${fileName.replace(/ /g, "_")}`;
                    reply.status(200).send(fileUrl);
                    Logger.Server.Ok(`Иконка [${req.params.id}] успешно отправлена на клиент.`);
                    // reply.redirect(302, `/Icon/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`);
                    return;
                } else {
                    Logger.Server.Warn(`Не удалось найти иконку [${req.params.id}] на сервере. Отправка иконки [${req.params.id}] из БД на сервер...`);
                    bucket.openDownloadStreamByName(fileName).pipe(fs.createWriteStream(`./GridFS/MediaStore/Icons/${fileName}`))
                    Logger.Server.Info(`Иконка [${req.params.id}] успешно получена сервером. Отправка иконки [${req.params.id}] на клиент...`);
                    fileUrl = `${protocol}://${host}/Icon/${fileName.replace(/ /g, "_")}`;
                    reply.status(200).send(fileUrl)
                    Logger.Server.Ok(`Иконка [${req.params.id}] успешно отправлена на клиент.`);
                    // reply.redirect(302, `/Icon/${fileName.replace(/ /g, '_')}`);
                    // reply.redirect(302, `/Covers/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
                    return
                }
            } else {
                Logger.Server.Warn(`Не удалось найти иконку [${req.params.id}] по filename. Поиск иконки [${req.params.id}] по _id...`);
                const id = new this.mongo.ObjectId(req.params.id)
                fileCursor = bucket.find({ _id: id });
                if (await fileCursor.hasNext()) {
                    Logger.Server.Ok(`Иконка [${req.params.id}] найдена в БД. Поиск иконки [${req.params.id}] на сервере...`);
                    const fileName = (await fileCursor.next()).filename;
                    if (fs.existsSync(path.join('GridFS', 'Covers', `${ fileName }`))) {
                        Logger.Server.Info(`Иконка [${req.params.id}] найдена на сервере. Отправка на клиент...`);
                        fileUrl = `${protocol}://${host}/Icon/${fileName.replace(/ /g, "_")}`;
                        reply.status(200).send(fileUrl)
                        Logger.Server.Ok(`Иконка [${req.params.id}] успешно отправлена на клиент.`);
                        // reply.redirect(302, `/Icon/${fileName.replace(/ /g, '_')}`);
                        // reply.redirect(302, `/Covers/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
                        return;
                    } else {
                        Logger.Server.Warn(`Не удалось найти иконку [${req.params.id}] на сервере. Отправка иконки [${req.params.id}] из БД на сервер...`);
                        bucket.openDownloadStream(id).pipe(fs.createWriteStream(`./GridFS/MediaStore/Icons/${fileName}`))
                        Logger.Server.Info(`Иконка [${req.params.id}] успешно получена сервером. Отправка иконки [${req.params.id}] на клиент...`);
                        fileUrl = `${protocol}://${host}/Icon/${fileName.replace(/ /g, "_")}`;
                        reply.status(200).send(fileUrl)
                        Logger.Server.Ok(`Иконка [${req.params.id}] успешно отправлена на клиент.`);
                        // reply.redirect(302, `/Icon/${fileName.replace(/ /g, '_')}`);
                        // reply.redirect(302, `/Covers/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
                        return;
                    }
                } else {
                    reply.status(200).send(null)
                    return;
                }
            }
        } catch (err) {
            Logger.Server.Err(`Не удалось получить и отправить иконку [${req.params.id}] на клиент.`)
            Logger.Server.Deb(err)
            return;
        }
    });

    fastify.get('/Icon/:file', async (request, reply) => {
        const fileName = request.params.file.replace(/_/g, ' ');
        return reply.sendFile(fileName);
    });

}