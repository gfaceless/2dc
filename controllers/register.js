/**
 * Created with JetBrains WebStorm.
 * User: giggle
 * Date: 13-3-11
 * Time: 下午1:44
 * To change this template use File | Settings | File Templates.
 */

var crypto = require('crypto'),
    mongodb = require('mongodb'),
    dbConnector = require('../model/db'),
    fs = require('fs'),
    path = require('path');

function registerM(req, res) {

    var mname = req.body.mname,
        username = req.body.username,
        password = req.body.password,
        hash = crypto.createHash('sha1'),
        sha1 = hash.update(password, 'utf8').digest('base64'),
        manufacturer = {
            mname:mname,
            username:username,
            password:sha1,
            count:0
        };

    var createM = function createM(err, collection) {
        collection.insert(manufacturer, function (err, docs) {
            if (err) {
                throw err;
            }
            res.send(docs);
        })
    };

    dbConnector.collection('manufacturers', createM);
}


function registerP(req, res) {

    var pname = req.body.pname,
        category = req.body.category,
        description = req.body.description,
        info = req.body.info,
        password = req.body.password,
        username = req.body.username,
        sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('base64'),
        product = {
            pname:pname,
            category:category,
            description:description || '',
            info:info || {},
            images: []
        };

    var image = req.files.image;
    console.log(image);

    // TODO: need to auth first
    if (image) {

        var basename = path.basename(image.path);

        //TODO: consider changing basename to pid(excluding the random part)
        var newPath = path.resolve(__dirname,
            '../public/images/products', basename);
        fs.rename(image.path, newPath, function (err) {
            if (err) throw err;
            product.images.push(basename);
        });


        /*var gs = new mongodb.GridStore(dbConnector, 'test.jpg', "w", {
         "contentType": image.type,
         "metadata":{
         "author":"Daniel"
         }*/
        /*,
         "chunk_size":1024 * 4*/
        /*
         });

         var storeImage = function (err, gs){
         if(err) throw err;
         console.log(gs);
         };

         // Q: should gs be opened first? gs.open(callback);
         gs.writeFile( image.path, storeImage );*/
    }
    // if there is no callback, then the 2 functions are the same.
    // (I read the source code)
    // the latter is more useful under strict mode,
    // where it requires true async callback
    /*var collectionM = new mongodb.Collection(dbConnector, 'manufacturers'),
     collectionP = dbConnector.collection('products');*/

    var collectionM = dbConnector.collection('manufacturers'),
        collectionP = dbConnector.collection('products');

    var createP = function createP(err, docM) {
        if (err) throw err;

        var pid, randHex;
        if (docM && docM.password === sha1) {
            // oops ..the nested callbacks..
            randHex = crypto.randomBytes(2, function (err, buf) {
                if (err) throw err;
                pid = docM.username + buf.toString('hex') + docM.count;

                product.pid = pid;
                product.mid = docM._id;

                collectionP.insert(product, function (err, docP) {
                    if (err) throw err;

                    collectionM.update({_id:docM._id}, {$inc:{count:1}}, function (err, num) {
                        if (err) throw err;

                        // or redirect
                        res.send({
                            success:true,
                            pid:pid
                        });
                    });
                });


            });
        } else {
            res.send({success:false});
        }
    };

    collectionM.findOne({username:username}, createP);

}

module.exports = exports;

exports.registerM = registerM;
exports.registerP = registerP;
