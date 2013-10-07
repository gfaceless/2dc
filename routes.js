/**
 * Created with JetBrains WebStorm.
 * User: giggle
 * Date: 13-3-27
 * Time: 下午8:24
 * To change this template use File | Settings | File Templates.
 */

var user = require('./controllers/user')
  , routes = require('./routes/')
  , main = require('./controllers/main')
  , product = require('./controllers/product')
  , mfr = require('./controllers/manufacturer')
  , category = require('./controllers/category')
  , sale = require('./controllers/sale.js')
  , makeError = require('./controllers/error.js').makeError;

var permission = require('./controllers/permission')
  , requireLogin = permission.login
  , requireMfr = permission.mfr
  , requireNonMfr = permission.nonMfr
  , requireSelf = permission.self
  , requireAdmin = permission.admin

var mongoose = require('mongoose')
  , Mfr = mongoose.model('Mfr')
  , User = mongoose.model('User')
  , Product = mongoose.model('Product')


function startRoute(app) {

  // app.all prepare permission part (req.isSelf)
  // tell me about the performance

  // it needs at least 2 params to go into this logic:
  app.all('/:name/:_id/:op?', function (req, res, next) {
    var mid = req.session.mid
      , id = req.params._id
      , name = req.params.name
      , op = req.params.op
      , candidates = ['mfrs', 'products', 'users'];

    if(!~candidates.indexOf(name)) return next('route');
    // is toLowerCase necessary?
    if(!op && req.route.method.toLowerCase() !== 'delete') return next('route');

    // TODO: make these methods in respective files or add as schema method:
    switch (name) {
      case 'mfrs':
        Mfr.findById(id, function (err, mfr) {
          if(err) return next(err);
          if(mid && mfr._id.toString() === mid) {
            req.isSelf = true;
          }
          next();
        })
        break;
      case 'products':
        Product.findById(id, function (err, product) {
          if(err) return next(err);
          if(!product) return next(makeError(404));

          if(mid && product.mfr.toString() === mid){
            req.isSelf = true;
          }
          next();
        })
        break;
      case 'users':
        User.findById(id, function (err, user) {
          if(err) return next(err);
          if(user.name === req.session.username) {
            req.isSelf = true;
          }
          next();
        })
        break;
    }
  }, requireSelf);




  app.get('/', main.index);

  app.get('/check/:code', routes.check);
  app.post('/upload', routes.upload);
  app.get('/list/:type', routes.list);



  app.get('/products/register', requireMfr, product.add);
  app.post('/products/register', requireMfr, product.create);

  app.get('/products/list', product.list);
  app.get('/products', product.list);
  app.get('/products/:_id', product.show);

  app.get('/products/:_id/edit', product.edit);
  app.put('/products/:_id/edit', product.update);
  app.del('/products/:_id', product.destroy);


  // synonym: sign up
  app.get('/users/register', user.add);
  app.post('/users/register', user.create);

  // TODO: see if loginGet & login can be congregated:
  app.get('/users/login', user.loginGet);
  app.post('/users/login', user.login);
  app.get('/users/logout', requireLogin, user.logout);

  app.get('/users/list', requireAdmin, user.list);
  app.get('/users', requireAdmin, user.list);

  app.all('/mfrs/register', requireNonMfr);
  app.get('/mfrs/register', mfr.add);
  app.post('/mfrs/register', mfr.create);

  app.get('/mfrs/list', mfr.list);
  app.get('/mfrs', mfr.list);

  app.get('/mfrs/:_id', mfr.show);
  app.get('/mfrs/:_id/edit', mfr.edit);
  app.post('/mfrs/:_id/edit', mfr.update);


  app.get('/sales/:code', sale.check)
  app.post('/sales', sale.upload)

  app.all('/manage/*', requireAdmin);
  app.get('/manage/categories', category.modify);
  app.post('/manage/categories/refresh', category.refresh);
  app.get('/manage/category/test', category.populate2);


  var route = function (app, controllers) {

    var fns = {
      //crud
      add: {noId: true},
      create: {method: 'post', subpath: '', noId: true},

      show: '',
      list: {isPl: true},

      edit: '',
      update: {method: 'put', subpath: null},

      destroy: {method: 'del', subpath: ''}
    }
    controllers.forEach(function (c) {

      Object.keys(fns).forEach(function (fnName) {
        var obj = fns[fnName]
          , method = obj.method || 'get'
          , path
          , pathPrefix
          , mainpath
          , subpath = (typeof obj.subpath === 'undefined') ? fnName : obj.subpath;
        pathPrefix = (c.pathPrefix || '') + '/';
        subpath = ( obj.noId || obj.isPl ? '' : '/:' + c.idField ) + (subpath ? '/' + subpath : '');
        mainpath = (obj.isPl ? c.plName : c.name);
        path = '/' + pathPrefix + mainpath + subpath;
        console.log(fnName, method, path);

        // we don't use c[fnName].bind(c)
        // because later we will delete the function, leaving only the prototype
        // bind will make it stay referenced (though deleted)
        c[fnName] && app[method](path, function () {
          c[fnName].apply(c, arguments);
        });
      })
    })
  }
  route(app, [category]);
  /*var route = function (app, controllers){

   var tmp = {
   //crud
   add: {noId: true},
   create: {method: 'post', subpath:'', noId: true},

   show: '',
   list: {isPl: true},

   edit: '',
   update: {method: 'put', subpath:null},

   destroy: {method: 'del', subpath: ''}
   }
   controllers.forEach(function(c) {

   Object.keys(tmp).forEach(function(fnName){
   var obj = tmp[fnName]
   , method = obj.method || 'get'
   , path
   , pathPrefix
   , mainpath
   , subpath = (typeof obj.subpath === 'undefined') ? fnName : obj.subpath;
   pathPrefix = (c.pathPrefix || '') + '/';
   subpath = ( obj.noId || obj.isPl ? '' : '/:' + c.idField ) + (subpath ? '/'+subpath : '');
   mainpath = (obj.isPl? c.plName : c.name);
   path = '/' + pathPrefix +  mainpath + subpath;
   console.log(fnName, method, path);

   // we don't use c[fnName].bind(c)
   // because later we will delete the function, leaving only the prototype
   // bind will make it stay referenced (though deleted)
   c[fnName] && app[method](path, function(){
   c[fnName].apply(c, arguments);
   });
   })
   })
   }
   route(app, [category]);*/

}


module.exports = exports = startRoute;