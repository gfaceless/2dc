/*here are all necessary schemas and models
 * as well as connection
 * */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.Types.ObjectId
  , util = require('util');

mongoose.connect('mongodb://localhost/2dc');

// consider using regex
function generateLengthValidator(start, end) {
  return [function (str) {
    // if end if not defined, then end-test is passed.
    var endTested = end ? str.length <= end : true;
    var startTested = str.length >= start;
    return  startTested && endTested;
  }, util.format('字符串长度应该在%s到%s之间', start, end || '无限制')]
}

// TODO: make it be another file, where the validator can be reused by xhr.
var lengthValidator = generateLengthValidator(2, 15)
  , longLengthValidator = generateLengthValidator(2, 25);


// I prefer parent schema, not this, maybe try that later.
// the advantage is better isolation. disadvantage is order (should have another field called order)
/*var categSchema = new Schema({
 name: String,
 children: [
 {type: ObjectId, ref: 'Category'}
 ],
 isRoot: Boolean
 })*/
var categSchema = new Schema({
  name: String,
  parent: {type: ObjectId, ref: 'Category', index: true},
  children: [{type: ObjectId, ref: 'Category'}],
  isRoot: Boolean
})

categSchema.pre('save', function (next) {
  // do stuff
  next();
});


var productSchema = new Schema({
  name: {type: String, validate: lengthValidator, required: true},
  mfr: {type: ObjectId,    ref: 'Mfr',    required:true  },
  /* for multiple categories, schema should be something like this:
   * [{arr: []}, {arr:[...]}, {arr: []}]
   * */
  categories: [ {type: ObjectId,      ref: 'Category'} ],

  desc: String,
  images: [String], // could verify here (make sure the suffix is right)
  /*thumbnail: String*/
  "made-in": String,
  weight: Number,
  extra: Schema.Types.Mixed
  // TODO: even is ObjectId, it still needs index, I think

});


var opts = {
  type: String, trim: true, /*lowercase: true,*/ validate: lengthValidator,
  index: {unique: true}
};

var userSchema = new Schema({
  name: {
    type: String, trim: true, lowercase: true, validate: lengthValidator,
    index: {unique: true}
  },
  password: {type: String, required: true},
  // TODO: maybe one user can have multiple mfrs
  mfr: {type: ObjectId, ref: 'Mfr'},
  isAdmin: Boolean
});
var mfrSchema = new Schema({
  shortName: opts,
  fullName: {type: String, validate: longLengthValidator},
  desc: String,
  images: [String]
});

var saleSchema = new Schema ({
  code: {
    type: String, index: {unique: true}
  },
  pid: {type: ObjectId, ref: 'Product'},
  queriedCount: {type: Number, default: 0},
  queriedDate: {type: Date}
})




function mixin(a, b, inc, ex) {
  inc = inc || [];
  ex = ex || [];
  Object.keys(b).forEach(function (key) {
    if(~inc.indexOf(key) && !~ex.indexOf(key)) {
      console.log('passed key: %s', key);
      a[key] = b[key];
    }
  })
  return a;
}

productSchema.statics.doUpdate = function (update, fn) {
  var model = this;
  model.findById(update._id, function (err, doc) {
    if(err) throw err;
    mixin(doc, update, Object.keys(model.schema.paths));
    // err & doc is pass to callback:
    doc.save(fn);
  })
}

mfrSchema.statics.doUpdate = function (update, fn) {
  console.log('here');
  var model = this;
  model.findById(update._id, function (err, doc) {
    if(err) throw err;
    mixin(doc, update, Object.keys(model.schema.paths));
    // err & doc is pass to callback:
    doc.save(fn);
  })
}

mongoose.model('Category', categSchema);
mongoose.model('User', userSchema);
mongoose.model('Mfr', mfrSchema);
mongoose.model('Product', productSchema);
mongoose.model('Sale', saleSchema);









// add parent prop:
var User = mongoose.model('User')
  , Mfr = mongoose.model('Mfr')
  , Category = mongoose.model('Category')
  , Product = mongoose.model('Product');






// re-construct the `categories` collection
/*
Category.findOne({isRoot: true}).exec(function (err, root) {
  if (err) throw err;

  function iterate(node) {
    node.populate('children', function (err, node) {
      if (!node.children) return;
      node.children.forEach(function (child) {
        child.parent = node;
        child.save();

        iterate(child);
      });
    });
  }

  iterate(root);
})*/

// test
/*
var User = mongoose.model('User')
  , Mfr = mongoose.model('Mfr')
  , Category = mongoose.model('Category')
  , Product = mongoose.model('Product');

var mfr = new Mfr({
    fullName: '太平洋重型工业生产基地', shortName: '南阳重工', desc: 'some thing'
  })

  , user = new User({
    name: 'blah',
    mfr: mfr
  })
  , categoryRoot = new Category({
    name: 'root测试类别',
    isRoot: true
  })
  , category1 = new Category({
    name: '汽车工业行业',
    parent: categoryRoot
  })
  , category2 = new Category({
    name: '品牌专用配件',
    parent: category1
  })
  , category3 = new Category({
    name: '东风配件',
    parent: category2
  })
  , product = new Product({
    name: '测试产品',
    images: ['1.jpg', '2.jpg'],
    desc: 'hey girl',
    mfr: mfr,
    categories: [category3, category2, category1, categoryRoot]
  });
mfr.save(function (err, mfr) {
  if (err) throw err;
  user.save(function (err, user) {
    Category.create(categoryRoot, category1, category2, category3,
      function(err, doc1, doc2, doc3, doc4, doc5) {
      if(err) throw err;

      console.log(doc1, doc2, doc3, doc4, doc5);

      product.save(function (err) {
        if (err) throw err;
        console.log(product);
      })

    })
  })
})
*/



