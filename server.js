const fastify = require('fastify')({ logger: true })

// Declare a route
fastify.get('/', (request, reply) => {
    reply.send('Hello, world!')
})

// Run the server!
fastify.listen({ port: 5000 }, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${ address }`)
})

/*'use strict';
var http = require('http');
const { request } = require('https');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/