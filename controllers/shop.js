const Product = require('../models/product');
const Cart = require("../models/cart");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then( products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products'
      })
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      res.render('shop/product-detail', {
        product,
        pageTitle: `Product: ${product.title}`,
        path: '/products'
      })
    })
    .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
  const user = req.user;
  Cart.getCart(user.id)
  .then(cartItems => {
        res.render( 'shop/cart', {
          pageTitle: 'Your Cart',
          path: "/cart",
          products: cartItems,
          totalPrice: 0
        });
      })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  const user = req.user;
    Cart.addToCart(user.id, prodId)
      .then(() => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
}

exports.deleteCartItem = (req, res, next) => {
  const cartItemId = req.body.cartItemId;
  const user = req.user; 
  Cart.deleteFromCart(cartItemId, user.id)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

exports.getHomePage = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
}

exports.createOrder = (req, res, next) => {
  const user = req.user;
  Cart.getCart(user.id)
  .then(cart => {
    Order.addOrder(cart, user)
    .then(() => {
      Cart.clearCart(user.id)
      .then(() => {
        res.redirect('/orders');
      })
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req,res,next) => {
  const user_id = req.user.id;
  Order.fetchAll(user_id)
  .then(orders => {
    res.render( 'shop/orders', {
      pageTitle: 'Orders',
      path: '/orders',
      orders
    })
  })
}
