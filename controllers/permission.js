function login(req, res, next) {
  if (req.session.logged_in) {
    next();
  } else {
    req.flash('info', '请先登录');
    res.redirect('/users/login');
  }
}

function mfr(req, res, next) {
  if (!req.session.mid) {
    req.flash('info', '需要注册为生产厂商');
    res.redirect('/mfrs/register');
  }
  else {
    next();
  }
}

function nonMfr(req, res, next) {
  if (req.session.mid) {
    req.flash('info', '您已经是注册厂商');
    res.redirect('back');
  }
  else {
    next();
  }
}

function self(req, res, next) {
  // req.isSelf should be set in some specific request, like /:_id/edit
  if (req.isSelf) {
    res.locals.isSelf = true;
    next();
  } else {
    req.flash('info', '没有权限');
    res.redirect('back');
  }
}

function admin(req, res, next) {
  if (req.session.isAdmin) {
    res.locals.isAdmin = true;
    next();
  } else {
    req.flash('info', '没有权限');
    res.redirect('back');
  }
}


exports.login = login;
exports.mfr = [login, mfr];
exports.nonMfr = [login, nonMfr];
exports.self = [login, self];
exports.admin = [login, admin];
