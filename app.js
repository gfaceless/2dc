var express = require('express')
  , http = require('http')
  , path = require('path')
  , dbConnector = require('./libs/db')
  , flash = require('connect-flash')
  , combo = require('combohandler')
  , error = require('./controllers/error');

require('./libs/mongoose');

var app = express();


var allowCrossDomain = function (req, res, next) {
//    res.header('Access-Control-Allow-Origin', config.allowedDomains);
//    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
    if(req.method === 'OPTIONS') {return res.send(200);}
    next();
};

var locals = function (req, res, next) {
  res.locals({
    message: req.flash('info'),
    mid: req.session.mid,
    username: req.session.username,
    logged_in: req.session.logged_in,
    isAdmin: req.session.isAdmin,
    expose: {},
    categories: require('./controllers/category.js').tree
  });
  next();
};


//app.set('env', 'production');
console.log('current env is: ' + app.settings.env);

app.configure(function () {
  app.set('port', process.env.PORT || 3002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
//    app.set('view cache', true);
//    app.engine('html', require('ejs').renderFile);

  app.use(express.favicon());
  app.use(express.logger('dev'));

  // TODO: what about uploaded file's size limit?
  app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: __dirname + '/upload/images'
  }));

  app.use(express.cookieParser());
  app.use(express.session({secret: 'nothing'}));

  app.use(flash());
  app.use(locals);

  app.use(express.methodOverride());
  app.use(allowCrossDomain);

  // from SO:
  // Note that if you don't explicitly use the router,
  // it is implicitly added by Express at the point you define a route
  // (which is why your routes still worked even though you commented out app.use(app.router)).
  app.use(app.router);

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.directory(__dirname + '/public'));

  /*app.use(function (err, req, res, next) {
   if (err instanceof combo.BadRequest) {
   res.charset = 'utf-8';
   res.type('text/plain');
   res.send(400, 'Bad request.');
   } else {
   next();
   }
   });*/


});


require('./routes')(app);


app.get('/yui3', combo.combine({rootPath: __dirname + '/public/yui'}), function (req, res) {
  res.send(res.body);
});

//app.use('/sub', require('../express/node_modules/express/examples/mvc'));

//if no url match, here it is:

app.use(error.e404);
//app.use(error);


app.configure('development', function () {
  app.use(express.errorHandler());
});
app.configure('production', function () {
  app.use(error.e500);
});


dbConnector.open(function (err) {
  if (err) {throw err;}
  http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
    require('./controllers/category.js').populate();
  });
});



