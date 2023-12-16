const Product = require('../models/product');

exports.getAdminProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, _ ]) => {
            res.render('admin/products', {
                prods: rows,
                pageTitle: 'Admin - Product List',
                path: '/admin/products'
            })
        })
        .catch(err => console.log(err));

}

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false
    });
  };
  
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.image_url;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(null ,title, imageUrl, description, price);
    product.save();
    res.redirect('/');
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.image_url;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(id, title, imageUrl, description, price);
    product.save();
    res.redirect('/');
}

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(([row, _ ]) => {
        const product = row[0];
        if (!product){
            return res.redirect('/');
        }

        res.render('admin/edit-product', {
        pageTitle: `Edit Product - ${product.title}`,
        path: '/admin/edit-product',
        editing: true,
        product
        });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId);
    res.redirect('/');
}