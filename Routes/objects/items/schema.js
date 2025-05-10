module.exports = `
  extend type Query {
    ItemsQuery: [Items]
    ItemQuery (ParamsId: String!): Item
  }

  type Items {
    _id: String
    ID: Int
    Title: String
    IconURL: String
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
    Description: String
    Lore: String
    Classification: classification
    Characteristics: [JSON]
    IconURL: String
    ModelURL: String
    Media: allMedia
  }
`;