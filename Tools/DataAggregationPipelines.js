const Logger = require("./Logger");
const path = require("path");

module.exports = async function (fastify) {
    const collection = fastify.config.COLLECTION_ITEMS

/*    async function DispatchIcon(){
        const dirPath = path.join(process.cwd(), 'MediaDispatch', 'Icons');
        console.log(dirPath)

        if (!fs.existsSync(dirPath)) {
            console.log(`Каталог ${dirPath} не существует.`);
            return;
        }
    }*/

}