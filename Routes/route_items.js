const Logger = require("../Tools/Logger");
const mercurius = require('mercurius');
const mongodb = require("mongodb");

module.exports = async function (fastify) {
    // let ParamsId;

    const collection = fastify.config.COLLECTION_ITEMS
    const server = fastify.config.SERVER
    const schema = `
      type id {
        Certain: String
      }
      
      type Items {
        _id: String
        ID: id
        Title: String
        IconURL: String
      }
      
      type description {
        General: String
        Authorial: String
      }
      
      type Item {
        _id: String
        Title: String
        Description: description
        IconURL: String
      }
    
      type Query {
        ItemsQuery: [Items]
        ItemQuery (ParamsId: String!): Item
      }
    `;

    const resolvers = {
        Query: {
            ItemsQuery: async () => {
                const items = await fastify.mongo.db.collection(collection).find().toArray()

                const result = await Promise.all(items.map(document => ({
                    _id: document._id,
                    ID: document.ID,
                    Title: document.Title,
                    IconURL: `${server}/Icon/${(document.Title).replace(/ /g, '_')}.png`,
                })));
                return result;
            },
            ItemQuery: async (obj, { ParamsId }, context) => {

                let item = await fastify.mongo.db.collection(collection).findOne({ Title: ParamsId.replace(/_/g, ' ') });

                if (!item) {
                    const id = new fastify.mongo.ObjectId(ParamsId)
                    item = await fastify.mongo.db.collection(collection).findOne({ _id: id })
                    if (!item) {
                        return;
                    }
                }

                return {
                    _id: item._id,
                    Title: item.Title,
                    Description: item.Description,
                    IconURL: `${server}/Icon/${(item.Title).replace(/ /g, '_')}.png`,
                };
            },
        },
    };
    fastify.register(mercurius, {
        schema,
        resolvers,
        graphiql: false,
    }).ready(()=> {
        Logger.Server.Ok('@Fastify/Mercurius успешно зарегестрирован!');
    });


    // Declare a route
    fastify.get('/Items', async function (req, reply) {
        try {
            const query = `
              query {
                ItemsQuery {
                  _id
                  ID {
                    Certain
                  }
                  Title
                  IconURL
                }
              }
            `;

            const result = await fastify.graphql(query);
            reply.status(200).send(result.data.ItemsQuery)
        } catch (err) {
            Logger.Server.Err(err);
            reply.status(404).send({'massage' : 'Item not found.'})
        }
    })

    fastify.get('/Item/:id', async function (req, reply) {
/*        try {
            const ParamsId = req.params.id

            let item = await fastify.mongo.db.collection(collection).findOne({ Title: ParamsId });

            if (!item) {
                const id = new fastify.mongo.ObjectId(ParamsId)
                item = await fastify.mongo.db.collection(collection).findOne({ _id: id })
                if (!item) {
                    return;
                }
            }

            reply.status(200).send(item)
        } catch (err) {
            reply.status(404).send({'massage' : 'Item not found.'})
        }*/
        try {
            const ParamsId = req.params.id;

            const query = `
              query {
                ItemQuery(ParamsId: "${ParamsId}") {
                  _id
                  Title
                  Description {
                    General
                    Authorial
                  }
                  IconURL
                }
              }
            `;

            const result = await fastify.graphql(query);

            reply.status(200).send(result.data.ItemQuery)
        } catch (err) {
            Logger.Server.Err(err);
            reply.status(404).send({'massage' : 'Item not found.'})
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
}