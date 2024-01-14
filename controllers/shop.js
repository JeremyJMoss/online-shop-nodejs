require ('dotenv').config()

const fs = require('fs');
const PDFDoc = require('pdfkit');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const TOTAL_ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * TOTAL_ITEMS_PER_PAGE)
    .limit(TOTAL_ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      currentPage: page,
      hasNextPage: page * TOTAL_ITEMS_PER_PAGE < totalItems,
      hasPreviousPage: page > 1,
      previousPage : page - 1,
      nextPage: page + 1,
      totalPages: Math.ceil(totalItems / TOTAL_ITEMS_PER_PAGE)  
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * TOTAL_ITEMS_PER_PAGE)
    .limit(TOTAL_ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: page * TOTAL_ITEMS_PER_PAGE < totalItems,
      hasPreviousPage: page > 1,
      previousPage : page - 1,
      nextPage: page + 1,
      totalPages: Math.ceil(totalItems / TOTAL_ITEMS_PER_PAGE)  
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if ( ! order ){
        return next(new Error('No order found.'));
      }
      if (!order.user.userId.toString() == req.user._id.toString()){
        return next(new Error('Unauthorized User!'));
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const pdfDoc = new PDFDoc();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline: filename="${invoiceName}"`);

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(20).text('Invoice');
      pdfDoc.fontSize(14).text('----------------------');

      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price
        pdfDoc.text(`${prod.product.title}\nPrice: $${prod.product.price}\nQuantity: ${prod.quantity}\n\n`)
      })

      pdfDoc.text(`Sum: $${totalPrice}`)

      pdfDoc.end();

    })
    .catch(err => {
      next(err);
    })
}

exports.getCheckout = (req, res, next) => {
  let products;
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      totalSum = products.reduce((acc, cur) => {
        return acc + cur.quantity * cur.productId.price;
      }, 0)
      
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(product => {
          return {
            price_data: {
              product_data: {
                name: product.productId.title,
                description: product.productId.description,
              },
              unit_amount: product.productId.price * 100,
              currency: 'aud',
            },
            quantity: product.quantity
          };
        }),
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalSum,
        sessionId: session.id
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}