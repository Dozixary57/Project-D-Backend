const mongodb = require('mongodb')
const fs = require('fs')
const path = require('path');

module.exports = async function (fastify) {

    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), 'GridFS', 'Covers'), // Указываете правильный путь к каталогу с изображениями
        prefix: '/GridFS/Covers', // Префикс для обращения к изображениям
        constraints: { host: 'localhost:5000' }
    })

    //// Declare a route
    //fastify.get('/GridFS/:id', async function (req, reply) {
    //    try {

    //        const db = this.mongo.db;
    //        const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });

    //        bucket.openDownloadStreamByName('Branch.png').pipe(fs.createWriteStream('./Branch.png'))

    //    } catch (err) {
    //        reply.send(err);
    //    }
    //})


    //// Declare a route
    //fastify.get('/GridFS/:id', async function (req, reply) {
    //    try {

    //        const id = new this.mongo.ObjectId(req.params.id)

    //        const db = this.mongo.db;
    //        const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });
    //        const file = bucket.openDownloadStream(id).pipe(fs.createWriteStream('./Branch.png'))



    //    } catch (err) {
    //        reply.send(err);
    //    }
    //})


    //// Declare a route
    //fastify.get('/GridFS/Covers', async function (req, reply) {
    //    try {

    //        const id = new this.mongo.ObjectId(req.params.id)

    //        const db = this.mongo.db;
    //        const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });
    //        bucket.openDownloadStream(id).pipe(fs.createWriteStream('./GridFS/Covers/Branch.png'))
    //        const imagePath = path.join(process.cwd(), 'GridFS', 'Covers', 'Branch.png');
    //        reply.sendFile(imagePath)
    //        reply.send(imagePath)
    //    } catch (err) {
    //        reply.send(err);
    //    }
    //})

    // Declare a route
/*    fastify.get('/GridFS/Cover/:id', async function (req, reply) {
        try {
            const id = new this.mongo.ObjectId(req.params.id)

            const db = this.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });
            const fileCursor = bucket.find({ _id: id });

            if (await fileCursor.hasNext()) {
                const filename = (await fileCursor.next()).filename;
                const imagePath = path.join(process.cwd(), 'GridFS', 'Covers', `${filename}`);
                reply.send(imagePath);
            } else {
                reply.code(404).send({ error: 'Image not found' });
            }
        } catch (err) {
            reply.send(err);
        }
    });*/

    fastify.get('/GridFS/Cover/:id', async function (req, reply) {
        try {
            
            const db = this.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });
            let fileCursor = bucket.find({ filename: (req.params.id.replace(/_/g, ' ') + '.png') });
            // console.log(req.params.id.replace(/_/g, ' ') + '.png')
            if (await fileCursor.hasNext()) {
                const fileName = (await fileCursor.next()).filename;
                console.log('Image exist by name in DB')
                if (fs.existsSync(path.join('GridFS', 'Covers', `${ fileName }`))) {
                    console.log('Image exist in FS. Image path sending...');
                    reply.send(path.join(process.cwd(), 'GridFS', 'Covers', `${fileName}`))
                    return
                } else {
                    bucket.openDownloadStreamByName(fileName).pipe(fs.createWriteStream(`./GridFS/Covers/${fileName}`))
                    console.log('Image dont exist in FS. Image downloading... Image path sending...')
                    reply.send(path.join(process.cwd(), 'GridFS', 'Covers', `${fileName}`))
                    return
                }
            } else {
                console.log('Image dont exist by name. Finding by ID...')
                const id = new this.mongo.ObjectId(req.params.id)
                fileCursor = bucket.find({ _id: id });
                if (await fileCursor.hasNext()) {
                    const fileName = (await fileCursor.next()).filename;
                    console.log('Image exist by ID in DB')
                    if (fs.existsSync(path.join('GridFS', 'Covers', `${ fileName }`))) {
                        console.log('Image exist in FS. Image path sending...');
                        reply.redirect(301, `/GridFS/Cover/${fileName.replace(/ /g, '_').slice(0, -4)}`).send(path.join(process.cwd(), 'GridFS', 'Covers', `${fileName}`))
                        return
                    } else {
                        bucket.openDownloadStream(id).pipe(fs.createWriteStream(`./GridFS/Covers/${fileName}`))
                        console.log('Image dont exist in FS. Image downloading... Image path sending...')
                        reply.redirect(301, `/GridFS/Cover/${fileName.replace(/ /g, '_').slice(0, -4)}`).send(path.join(process.cwd(), 'GridFS', 'Covers', `${fileName}`))
                        return
                    }
                } else {
                    reply.status(404).send('Image not found');
                    return
                }
            }
        } catch {
            reply.status(404).send('Image not found')
        }
    });
}