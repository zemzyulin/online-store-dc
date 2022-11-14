import sql from '../models/database.js';
import { validationResult } from 'express-validator';

export async function showCart(req, res) {
    try {        
        // 1. create new cart if none exists
        const cart = await checkCreateCart(req.session.user["id"], req.sessionID);
        // 2. remove sessionId and send response
        delete cart["session"];
        res.status(200).send(cart)
    } catch (error) {
        res.status(400).send(error)
    }
}

export async function addItemToCart(req, res) {
    try {
        const productId = req.body.productId;
        const quantity = req.body.quantity;
        
        // 1. create new cart if none exists
        const cart = await checkCreateCart(req.session.user["id"], req.sessionID);
        
        // 2. result of req.body validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        // 3. check availability of products
        const product = await sql`SELECT
            id, price, quantity
            FROM product
            WHERE id = ${productId}`
        if (!product[0]) {
            return res.status(400).send({ message: "Product not found. Check id." });
        } else if (quantity > product[0].quantity) {
            return res.status(400).send({ message: "Insufficient quantity." });
        }

        // 4. create or update existing cart_item
        let cartItem = await sql`SELECT
            id, cart_id, product_id, quantity
            FROM cart_item
            WHERE cart_id = ${cart.id} AND product_id = ${productId}`
        if (!cartItem[0]) {
            cartItem = await sql`INSERT
                INTO cart_item (cart_id, product_id, quantity)
                VALUES (${cart.id}, ${productId}, ${quantity})
                RETURNING id, cart_id, product_id, quantity`;
        } else {
            cartItem = await sql`UPDATE
                cart_item
                SET quantity = quantity + ${quantity}
                WHERE cart_id = ${cart.id} AND product_id = ${productId}`
        }

        // 5. update cart total
        const cartItemTotal = Number(product[0].price) * Number(quantity);
        const updatedCart = await sql`UPDATE
            cart
            SET total = total + ${cartItemTotal}
            WHERE id = ${cart.id}
            RETURNING id, user_id, total`

        // response
        res.status(200).send(updatedCart[0]);
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
}

export async function removeItemFromCart(req, res) {
    try {
        const productId = req.body.productId;
        const quantity = req.body.quantity;

        // 1. Get cart and return if none found
        let cart = await sql`SELECT
            id, user_id, session, total
            FROM cart
            WHERE user_id = ${req.session.user["id"]} AND session = ${req.sessionID}`
        if (!cart[0]) {
            return res.status(400).send("Cart not found. Nothing no remove.")
        }

        // 2. result of req.body validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // 3. get cart_item to remove from
        let cartItem = await sql`SELECT
            id, cart_id, product_id, quantity
            FROM cart_item
            WHERE cart_id = ${cart[0].id} AND product_id = ${productId}`
        
        // 4. validate product and quantity in cart_item
        if (!cartItem[0]) {
            return res.status(400).send({ message: "Unable to remove: product not in cart." });
        } else if (cartItem[0].quantity < quantity) {
            return res.status(400).send({ message: "Unable to remove: quantity to remove is larger than quantity in cart." });
        }

        // 5. Remove items
        cartItem = await sql`UPDATE
            cart_item
            SET quantity = quantity - ${quantity}
            WHERE cart_id = ${cart[0].id} AND product_id = ${productId}`
        
        // 6. Update cart total
        const product = await sql`SELECT
            id, price, quantity
            FROM product
            WHERE id = ${productId}`    
        const cartItemTotal = Number(product[0].price) * Number(quantity);
        const updatedCart = await sql`UPDATE
            cart
            SET total = total - ${cartItemTotal}
            WHERE id = ${cart[0].id}
            RETURNING id, user_id, total`

        // response
        res.status(200).send(updatedCart[0]);
    } catch (error) {
        res.status(400).send(error)
    }
}

export async function emptyCart(req, res) {
    try {
        // 1. get cart and return if none found
        let cart = await sql`SELECT
            id, user_id, session, total
            FROM cart
            WHERE user_id = ${req.session.user["id"]} AND session = ${req.sessionID}`
        if (!cart[0]) {
            return res.status(400).send("Cannot empty: cart not found.");
        } else if (cart[0].total <= 0) {
            return res.status(400).send("Cannot empty: cart already empty.");
        }

        // 2. drop cart (all its cart_items should ON DELETE CASCADE)
        await sql`DELETE FROM cart WHERE user_id = ${req.session.user["id"]} AND session = ${req.sessionID}`

        // empty response
        res.status(204).send()
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}


// helper functions

async function checkCreateCart(userId, sessionId) {
        // 1. Check if cart already exists
        let cart = await sql`SELECT
            id, user_id, session, total
            FROM cart
            WHERE user_id = ${userId} AND session = ${sessionId}`
        // 2. If it doesn't exist, create a new cart
        if (!cart[0]) {
            cart = await sql`INSERT
            INTO cart (user_id, session)
            VALUES (${userId}, ${sessionId})
            RETURNING id, user_id, session, total`;
        }
    return cart[0];
}