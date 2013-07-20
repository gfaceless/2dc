/**
 * Created with JetBrains WebStorm.
 * User: giggle
 * Date: 13-3-25
 * Time: 下午3:56
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('mongodb'),
    dbConnector = require('../model/db');


function listProducts (req, res) {

    dbConnector.collection('manufacturers', function (err, collectionM) {
        if(err) throw err;
        collectionM.findOne({username:'mgcs'}, function (err, manufacturer) {
            if(err) throw err;
            dbConnector.collection('products', function(err, collectionP) {
                if(err) throw err;



                collectionP.find({mid: manufacturer._id}, {limit: 100}).toArray(function(err, products){
                    res.render('list/products', {
                        title: 'products',
                        products: products
                    });

                })
            })

        })
    });


}







/*function list(req, res) {
    var gs = new mongodb.GridStore(dbConnector, 'test.jpg', "r");
    gs.open( function (err, gs) {
        if(err) throw err;
        gs.read(gs.length, function(err, bs) {
            if(err) throw err;
            res.type(gs.contentType);
            res.send(bs);
        });
    });
}*/

exports.listProducts = listProducts;



module.exports = exports;