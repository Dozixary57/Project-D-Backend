module.exports = `
  extend type Query {
    NewsTypesQuery: [NewsTypes]
    NewsAllQuery: [News]
    NewsOneQuery (ParamsId: String!): News
  }

  type NewsTypes {
    _id: String
    Sequence: Int
    Title: String
  }

  type News {
    _id: String
    Title: String
    Type: String
    Annotation: String
    Author: String
    PublicationDate: String
  }
`;