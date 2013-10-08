// TODO: this file is too large. maybe split it into some small chunks in the same folder
var crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.Types.ObjectId
  , uploadImage = require('../../libs/upload.js').uploadImage


var Product = mongoose.model('Product');

exports.add = function add(req, res) {
  var mid = req.session.mid

  if (mid) {res.render('product/add', {
    title: '添加/注册产品',
    categExpanded: true
  });}

}

exports.create = function (req, res, next) {
  var product = req.body.product || {}
    , image = req.files.image;

  product.mfr = req.session.mid;

  uploadImage({image: image, doc: product, path: 'products'}, create);

  function create(err, product) {
    if (err) return next(err);
    // such API leaves the possibilities for multiple creation
    Product.create(product, function (err, product) {
      // I think the error handling should be like this:
      if(err) return next(err);
      req.flash('info', '上传产品成功！');
      res.redirect('/products/' + product._id);
    });
  }
}

exports.show = function (req, res, next) {
  var id = req.params['_id'];
  if (id) {
    Product.findById(id).lean().exec(function (err, product) {
      if (err) throw err;
      if (!product) return next(404);

      // populate product.mfr
      Product.populate(product, {path: 'mfr categories'}, function (err, product) {
        if (err) throw err;
        res.render('product/show', {
          title: '产品详细信息',
          product: product
        })
      });

    })
  }
}

exports.list = function list(req, res) {
  var category = req.query.category
    , mfr = req.query.mfr
    , name = req.query.name
    , criteria = {};

  if (category) criteria.categories = category;
  if (mfr) criteria.mfr = mfr;
  if (name) criteria.name = new RegExp('.*' + name + '.*', 'i');

  console.log(criteria);

  Product.find(criteria)
    .populate('mfr categories')
    .limit(100)
    .exec(callback);

  function callback(err, docs) {
    if (err) throw err;
    res.render('product/list', {
      title: '该类全部产品',
      products: docs
    })
  }
}
exports.edit = function edit(req, res) {
  var id = req.params['_id'];
  // should restrict mfr, or else one can insert arbitrary product into other's account
  Product.findById(id).populate('categories').exec(function (err, product) {
    if (err) throw err;
    if (!product)  throw 404;
    res.render('product/edit', {
      title: '编辑',
      product: product,
      categExpanded: true
    })

  })
}
exports.update = function update(req, res) {

  function doUpdate(err, product) {
    if (err) throw err;
    console.log('ur');
    Product.doUpdate(product, function (err, doc) {
      req.flash('info', '编辑成功！');
      res.redirect('/products/' + id);

    });
  }

  var id = req.params['_id']
    , product = req.body.product || {}
    , image = req.files.image;

  // also prevent malicious overriding:
  product._id = id;
  product.mfr = res.locals.mid;

  uploadImage({image: image, doc: product, path: 'products'}, doUpdate);

}

exports.destroy = function destory() {}

function mixin(a, b, inc, ex) {
  inc = inc || [];
  ex = ex || [];
  Object.keys(b).forEach(function (key) {
    if (~inc.indexOf(key) && !~ex.indexOf(key)) {
      console.log('passed key: %s', key);
      a[key] = b[key];
    }
  })
}

// TODO: `check` is a property of SALE controller?
function check(req, res) {

  collectionS.findOne({code: req.params.code}, function (err, doc) {
    if (err) throw err;

    if (doc) {
      res.render('check', {checked: doc.checked, title: 'true!'});

      collectionS.update({code: req.params.code}, {$inc: {checked: 1}}, function (err, num) {
        if (err) throw err;

      });
    } else {
      // TODO: the two routes should be in the same jade file.
      res.render('check-fail', {title: 'fake?'});
    }

  });


}


function listProducts(req, res) {

  var pid = req.params.pid
    , categories
    , category = req.query.category
    , mid = req.query.manufacturer;

  //TODO: everytime read the category is inefficient!
  // TODO: make it nearly static!

  collectionP.distinct('category', {}, function (err, results) {
      if (err) throw err;
      categories = results;
      if (!pid) {

        if (!category && !mid) {
          // here should list by popularity.
          collectionP.find({}, {limit: 100}).toArray(function (err, products) {
            if (err) throw err;
            res.render('product/list', {
              title: '所有产品: ',
              products: products,
              categories: categories
            });

          })
          return;
        }
        if (mid) {
          collectionP.find({mid: mid}).toArray(function (err, products) {
            if (err) throw err;

            res.render('product/list', {
              title: mid + '的所有产品',
              products: products,
              categories: categories

            })
          })
          return;
        }


        collectionP.find({category: category}, {limit: 100}).toArray(function (err, products) {
          res.render('product/list', {
            title: '显示类别: ' + category,
            products: products,
            categories: categories
          });

        })

      }
      else {

        Product.findById(pid, function (product) {
          res.render('product/details', {
            title: '产品详细信息',
            categories: categories,
            product: product
          });
        });

        /*collectionP.findOne({pid:pid}, function (err, product) {
         if (err) throw err;
         if (product) {

         res.render('product/details', {
         title:'产品详细信息',
         categories:categories,
         product:product
         });
         } else {
         res.send(404, 'no such product to show!');
         }
         })*/
      }
    }
  )
  ;
}


function edit(req, res) {
  var logged_in = req.session.logged_in
    , username = req.session.username
    , mid = req.session.mid;

  var pid = req.params.pid
    , auth;


  if (pid) {
    collectionP.findOne({pid: pid}, {fields: {_id: 0}}, function (err, product) {
      if (err) throw err;
      if (product) {
        if (product.mid === mid) {
          res.render('product/edit', {
            title: '编辑',
            product: product

          });
        } else {
          res.send(404);
        }
      } else {
        res.send(404);
      }

    });
  } else {
    // goes here if I used /products/edit/:pid? <- NOTE the question mark
    res.send(404);
  }
}

function update(req, res) {
  var pid = req.params.pid,
    product = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description
    };

  //TODO: auth: checks if this pid belongs to this user.
  collectionP.update({pid: pid}, {$set: product}, {}, function (err, result) {
    if (err) throw err;

    // FOR NOW, I need to redirect the page.
    if (result) {
      req.flash('info', '保存成功!');
      res.redirect('/products/list/' + pid);
    }
    // it seems I have {w:1} (write concern) before, so I don't need it now.
    // the result is 1.
  });

}

function destroy(req, res) {
  var pid = req.params.pid;
  // need auth too
  collectionP.remove({pid: pid}, /*{w:1},*/ function (err, num) {
    if (err) throw err;
    if (num) {
      res.send({success: true, num: num});
    } else {
      res.send(500, 'please contact us');
    }
  });

}


// this one should definitely be in the "model" or "lib" folder:
var findByMid = function (mid, fn) {
  // I'm considering to change the structure
  // e.g. db.manufacturer has [pid1, pid2, ...]
  // again, storage in exchange of performance. <- typical embedded vs reference
  collectionP.find({mid: mid}, {
    fields: {
      pid: 1,
      _id: 0
    }})
    .toArray(function (err, arr) {
      // if no result, arr will be an empty array:
      // so no need to make a condition.
      console.log(arr);
      if (err) fn(err);
      fn(null, arr.map(function (obj) {
        return obj.pid;
      }));

    });
};
// no route:
exports.hasPid = function (mid, pid, fn) {
  findByMid(mid, function (err, arr) {
    if (err) throw err;
    fn(~arr.indexOf(pid));
  })
};