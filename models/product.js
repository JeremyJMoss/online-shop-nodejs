const Cart = require("../models/cart");
const db = require('../util/database');


module.exports = class Product {
  constructor(id, title, image_url, description, price) {
    this.id = id;
    this.title = title;
    this.image_url = image_url;
    this.description = description;
    this.price = price;
  }

  save() {
    if (!this.id){
      return db.execute(`INSERT INTO products (title, price, description, image_url) VALUES('${this.title}', ${this.price}, '${this.description}', '${this.image_url}')`);
    }
    return db.execute(`UPDATE products SET title = '${this.title}', price = ${this.price}, description = '${this.description}', image_url = '${this.image_url}' WHERE id = ${this.id}`);

  }

  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static findById(prodId) {
    return db.execute(`SELECT * FROM products WHERE id = ${prodId} LIMIT 1`);
  }

  static deleteById(prodId) {
    return db.execute(`DELETE FROM products WHERE id = ${prodId}`);
  }
};
