const db = require('../util/database');
const CartItem = require('./cart_item');

module.exports = class Cart {
    static async getCartId(user_id){
        const [cart, _ ] = await db.execute("SELECT * FROM carts WHERE user_id = ? LIMIT 1", [user_id]);
        if (cart.length === 0){
            return Cart.createCart(user_id)
            .then((cart) => cart[0].id)
            .catch(err => console.log(err));
        }
        return cart[0].id;
    }
    
    static async createCart(user_id){
        const cart = await db.execute("INSERT INTO carts (user_id) VALUES (?)", [user_id]);
        return cart;
    }

    static async getCart(user_id) {
        const cart_id = await Cart.getCartId(user_id);
        const cartItems =  await CartItem.getItemsByCart(cart_id);
        return cartItems;
    }

    static async addToCart(user_id, product_id) {
        const cart_id = await Cart.getCartId(user_id);
        return await CartItem.addCartItem(cart_id, product_id);
    }

    static async deleteFromCart(cart_item_id, user_id){
        const cart_id = await Cart.getCartId(user_id);
        return await CartItem.deleteCartItem(cart_id, cart_item_id);
    }

    static async clearCart(user_id) {
        const cart_id = await Cart.getCartId(user_id);
        return await CartItem.deleteAllCartItems(cart_id);
    }
}