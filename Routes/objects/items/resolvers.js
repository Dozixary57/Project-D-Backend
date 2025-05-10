const { getFilePath, getFilesDir, getFileUrl, checkFileExists, getAnyFileSubtitles } = require("@Tools/FileTools");

module.exports = (fastify) => ({
  Query: {
    ItemsQuery: async () => {
      const items = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_ITEMS).find().toArray()

      const result = await Promise.all(items.map(document => ({
        _id: document._id,
        ID: document.ID,
        Title: document.Title,
        IconURL: checkFileExists(getFileUrl(fastify).Icon(document.Title)) ? getFileUrl(fastify).Icon(document.Title) : "",
      })));
      return result;
    },
    ItemQuery: async (obj, { ParamsId }, context) => {
      let item = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_ITEMS).findOne({ Title: ParamsId.replace(/_/g, ' ') });

      if (!item) {
        const id = new fastify.mongo.ObjectId(ParamsId)
        item = await fastify.mongo.GameInfo.db.collection(fastify.config.COLLECTION_ITEMS).findOne({ _id: id })
        if (!item) {
          return;
        }
      }

      let type = null;
      let subclass = null;

      // try {
      //   const _type = await fastify.mongo.db.collection('Classifications').findOne({ _id: item.Classification.Type });
      //   type = _type.Type;
      //   const _subclass = await _type.Subclass.find(sub => sub._id.equals(item.Classification.Subclass));
      //   subclass = _subclass.Title;
      // } catch (err) {
      //   console.log(err)
      // }

      const classification = {
        Type: type,
        Subclass: subclass
      };

      // const characteristics = 

      const iconUrlExists = await checkFileExists(getFilePath.Icon(item.Title));
      const modelUrlExists = await checkFileExists(getFilePath.Model(item.Title));

      let media = {
        Sounds: [],
        Images: [],
      };

      try {
        await getAnyFileSubtitles(getFilesDir.Sounds(), item.Title).then((result) => {
          if (result.length > 0) {
            for (const soundSubtitle of result) {
              const matchingSound = item.Media.Sounds.find(sound => sound.Title === soundSubtitle);

              media.Sounds.push({
                Title: soundSubtitle,
                Description: matchingSound ? matchingSound.Description : "",
                Url: getFileUrl(fastify).Sound(item.Title + " - " + soundSubtitle)
              })
            }
          }
        })
      } catch (err) {
        console.log(err)
      }

      try {
        await getAnyFileSubtitles(getFilesDir.Images(), item.Title).then((result) => {
          if (result.length > 0) {
            for (const fileSubtitle of result) {

              const matching = item.Media.Sounds.find(sound => sound.Title === fileSubtitle);

              media.Images.push({
                Title: fileSubtitle,
                Description: "",
                Url: getFileUrl(fastify).Image(item.Title + " - " + fileSubtitle)
              })
            }
          }
        })
      } catch (err) {
        console.log(err)
      }

      return {
        _id: item._id,
        Category: "Items",
        Title: item.Title,
        Description: item.Description,
        Lore: item.Lore,
        Classification: classification,
        Characteristics: item.Characteristics,
        IconURL: iconUrlExists ? getFileUrl(fastify).Icon(item.Title) : "",
        ModelURL: modelUrlExists ? getFileUrl(fastify).Model(item.Title) : "",
        Media: media
      };
    },
  },
});
