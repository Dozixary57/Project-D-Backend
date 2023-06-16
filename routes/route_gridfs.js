const mongodb = require('mongodb')
const fs = require('fs')

module.exports = async function (fastify) {

    // Declare a route
    fastify.get('/GridFS/:id', async function (req, reply) {
        try {

            const db = this.mongo.db;
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });

            bucket.openDownloadStreamByName('Branch.png').pipe(fs.createWriteStream('./Branch.png'))

        } catch (err) {
            reply.send(err);
        }
    })    
}