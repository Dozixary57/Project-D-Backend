const Logger = require("../Tools/Logger");
const mercurius = require('mercurius');

module.exports = async function (fastify) {

    const collectionItems = fastify.config.COLLECTION_ITEMS
    const collectionNewsTypes = fastify.config.COLLECTION_NEWSTYPES
    const server = fastify.config.SERVER

    const schema = `
    type Items {
    _id: String
    ID: Int
    Title: String
    IconURL: String
    }

    type description {
    General: String
    Authorial: String
    }

    type classification {
    Type: String
    Subclass: String
    }

    type Item {
    _id: String
    Title: String
    Description: description
    Classification: classification
    IconURL: String
    }

    type NewsTypes {
    _id: String
    Sequence: Int
    Title: String
    }

    type content {
        Annotation: String
    }

    type AllNews {
    _id: String
    Title: String
    Type: String
    Content: content
    PublicationDate: String
    }

    type Query {
    ItemsQuery: [Items]
    ItemQuery (ParamsId: String!): Item
    NewsTypesQuery: [NewsTypes]
    AllNewsQuery: [AllNews]
    }
    `;

    const resolvers = {
        Query: {
            ItemsQuery: async () => {
                const items = await fastify.mongo.db.collection(collectionItems).find().toArray()

                const result = await Promise.all(items.map(document => ({
                    _id: document._id,
                    ID: document.ID,
                    Title: document.Title,
                    IconURL: `${server}/Icon/${(document.Title).replace(/ /g, '_')}.png`,
                })));
                return result;
            },
            ItemQuery: async (obj, { ParamsId }, context) => {

                let item = await fastify.mongo.db.collection(collectionItems).findOne({ Title: ParamsId.replace(/_/g, ' ') });

                if (!item) {
                    const id = new fastify.mongo.ObjectId(ParamsId)
                    item = await fastify.mongo.db.collection(collectionItems).findOne({ _id: id })
                    if (!item) {
                        return;
                    }
                }

                // Получаем Type и Subclass из коллекции Classifications
                const type = await fastify.mongo.db.collection('Classifications').findOne({ _id: item.Classification.Type });

                // Находим Subclass в массиве Subclass документа Type
                const subclass = type.Subclass.find(sub => sub._id.equals(item.Classification.Subclass));

                // Создаем объект Classification
                const classification = {
                    Type: type ? type.Type : null,
                    Subclass: subclass ? subclass.Title : null
                };

                return {
                    _id: item._id,
                    Title: item.Title,
                    Description: item.Description,
                    Classification: classification,
                    IconURL: `${server}/Icon/${(item.Title).replace(/ /g, '_')}.png`,
                };
            },
            NewsTypesQuery: async () => {
                const newsTypes = await fastify.mongo.db.collection(collectionNewsTypes).find().toArray()

                const result = await Promise.all(newsTypes.map(document => ({
                    _id: document._id,
                    Sequence: document.Sequence,
                    Title: document.Title
                })));

                return result;
            },
            AllNewsQuery: async () => {
                const news = await fastify.mongo.db.collection('News').find().toArray()

                if (!news) {
                    return;
                }

                const result = await Promise.all(news.map(async (document) => {
                    const newsType = await fastify.mongo.db.collection('NewsTypes').findOne({ _id: document.Type });
            
                    return {
                        _id: document._id,
                        Title: document.Title,
                        Type: newsType ? newsType.Title : null,
                        Content: document.Content,
                        PublicationDate: document.PublicationDate,
                    };
                }));
            
                return result;
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
}