const { checkFileExists, getAnyFileSubtitles } = require("../Tools/FileTools");
const path = require("path");
const Logger = require("../Tools/Logger");
const mercurius = require('mercurius');

module.exports = async function (fastify) {

  const collectionItems = fastify.config.COLLECTION_ITEMS
  const collectionNewsTypes = fastify.config.COLLECTION_NEWSTYPES
  const collectionNews = fastify.config.COLLECTION_NEWS
  const server = fastify.config.SERVER

  const iconDir = (title) => path.join(process.cwd(), `/MediaStorage/Icons/${(title).replace(/_/g, ' ')}.png`)
  const modelDir = (title) => path.join(process.cwd(), `/MediaStorage/Models/${(title).replace(/_/g, ' ')}.glb`)

  const soundDir = path.join(process.cwd(), '/MediaStorage/Sounds');
  const soundURL = (title) => `${server}/Sound/${(title).replace(/ /g, '_')}.mp3`

  const imagesDir = path.join(process.cwd(), '/MediaStorage/Images');
  const imageURL = (title) => `${server}/Image/${(title).replace(/ /g, '_')}.png`

  const iconURL = (title) => `${server}/Icon/${(title).replace(/ /g, '_')}.png`
  const modelURL = (title) => `${server}/Model/${(title).replace(/ /g, '_')}.glb`

  const schema = `
    scalar JSON

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

    type mediaUnit {
      Title: String
      Description: String
      Url: String
    }

    type allMedia {
      Sounds: [mediaUnit]
      Images: [mediaUnit]
    }

    type Item {
      _id: String
      Category: String
      Title: String
      Description: description
      Lore: String
      Classification: classification
      Characteristics: [JSON]
      IconURL: String
      ModelURL: String
      Media: allMedia
    }

    type NewsTypes {
      _id: String
      Sequence: Int
      Title: String
    }

    type AllNews {
      _id: String
      Title: String
      Type: String
      Annotation: String
      Author: String
      PublicationDate: String
    }

    type content {
      Annotation: String
    }

    type OneNews {
      _id: String
      Title: String
      Type: String
      Content: content
      Author: String
      PublicationDate: String    
    }

    type Query {
      ItemsQuery: [Items]
      ItemQuery (ParamsId: String!): Item
      NewsTypesQuery: [NewsTypes]
      AllNewsQuery: [AllNews]
      OneNewsQuery (ParamsId: String!): OneNews
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
          IconURL: checkFileExists(iconURL(document.Title)) ? iconURL(document.Title) : "",
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

        let type = null;
        let subclass = null;

        try {
          const _type = await fastify.mongo.db.collection('Classifications').findOne({ _id: item.Classification.Type });
          type = _type.Type;
          const _subclass = await _type.Subclass.find(sub => sub._id.equals(item.Classification.Subclass));
          subclass = _subclass.Title;
        } catch (err) {
          console.log(err)
        }

        const classification = {
          Type: type,
          Subclass: subclass
        };

        // const characteristics = 

        const iconUrlExists = await checkFileExists(iconDir(item.Title));
        const modelUrlExists = await checkFileExists(modelDir(item.Title));

        let media = {
          Sounds: [],
          Images: [],
        };

        try {
          await getAnyFileSubtitles(soundDir, item.Title).then((result) => {
            if (result.length > 0) {
              for (const soundSubtitle of result) {

                const matchingSound = item.Media.Sounds.find(sound => sound.Title === soundSubtitle);

                media.Sounds.push({
                  Title: soundSubtitle,
                  Description: matchingSound? matchingSound.Description : "",
                  Url: soundURL(item.Title + " - " + soundSubtitle)
                })
              }
            }
          })
        } catch (err) {
          console.log(err)
        }

        try {
          await getAnyFileSubtitles(imagesDir, item.Title).then((result) => {
            if (result.length > 0) {
              for (const fileSubtitle of result) {

                const matching = item.Media.Sounds.find(sound => sound.Title === fileSubtitle);

                media.Images.push({
                  Title: fileSubtitle,
                  Description: "",
                  Url: imageURL(item.Title + " - " + fileSubtitle)
                })
              }
            }
          })
        } catch (err) {
          console.log(err)
        }

        return {
          _id: item._id,
          Category: "Item",
          Title: item.Title,
          Description: item.Description,
          Lore: item.Lore,
          Classification: classification,
          Characteristics: item.Characteristics,
          IconURL: iconUrlExists ? iconURL(item.Title) : "",
          ModelURL: modelUrlExists ? modelURL(item.Title) : "",
          Media: media
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

        const filteredNews = news.filter((document) => Number(document.PublicationDate) <= Date.now());

        const result = await Promise.all(filteredNews.map(async (document) => {
          const newsType = await fastify.mongo.db.collection('NewsTypes').findOne({ _id: document.Type });

          return {
            _id: document._id,
            Title: document.Title,
            Type: newsType ? newsType.Title : null,
            Annotation: document.Content.Annotation,
            Author: document.Author,
            PublicationDate: document.PublicationDate,
          };
        }));

        return result;
      },
      OneNewsQuery: async (obj, { ParamsId }, context) => {

        let news = await fastify.mongo.db.collection(collectionNews).findOne({ Title: ParamsId.replace(/_/g, ' ') });

        if (!news) {
          const id = new fastify.mongo.ObjectId(ParamsId)
          news = await fastify.mongo.db.collection(collectionNews).findOne({ _id: id })
          if (!news) {
            return;
          }
        }

        const newsType = await fastify.mongo.db.collection(collectionNewsTypes).findOne({ _id: news.Type });

        return {
          _id: news._id,
          Title: news.Title,
          Type: newsType ? newsType.Title : null,
          Content: news.Content,
          Author: news.Author,
          PublicationDate: news.PublicationDate,
        };
      },
    },
  };

  fastify.register(mercurius, {
    schema,
    resolvers,
    graphiql: false,
  }).ready(() => {
    Logger.Server.Ok('@Fastify/Mercurius library has been successfully registered!');
  });
}