
module.exports = async function (fastify) {

/*    fastify.post('/Authentication/Signup', async function (req, reply) {
        
    })*/

    fastify.post('/Authentication/Signin', async function (req, reply) {
        const { username, password } = req.body;
        console.log(username)
    })
    
}