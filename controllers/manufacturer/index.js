var mongoose = require('mongoose')
  , Mfr = mongoose.model('Mfr')
  , User = mongoose.model('User')
  , uploadImage = require('../../model/upload').uploadImage;


exports.add = function add(req, res) {

  var mid = req.session.mid;

  if (!mid) {
    res.render('mfr/register', {title: '生产厂商注册'});

  } else {
    res.redirect('back');
  }
}

exports.create = function create(req, res) {

  function doCreate (err, mfr) {
    if(err) throw err;

    Mfr.create(mfr, function (err, mfr) {
      if (err) throw err;
      User.findOne({name: req.session.username}, function (err, user) {
        user.mfr = mfr;
        user.save(function (err, user) {
          if (err) throw err;
          // user.mfr has been converted to ObjectId
          req.session.mid = user.mfr;
          req.flash('info', '您的公司已经注册成功');
          res.redirect('/mfrs/' + user.mfr);
        });
      })
    })
  }

  var mfr = req.body.mfr || {}
    , image = req.files.image;

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

exports.show = function view(req, res) {

  Mfr.findById(req.params['_id'], function (err, mfr) {
    if (err) throw err;
    if (mfr) {
      res.render('mfr/details', {
        title: '生产厂商具体信息',
        mfr: mfr
      });
    } else {
      throw 404;
    }
  })
}


exports.edit = function edit(req, res) {
  var mid = req.session.mid;

  Mfr.findById(mid, function (err, mfr) {
    if (err) throw err;
    res.render('mfr/edit', {
      title: '编辑生产商资料',
      mfr: mfr

    });
  });
}

exports.update = function update(req, res) {
  // TODO: add admin support

  function doUpdate(err, mfr) {
    if(err) throw err;
    console.log('here2');
    Mfr.doUpdate(mfr, function (err, doc) {
      if(err) throw err;

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





