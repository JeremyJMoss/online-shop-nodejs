const db = require('../util/database');

module.exports = class CartItem {
    static async getCartItem(cart_id, product_id){
        const [cart_item, _ ] = await db.execute('SELECT * FROM cart_items WHERE product_id = ? AND cart_id = ?', [
            product_id,
            cart_id
        ]);
        return cart_item;
    }
    
    static async getItemsByCart(cart_id) {
        try{
            const [cartItems, _ ] = await db.execute(
                "SELECT cart_items.*, title, price, description, image_url FROM cart_items JOIN products ON cart_items.product_id = products.id WHERE cart_id = ?",
                [cart_id]
            );
            return cartItems;
        }
        catch(err){
            console.log(err);
        }
    }

    static async addCartItem(cart_id, product_id){
        const cart_item = await CartItem.getCartItem(cart_id, product_id);
        if (cart_item.length == 0){
            return await db.execute('INSERT INTO cart_items(cart_id, quantity, product_id) VALUES(?, 1, ?)', [
                cart_id,
                product_id
            ])
        }
        let quantity = cart_item[0].quantity
        return await db.execute('UPDATE cart_items SET quantity = ? WHERE product_id = ? AND cart_id = ?', [
            ++quantity,
            product_id,
            cart_id
        ])
    }

    static async deleteCartItem(cart_id, cart_item_id){
        try{
            return await db.execute("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [
                cart_item_id,
                cart_id
            ]);
        }
        catch (err){
            console.log(err);
        }
    }

    static async deleteAllCartItems(cart_id) {
        try{
            return await db.execute("DELETE FROM cart_items WHERE cart_id = ?", [
                cart_id
            ]);
        } catch(err){
            console.log(err);
        }
    }
}