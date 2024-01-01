const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailler = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
require('dotenv').config();

const transporter = nodemailler.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}))

exports.getLogin = (req, res, next) => {
  const message = req.flash('error');
  
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message.length > 0 ? message[0] : null,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  const message = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message.length > 0 ? message[0] : null,
    oldInput: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const {email, password} = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email, 
        password
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({email})
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email address or password',
          oldInput: {
            email, 
            password
          },
          validationErrors: [{path: 'email'}, {path: 'password'}]
        });
      }
      bcrypt.compare(password, user.password)
      .then((doMatch) => {
        if (doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            if (err) {
              console.log(err);
            }
            res.redirect('/');
          });
        }
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email address or password',
          oldInput: {
            email, 
            password
          },
          validationErrors: [{path: 'email'}, {path: 'password'}]
        });
      }).catch(err => {
        console.log(err);
        res.redirect('/login');
      })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const {name, email, password} = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErrors: errors.array()
    });
  }
  bcrypt.hash(password, 12)
  .then((hashedPassword) => {
    const user = new User({
      name,
      email,
      password: hashedPassword,
      cart: {
        items: []
      }
    })
    return user.save();
  })
  .then(() => {
    res.redirect('/login');
    return transporter.sendMail({
      to: 'email',
      from: process.env.FROM_EMAIL,
      subject: "Signup succeeded!",
      html: '<h1>You successfully signed up!</h1>'
    })
  })
  .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  const message = req.flash('error');
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message.length > 0 ? message[0] : null
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then (user => {
      if (!user){
        req.flash('error', 'No account with that email address.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      user.save()
      .then(() => {
        res.redirect('/');
        transporter.sendMail({
        to: req.body.email,
        from: process.env.FROM_EMAIL,
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/new-password/${token}">link</a> to set a new password.</p>
        `
        })
      })
    })
    .catch(err => console.log(err));
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {$gt: Date.now()} 
  }).then((user) => {
    const message = req.flash('error');
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message.length > 0 ? message[0] : null,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
}

exports.postNewPassword = (req, res, next) => {
  const {password, userId, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => console.log(err));
}


