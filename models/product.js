const Cart = require("../models/cart");
const db = require('../util/database');


module.exports = class Product {
  constructor(id, title, image_url, description, price, user_id) {
    this.id = id;
    this.title = title;
    this.image_url = image_url;
    this.description = description;
    this.price = price;
    this.user_id = user_id;
  }

  save() {
    if (!this.id){
      return db.execute("INSERT INTO products (title, price, description, image_url, user_id) VALUES(?, ?, ?, ?, ?)", [
        this.title,
        this.price,
        this.description,
        this.image_url,
        this.user_id
      ]);
    }
    return db.execute("UPDATE products SET title = ?, price = ?, description = ?, image_url = ?, user_id = ? WHERE id = ?", [
      this.title,
      this.price,
      this.description,
      this.image_url,
      this.user_id,
      this.id
    ]);

  }

  static async fetchAll() {
    const [products, _ ] = await db.execute('SELECT * FROM products');
    return products;
  }

  static async findById(prodId) {
    try{
      const [row, _ ] = await db.execute("SELECT * FROM products WHERE id = ? LIMIT 1", [prodId])
      return row[0];
    } 
    catch(err){
      console.log(err)
    }
    
  }

  static deleteById(prodId) {
    return db.execute("DELETE FROM products WHERE id = ?", [
      prodId
    ]);
  }
};
