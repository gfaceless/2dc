var path = require('path')
  , fs = require('fs');

function upload(image, subFolder, fn) {
  console.log('here3');
  var basename = path.basename(image.path);
  //TODO: consider changing basename to pid(excluding the random part)
  var newPath = path.resolve(__dirname,
    '../public/images/' + subFolder, basename);
  fs.rename(image.path, newPath, function (err) {
    if (err) throw err;
    fn(err, basename);
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

upload.uploadImage = function (opts, fn) {
  opts = opts || {};

  var image = opts.image
    , doc = opts.doc
    , subFolder = opts.path;


  if (~image.type.indexOf('image/') && image.size) {
    upload(image, subFolder, function (err, basename) {
      // TODO: should check doc.images first
      // TODO: if image changes, delete the original one
      doc.images = [];
      doc.images[0] = basename;
      console.log('error is null or undefined?: ', err)
      fn(err, doc);
    });
  } else {
    return fn(null, doc);
  }
}

module.exports = exports = upload;