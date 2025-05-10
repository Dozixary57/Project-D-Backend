(async () => {
  const fastify = require('fastify')(/*{ logger: true }*/)
  require('module-alias/register');
  const CheckKeyPair = require('@Tools/CryptoKeyPairGenerator');
  const Logger = require('@Tools/Logger')

  CheckKeyPair();

  await require('./EnvironmentVariablesRegistration')(fastify);
  await require('./ExternalLibrariesRegistration')(fastify)
  await require('./Tools/JWT_Tools')(fastify);

  const routeModules = require('./Routes/routes');
  for (const route of routeModules) {
    await route(fastify);
  }

  // fastify.ready(async (err) => {
  //   if (err) throw err;

  //   const DataChangesWatchers = require('./Tools/DataChangesWatchers');
  //   await DataChangesWatchers(fastify).ItemIconsWatcher();
  //   await DataChangesWatchers(fastify).ItemsCollectionWatcher();

  // });

  // Run the server
  fastify.listen({ port: fastify.config.PORT || 5050 }, (err, address) => {
    if (err) throw err
    Logger.Title('External Libraries is registered');
    Logger.Server.Ok(`The server is running! ( ${address} )`)
  })
})();