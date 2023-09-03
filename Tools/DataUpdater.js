const Logger = require("./Logger");

// ОБЯЗАТЕЛЬНО ПОЗЖЕ УСТАНОВИТЬ ЗАЩИТУ НА ДАННЫЕ МАРШРУТЫ !!!

module.exports = async function (fastify) {
    const collection = fastify.config.COLLECTION_ITEMS

    fastify.get('/DataUpdate_CoverURL', async function (req, reply) {
        try {

            const host = req.headers.host;
            const protocol = req.protocol;

            const fileCursor = fastify.mongo.db.collection(collection).find({});
            while (await fileCursor.hasNext()) {
                const item = await fileCursor.next();
                const coverID = item.Media.CoverID;
                const file = await fastify.mongo.db.collection('fs.files').findOne({ _id: coverID });
                if (file) {
                    const fileName = file.filename;
                    const coverURL = `${protocol}://${host}/Cover/${fileName}`;
                    await fastify.mongo.db.collection(collection).updateOne({ _id: item._id }, { $set: { 'Media.CoverURL': coverURL } });
                }
            }
            reply.status(200).send('Done!')
        } catch (err) {
            if (err) throw err
        }
    })

}