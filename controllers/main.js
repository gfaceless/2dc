var category = require('./category')
    , util = require('util');

function index(req, res) {
    res.render('index', {
        title: '企业防伪平台',
        categories: category.tree,
        index: true
    });


}


exports.index = index;