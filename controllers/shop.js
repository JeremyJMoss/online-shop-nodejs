const Product = require('../models/product');

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
    res.render( 'shop/cart', {
      pageTitle: 'Cart',
      path: "/cart"
    })
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
