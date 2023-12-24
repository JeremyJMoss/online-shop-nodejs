const Product = require('../models/product');

exports.getAdminProducts = (req, res, next) => {
    const user = req.user;
    Product.fetchAll()
        .then( products => {
            productsFiltered = products.filter(product => {
                return product.user_id == user.id;
            })
            res.render('admin/products', {
                prods: productsFiltered,
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
    const user_id = req.user.id;
    const title = req.body.title;
    const imageUrl = req.body.image_url;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(null ,title, imageUrl, description, price, user_id);
    product.save()
    .then(() => {
        console.log("Product Added Successfully!");
        res.redirect('/');
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const user_id = req.user.id;
    const id = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.image_url;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(id, title, imageUrl, description, price, user_id);
    product.save()
    .then(() => {
        console.log("Product Updated Successfully!");
        res.redirect('/');
    })
    .catch(err => console.log(err));
}

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    const user = req.user;
    Product.findById(prodId)
    .then((product) => {
        // no product with that id redirect
        if (!product){
            return res.redirect('/');
        }
        // if product cannot be edited by the current user redirecgt
        if (product.user_id !== user.id){
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
    Product.deleteById(prodId)
    .then(() => {
        console.log('Product Deleted Successfully!')
        res.redirect('/');
    })
    .catch(err => console.log(err));
}