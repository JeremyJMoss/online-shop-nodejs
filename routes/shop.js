const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getHomePage);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/create-order', shopController.createOrder);

router.get('/orders', shopController.getOrders);

router.post('/cart-delete-item', shopController.deleteCartItem);

module.exports = router;
