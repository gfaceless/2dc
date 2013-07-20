
var error = function (err, req, res, next) {
    // `throw 500` is different from `throw new Error(500)`
    // the former automatically gives it status property.
    console.log(err);
    switch (err.status) {
        case 404:
            error.e404(req, res, next);
            break;
        // does it mean we'll never see that pretty `default error page` again?
        case 500:
            // Error property has some non-enumerable properties.
            /*console.log(Object.getOwnPropertyNames(err));
            console.log(Object.getOwnPropertyDescriptor(err, 'stack').get.toString());
            console.log(err.stack);
            console.log(Object.getOwnPropertyDescriptor(err, 'message'));
            console.log(require('util').inspect(err, {depth: 4, showHidden: true}));*/
            error.e500(err, req, res, next);
            break;
        default :
            next(err);
    }

};

error.e500 = function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('errors/500', { title: 'error 500', error: err });
}

// two possibilities to be here:
// 1. an invalid url
// 2. arbitrary code by programmers, like `throw 404`
error.e404 = function (req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('errors/404', { title: 'error 404', url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
}

error.makeError = function (status, msg) {
  var e = new Error(msg);
  e.status = status;
  return e;
}

module.exports = exports = error;