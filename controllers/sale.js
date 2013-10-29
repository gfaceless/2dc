var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.Types.ObjectId
  , btoa = require('btoa')
  , Sale = mongoose.model('Sale')

var isArray = require('util').isArray;

exports.check = function (req, res) {
  var code = req.params.code;
  Sale.findOne({code: code}).exec(function (err, sale) {
    if(err) throw err;
    if(sale) {
      sale.queriedCount ++;
      if(!sale.queriedDate) sale.queriedDate = new Date();
      sale.save(function (err, sale) {
        res.render('sale/check', {
          title: "查询结果",
          sale: sale
        })
      })
    } else {
      res.render('sale/check', {
        title: "查询结果",
        sale: sale
      })
    }
  })
}

exports.upload = function (req, res) {
  var codes = req.body.codes
    , pid = req.body.pid
    , sales;
  if(!isArray(codes) || !pid) return res.send(500);
  // TODO: async this! IMPORTANT!
  sales = codes.map(function (rawCode) {
    return {
      product: pid,
      code: btoa( pid + rawCode)
    };
  })
  Sale.create(sales, function (err){
    if(err) throw err;
    res.send(200, {success: true, num: arguments.length - 1 });
  })
}

exports.list = function (req, res, next){
  var pid = req.query.pid;
  Sale.find({product: pid}).exec(function(err, sales) {
    if(err) return next(err);
    res.render('sale/list', {title:'码源', sales: sales});
  })
}