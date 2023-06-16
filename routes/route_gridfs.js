const mongodb = require('mongodb')
const fs = require('fs')

module.exports = async function (fastify) {

    // Declare a route
    fastify.get('/GridFS/:id', async function (req, reply) {
        try {

            const db = this.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });

            bucket.openDownloadStreamByName('Branch.png').pipe(fs.createWriteStream('./Branch.png'))


            //const id = new this.mongo.ObjectId(req.params.id)
            //const file = await this.mongo.db.collection('fs.files').findOne({ _id: id })

            //if (!file) {
            //    reply.status(404).send('File not found!')
            //    return
            //} else {
            //    reply.status(200).send(file.filename)
            //    return
            //}


        } catch (err) {
            reply.send(err);
        }
    })    
}