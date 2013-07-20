var dbConnector = require('../model/db');

var collectionM = dbConnector.collection('manufacturers'),
    collectionP = dbConnector.collection('products'),
    collectionS = dbConnector.collection('sales');


function check(req, res) {

    collectionS.findOne({code:req.params.code}, function (err, doc) {
        if(err) throw err;

        if(doc) {
            res.render('check', {checked: doc.checked, title:'true!'});

            collectionS.update({code:req.params.code}, {$inc:{checked:1}}, function (err, num){
                if(err) throw err;

            });
        } else {
            // TODO: the two routes should be in the same jade file.
            res.render('check-fail' , {title:'fake?'});
        }

    });


}


module.exports = exports = check;

