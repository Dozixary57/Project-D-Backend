const chokidar = require('chokidar');
const path = require("path");
const Logger = require("./Logger");

module.exports = {
    ItemIconsWatcher: function () {
        const MediaDispatchIconsWatcher = chokidar.watch(path.join(process.cwd(), 'GridFS', 'MediaDispatch', 'Icons'));

        MediaDispatchIconsWatcher.on('add', () => {
            Logger.Server.Info(`File has been added`);
        });

        MediaDispatchIconsWatcher.on('unlink', () => {
            Logger.Server.Info(`File has been removed`);
        });
    }
};