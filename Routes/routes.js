module.exports = [
  require('./index'),

  require('./objects/objects'),
  require('./objects/items/routes'),
  require('./news/routes'),
  require('./ideas/routes'),

  require('./auth/routes'),
  require('./accounts/routes'),

  require('./crowdfunding/routes'),

  require('./gridfs/avatars/routes'),

  require('./payment/routes'),

  require('./files/routes'),
  require('./gridfs/gridfs'),

  // require('./gridfs/avatars/routes'),  
]