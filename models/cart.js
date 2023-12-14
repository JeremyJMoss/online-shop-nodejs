const fs = require('fs');
const path = require('path');

const file_path = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
)

module.exports = class Cart {
    static addProduct(id, productPrice){
        fs.readFile(file_path, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if (!err) {
                cart = JSON.parse(fileContent)
            }

            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].qty++;
            }
            else {
                cart.products.push({id, qty: 1});
            }

            cart.totalPrice += +productPrice;

            fs.writeFile(file_path, JSON.stringify(cart), err => {
                if (err){
                    console.log(err);
                }
            })
        });

    }

    static deleteProduct(id, productPrice){
        fs.readFile(file_path, (err, fileContent) => {
            if(err) return;

            const cart = JSON.parse(fileContent);
            const product = cart.products.find(prod => prod.id == id);
            
            if (!product) return;
            
            const quantity = product.qty;
            
            const updatedCart = { 
                products: cart.products.filter(prod => prod.id !== id),
                totalPrice: cart.totalPrice - +productPrice * quantity
            };

            if (updatedCart.products.length == 0){
                fs.unlink(file_path, (err) => {
                    if (err){
                        console.log(err);
                    }
                    console.log("Cart file deleted");
                })
            }
            else{
                fs.writeFile(file_path, JSON.stringify(updatedCart), err => {
                    if (err){
                        console.log(err);
                    }
                })
            }

        })
    }
}