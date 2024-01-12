const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        body(
            'email',
            'Please enter a valid email and password'
        )
        .isEmail()
        .normalizeEmail(),
        body(
            'password',
            'Please enter a valid email and password'
        )
        .isLength({min: 5})
        .trim()
    ],
    authController.postLogin
);

router.post(
    '/signup',
    [
        body(
            'email',
            'Please enter a valid email address.'
        )
        .isEmail()
        .custom((value, { req }) => {
            return User.findOne({email: value})
                .then(user => {
                    if (user) {
                        return Promise.reject('Email exists already, please pick a different one.');
                    }
                })
        })
        .normalizeEmail(),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters'
        )
        .isLength({min: 5})
        .trim(),
        body(
            'confirmPassword'
        )
        .custom((val, { req }) => {
            if (val !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
        .trim()
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;