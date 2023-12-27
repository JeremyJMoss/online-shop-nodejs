const db = require('../util/database');
const OrderItem = require('./order_item');

module.exports = class Order {
    static async createOrder(user){
        try{
            const order = await db.execute("INSERT INTO orders (name, email, user_id) VALUES (?, ?, ?)", [
                user.name,
                user.email,
                user.id
            ]);
            return order[0].insertId;
        }
        catch(err){
            console.log(err);
        }
    }

    static async addOrder(cart, user) {
        try{
            const order_id = await Order.createOrder(user)
            const orderItemPromises = cart.map(async product => {
                const orderItem = new OrderItem(
                    product.product_id,
                    product.title,
                    product.price,
                    product.quantity,
                    order_id
                );
                try{
                    await orderItem.save();
                }
                catch (err){
                    console.log(err);
                }
            });

            return await Promise.all(orderItemPromises);
        }
        catch(err){
            console.log(err)
        } 
    }

    static async retrieveAllOrders(user_id){
        const [orders, _ ] = await db.execute("SELECT id, name, email FROM orders where user_id = ?", [user_id]);
        return orders;
    }

    static async fetchAll(user_id){
        const orders = await Order.retrieveAllOrders(user_id);
        const completeOrders = orders.map(async order => {
            const order_items = await OrderItem.retrieveOrderParts(order.id);
            const new_order = {...order};
            new_order.products = order_items;
            return new_order;
        })
        return await Promise.all(completeOrders);
    }
}