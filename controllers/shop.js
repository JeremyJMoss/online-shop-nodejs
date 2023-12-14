const Product = require('../models/product');
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    res.render('shop/product-detail', {
      product,
      pageTitle: `Product: ${product.title}`,
      path: '/products'
    })
  })
}

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];
      for (let product of products) {
        const cartProductData = cart?.products.find(prod => prod.id === product.id)
          if (cartProductData) {
            cartProducts.push({productData: product, qty: cartProductData.qty});
          }
      }
      res.render( 'shop/cart', {
        pageTitle: 'Your Cart',
        path: "/cart",
        products: cartProducts,
        totalPrice: cart?.totalPrice ?? 0
      });
    })
  });
  
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  })
  res.redirect('/cart');
}

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
  })
  res.redirect('/cart');
}

exports.getHomePage = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
}

exports.getCheckout = (req,res,next) => {
  res.render( 'shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}

exports.getOrders = (req,res,next) => {
  res.render( 'shop/orders', {
    pageTitle: 'Orders',
    path: '/orders'
  })
}
