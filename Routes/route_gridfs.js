const mongodb = require('mongodb')
const fs = require('fs')
const path = require('path');
const Logger = require('../Tools/Logger')

module.exports = async function (fastify) {

    fastify.get('/GridFS/Cover/:id', async function (req, reply) {
        try {

            const host = req.headers.host;
            const protocol = req.protocol;
            let fileUrl;
            
            const db = this.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });
            let fileCursor = bucket.find({ filename: (req.params.id.replace(/_/g, ' ') + '.png') });
            if (await fileCursor.hasNext()) {
                const fileName = (await fileCursor.next()).filename;
                await Logger.DB('Image exist by name in DB')
                if (fs.existsSync(path.join('GridFS', 'Covers', `${ fileName }`))) {

                    console.log('Image exist in FS. Image path sending...');
                    // http://localhost:5000/Covers/Branch.png
                    fileUrl = `${protocol}://${host}/Cover/${fileName}`;
                    reply.status(200).send(fileUrl)
                    // reply.redirect(302, `/Cover/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
                    return
                } else {
                    bucket.openDownloadStreamByName(fileName).pipe(fs.createWriteStream(`./GridFS/Covers/${fileName}`))
                    console.log('Image dont exist in FS. Image downloading... Image path sending...')
                    fileUrl = `${protocol}://${host}/Cover/${fileName}`;
                    reply.status(200).send(fileUrl)
                    // reply.redirect(302, `/Cover/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
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
                        fileUrl = `${protocol}://${host}/Cover/${fileName}`;
                        reply.status(200).send(fileUrl)
                        // reply.redirect(302, `/Cover/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
                        return
                    } else {
                        bucket.openDownloadStream(id).pipe(fs.createWriteStream(`./GridFS/Covers/${fileName}`))
                        console.log('Image dont exist in FS. Image downloading... Image path sending...')
                        fileUrl = `${protocol}://${host}/Cover/${fileName}`;
                        reply.status(200).send(fileUrl)
                        // reply.redirect(302, `/Cover/${fileName.replace(/ /g, '_')}`).type('image/png').sendFile(`${fileName}`)
                        return
                    }
                } else {
                    reply.status(200).send(`${protocol}://${host}/Cover/NOOBJECT.png`)
                    return
                }
            }
        } catch {
            reply.status(200).send(`${protocol}://${host}/Cover/NOOBJECT.png`)
            return
        }
    });

}