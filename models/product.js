const fs = require('fs');
const path = require('path');
const Cart = require("../models/cart");

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = callback => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    
    getProductsFromFile(products => {
      if (this.id){
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      } else{
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          if (err){
            console.log(err);
          }
        });
      }
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findById(prodId, callback) {
    getProductsFromFile(products => {
      const selectedProduct = products.find(product => product.id == prodId);
      callback(selectedProduct);
    })
  }

  static deleteById(prodId) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id == prodId);
      const productsFiltered = products.filter(product => product.id !== prodId);
      fs.writeFile(p, JSON.stringify(productsFiltered), err => {
        if (err){
          console.log(err);
          return;
        }
        Cart.deleteProduct(prodId, product.price);

      })
    })
  }
};
