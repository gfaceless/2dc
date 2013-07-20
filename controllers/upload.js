/**
 * Created with JetBrains WebStorm.
 * User: giggle
 * Date: 13-3-14
 * Time: 下午2:48
 * To change this template use File | Settings | File Templates.
 */
var dbConnector = require('../model/db'),
    btoa = require('btoa');

var collectionM = dbConnector.collection('manufacturers'),
    collectionP = dbConnector.collection('products'),
    collectionS = dbConnector.collection('sales');


function upload(req, res) {

    // TODO: should check pid and codes (sanitizing)
    var pid = req.body.pid,
        codes = req.body.codes,
        docs = [],
        len = codes.length;

    var doc, n=0;
    codes.forEach(function (code, i) {
        doc = {
            pid: pid,
            code: btoa( pid + code),
            checked: 0
        };
        console.log(doc);
        collectionS.insert(doc, {safe:true}, function(err, doc){
            // TODO: better error handling! (in case of fail, notify the user to resend)
            if(err) throw err;
            docs.push(doc);
            // TODO: in case some insert fails
            // TODO: should retry. If retry still fails, send the failed code back.
            if(n+1 === len && len === i+1) {
                res.send({
                    success: true,
                    num: n+1,
                    docs: docs
                })
            }
            n++;
        });

    });



}


module.exports = exports = upload;

