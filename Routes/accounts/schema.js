module.exports = `
  extend type Query {
    AccountsQuery: [Accounts]
    AccountQuery(ParamsId: String!): Account
    DeletedAccountQuery(ParamsId: String!): Account
    TitlesQuery: [Titles]
    PrivilegesQuery: [Privileges]
  }

  type Titles {
    _id: String
    Title: String
  }

  type Privileges {
    _id: String
    Title: String
  }

  type Accounts {
    _id: String
    Username: String
    Status: String
    Email: String
  }

  type Account {
    _id: String
    Username: String
    Status: String
    Title: Titles
    Email: String
    DateOfBirth: String
    Privileges: [Privileges]
  }
`;