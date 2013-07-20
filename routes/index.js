var register = require('../controllers/register'),
    upload = require('../controllers/upload'),
    check = require('../controllers/check'),
    list = require('../controllers/list');

exports.index = function (req, res) {
    res.render('index', { title:'Express' });
};

exports.registerPOST = function (req, res) {

    if (req.params.name === 'manufacturer') {
        register.registerM(req, res);
    } else if (req.params.name === 'product') {
        register.registerP(req, res);
    } else {
        res.send(404);
    }
};

exports.registerGET = function (req, res) {
    if (req.params.name === 'manufacture') {
        res.render('registerM', {title:'register manufacturer'});
    } else if (req.params.name === 'product') {
        res.render('registerP', {title:'register product'});
    } else {
        res.send(404);
    }
};

exports.check = check;

exports.upload = function (req, res) {
    // TODO: check req.header('referrer') to determine if it is a CORS
    res.header('Access-Control-Allow-Origin', '*');
    upload(req, res);


};

exports.list = function (req, res) {
    if(req.params.type === 'products') {
        list.listProducts(req, res);
    } else if(req.params.type === 'manufacturer') {

    } else {
        res.send(404);
    }
}
