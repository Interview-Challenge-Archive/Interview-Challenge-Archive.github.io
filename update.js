/**
 * Created by mekdr on 1/13/2017.
 */

require('./assets/js/config.js');

var config = global.jobtestvault.config,
    url = 'mongodb://'+config.db.host+':'+config.db.port+'/'+config.db.name,
    fs = require('fs'),
    path = require('path');

console.log("Connecting to " + url + "...");
require('mongodb').MongoClient.connect(url, function(err, db) {

    if (err) {
        console.error(err);
        process.exit();
    } else {
        console.log('Connected!');
    }

    var readers = {

    }

    fs.readdir('./.data', function (err, files) {
        if (err) {
            console.error(err);
            process.exit();
        }
        files.forEach(function (file) {
            var ext = path.extname(file).substr(1).toLowerCase();
            var name = path.basename(file, '.' + ext);
            var stream = fs.createReadStream(file);
            var tmp_tbl = name + '_tmp';
            readers[ext](stream, db.collection(tmp_tbl));
            db.collection(name).drop();
            db.collection.renameCollection(tmp_tbl, name);
        });
    });
});