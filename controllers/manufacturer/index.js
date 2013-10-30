var mongoose = require('mongoose')
  , Mfr = mongoose.model('Mfr')
  , User = mongoose.model('User')
  , uploadImage = require('../../libs/upload.js').uploadImage
  , error = require('../error.js');


exports.add = function add(req, res) {

  var mid = req.session.mid;

  if (!mid) {
    res.render('mfr/register', {title: '生产厂商注册'});

  } else {
    res.redirect('back');
  }
}

exports.create = function create(req, res, next) {

  function doCreate (err, mfr) {
    if(err) return next(err);

    Mfr.create(mfr, function (err, mfr) {
      if (err) return next(err);
      User.findOne({name: req.session.username}, function (err, user) {
        if (err) return next(err);
        user.mfr = mfr;
        user.save(function (err, user) {
          if (err) return next(err);
          // user.mfr has been converted to ObjectId
          req.session.mid = user.mfr;
          req.flash('info', '您的公司已经注册成功');
          res.redirect('/mfrs/' + user.mfr);
        });
      })
    })
  }

  var mfr = req.body.mfr || {}
    , image = req.files.mfr.image;

  uploadImage({image: image, doc: mfr, path: 'mfrs'}, doCreate);

}

exports.list = function list(req, res) {

  Mfr.find({}, function (err, mfrs) {
    if (err) throw err;
    res.render('mfr/list', {
      title: '生产厂商',
      mfrs: mfrs
    });
  })
};

exports.show = function view(req, res, next) {
  if(req.queriedEl) {
    return render(req.queriedEl);
  }
  // never reach here, isn't it?
  Mfr.findById(req.params['_id'], function (err, mfr) {
    if (err) return next(err);
    if (!mfr) return next(404);
    render(mfr);

  });

  function render(mfr){
    res.render('mfr/details', {
      title: '生产厂商具体信息',
      mfr: mfr
    });
  }
}


exports.edit = function edit(req, res) {

  if(req.queriedEl) {
    return render(req.queriedEl);
  }

  function render(mfr){
    res.render('mfr/edit', {
      title: '编辑生产商资料',
      mfr: mfr

    });
  }

  // never reach here:
  Mfr.findById(mid, function (err, mfr) {
    if (err) throw err;
    render(mfr);
  });
}

exports.update = function update(req, res, next) {
  // TODO: add admin support

  function doUpdate(err, mfr) {
    if(err) throw err;
    Mfr.doUpdate(mfr, function (err, doc) {
      if(err) return next(err);

      req.flash('info', '编辑成功！');
      res.redirect('/mfrs/' + id);

    });
  }

  var id = req.params['_id']
    , mfr = req.body.mfr || {}
    , image = req.files.image;

  // also prevent malicious overriding:
  mfr._id = id;
  uploadImage({image: image, doc: mfr, path: 'mfrs'}, doUpdate);

}

exports.prep = function (req, res, next) {
  var id = req.params['_id']
    , mid;

//  if(!id) return next();

  mid = req.session.mid;

  Mfr.findById(id, function (err, mfr) {
    if(err) return next(err);
    if(!mfr) return next(404);

    req.queriedEl = mfr;

    if(mid && mfr._id.toString() === mid) {
      res.locals.isSelf = true;
    }
    next();
  });
};




