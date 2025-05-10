const path = require('path');

module.exports = async function (fastify) {
	fastify.get('/Icons/:file', async (request, reply) => {
		const fileName = request.params.file.replace(/_/g, ' ');
		return reply.sendFile(fileName, { root: path.join(process.cwd(), 'MediaStorage', 'Icons') });
	});

	fastify.get('/Images/:file', async (request, reply) => {
		const fileName = request.params.file.replace(/_/g, ' ');
		return reply.sendFile(fileName, { root: path.join(process.cwd(), 'MediaStorage', 'Images') });
	});

	fastify.get('/Models/:file', async (request, reply) => {
		const fileName = request.params.file.replace(/_/g, ' ');
		return reply.sendFile(fileName, { root: path.join(process.cwd(), 'MediaStorage', 'Models') });
	});

	fastify.get('/Sounds/:file', async (request, reply) => {
		const fileName = request.params.file.replace(/_/g, ' ');
		return reply.sendFile(fileName, { root: path.join(process.cwd(), 'MediaStorage', 'Sounds') });
	});

	fastify.get('/Tracks/:file', async (request, reply) => {
		const fileName = request.params.file.replace(/_/g, ' ');
		return reply.sendFile(fileName, { root: path.join(process.cwd(), 'MediaStorage', 'Tracks') });
	});


  
	fastify.get('/Avatars/:file', async (request, reply) => {
		const fileName = request.params.file.replace(/_/g, ' ');
		return reply.sendFile(fileName, { root: path.join(process.cwd(), 'MediaStorage', 'Avatars') });
	});
};