const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        check(
            'email',
            'Please enter a valid email address.'
        )
        .isEmail(),
        check(
            'password',
            'Please enter a valid password'
        )
        .isLength({min: 5})
        .isAlphanumeric()
    ],
    authController.postLogin
);

router.post(
    '/signup',
    [
        check(
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
        }),
        check(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters'
        )
        .isLength({min: 5})
        .isAlphanumeric(),
        check(
            'confirmPassword'
        )
        .custom((val, { req }) => {
            if (val !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })

    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;