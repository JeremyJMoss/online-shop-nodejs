const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
    '/add-product',
    [
        body('title', 'Please enter a valid title with more than 3 characters')
        .isString()
        .isLength({ min:3 })
        .trim(),
        body('price', 'Please enter a valid price')
        .isFloat(),
        body('description', 'Please enter a description greater than 5 characters and less than 400 characters')
        .isLength({ min: 5, max: 400 })
        .trim()
    ],
    isAuth,
    adminController.postAddProduct
    );

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
    '/edit-product',
    [
        body('title', 'Please enter a valid title with more than 3 characters')
        .isString()
        .isLength({ min:3 })
        .trim(),
        body('price', 'Please enter a valid price')
        .isFloat(),
        body('description', 'Please enter a description greater than 5 characters and less than 400 characters')
        .isLength({ min: 5, max: 400 })
        .trim()
    ],
    isAuth,
    adminController.postEditProduct
);

router.delete('/delete-product/:productId', isAuth, adminController.postDeleteProduct);

module.exports = router;
