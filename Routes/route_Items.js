const Logger = require("../Tools/Logger");
const Mercurius = require('mercurius');
const mongodb = require("mongodb");
const fs = require("fs");
const path = require("path");

let paramsId;

module.exports = async function (fastify) {
    const collection = fastify.config.COLLECTION_ITEMS


    const schema = `
      type Items {
        _id: String
        Title: String
        CoverURL: String
      }
      
      type Item {
        _id: String
        Title: String
        Description: String
        CoverURL: String
      }
    
      type Query {
        ItemsQuery: [Items]
        ItemQuery: Item
      }
    `;

    const resolvers = {
        Query: {
            ItemsQuery: async () => {

                const items = await fastify.mongo.db.collection(collection).find().toArray()

                const result = await Promise.all(items.map(document => ({
                    _id: document._id,
                    Title: document.Title,
                    CoverURL: document.Media.CoverURL,
                })));
                return result;
            },
            ItemQuery: async (obj, args, context) => {

                const item = await fastify.mongo.db.collection(collection).findOne({ Title: paramsId.replace(/_/g, ' ') });

                return {
                    _id: item._id,
                    Title: item.Title,
                    Description: item.Description,
                    CoverURL: item.Media.CoverURL,
                };
            },
        },
    };

    fastify.register(Mercurius, {
        schema,
        resolvers,
        graphiql: false,
    });

    // Declare a route
    fastify.get('/Items', async function (req, reply) {
        try {
            const result = await fastify.graphql(`query { ItemsQuery { _id, Title, CoverURL } }`);
            reply.status(200).send(result.data.ItemsQuery)
        } catch (err) {
            reply.send(err)
        }
    })

    fastify.register(async function (fastify) {
        fastify.get('/Items-WS', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on('message', async (message) => {
                console.log(message.toString())
                connection.socket.send('hi from server')
            })
        })
    })

    fastify.get('/Item/:id', async function (req, reply) {
        try {
            paramsId = req.params.id
            const result = await fastify.graphql(`query { ItemQuery { _id, Title, Description, CoverURL } }`);
            paramsId = null
            reply.status(200).send(result.data.ItemQuery)
            /*            let item = await fastify.mongo.db.collection(collection).findOne({ Title: req.params.id.replace(/_/g, ' ') })
                        if (item) {
                            reply.status(200).send(item)
                            return
                        } else {
                            const id = new this.mongo.ObjectId(req.params.id)
                            item = await fastify.mongo.db.collection(collection).findOne({ _id: id })
                            if (item) {
                                reply.redirect(302, `/Item/${item.Title.replace(/ /g, '_')}`).send(item)
                                return
                            } else {
                                reply.status(404).send('Item not found.')
                                return
                            }
                        }*/
        } catch {
            reply.status(404).send('Item not found.')
        }
    })
}