module.exports = `
  extend type Query {
    NewsTypesQuery: [NewsTypes]
    AllNewsQuery: [AllNews]
    OneNewsQuery (ParamsId: String!): OneNews
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
`;