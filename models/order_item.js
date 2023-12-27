const db = require('../util/database');

module.exports = class OrderItem {
    constructor(product_id, title, price, quantity, order_id){
        this.product_id = product_id
        this.title = title
        this.price = price
        this.quantity = quantity
        this.order_id = order_id
    }

    save(){
        return db.execute("INSERT INTO order_items (product_id, title, price, quantity, order_id) VALUES(?, ?, ?, ?, ?)", [
            this.product_id,
            this.title,
            this.price,
            this.quantity,
            this.order_id
        ])
    }

    static async retrieveOrderParts(order_id){
        const [ order_items, _ ] = await db.execute("SELECT title, price, quantity FROM order_items where order_id = ?", [order_id]);
        return order_items;
    }
}