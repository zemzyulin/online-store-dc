import sql from '../models/database.js';
import { validationResult } from 'express-validator';

// list all current user's orders
export async function showUserOrders(req, res) {
    try {
        let orders = await sql`SELECT id, user_id, status, total FROM orders WHERE user_id = ${req.session.user["id"]}`;
        if (!orders[0]) {
            return res.status(404).send({ message: 'Orders not found' });
        }
        res.status(200).send(orders);
    } catch (error) {
        res.status(400).send(error);
    }
}

// move items from basket to order
export async function createOrder(req, res) {
    try {
        // 1. check if cart exists and if it is not empty
        let cart = await sql`SELECT
            id, user_id, session, total
            FROM cart
            WHERE user_id = ${req.session.user["id"]} AND session = ${req.sessionID}`
        if (!cart[0]) {
            return res.status(400).send("Cannot create order: cart not found.");
        }
        if (cart[0].total <= 0) {
            return res.status(400).send("Cannot create order: cart is empty.");
        }
        // 2. check every item in cart for availability
        let cartItems = await sql`SELECT
            cart.product_id,
            cart.quantity AS req_quantity,
            p.name AS name,
            p.quantity AS avail_quantity
            FROM
            (SELECT * FROM cart_item WHERE cart_id = ${cart[0].id}) as cart
            JOIN product AS p
            ON cart.product_id = p.id;`
        if (!cartItems[0]) {
            return res.status(400).send("Cannot create order: one or more products are missing in database.");
        }
        let missingItems = [];
        cartItems.forEach(item => {
            if (item.req_quantity > item.avail_quantity) {
                missingItems.push(item.name, item.avail_quantity);
            }
        })
        if (missingItems.length > 0) {
            return res.status(400).send({ "missing items": missingItems });
        }
        
        // 3. create order order
        const order = await sql`INSERT
            INTO orders (user_id, status, total)
            VALUES (${req.session.user["id"]}, ${"Created"}, ${cart[0].total})
            RETURNING id, user_id, status, total`;

        // 4. create order items and update inventory
        cartItems.forEach(async function(item) {
            await sql`INSERT
                INTO order_item (order_id, product_id, quantity)
                VALUES (${order[0].id}, ${item.product_id}, ${item.req_quantity})`
            await sql`UPDATE
                product
                SET quantity = quantity - ${item.req_quantity}
                WHERE id = ${item.product_id}`
        })

        // delete cart
        await sql`DELETE FROM cart WHERE id = ${cart[0].id}`

        // response
        res.status(200).send(order[0]);
    } catch (error) {
        res.status(400).send(error);
    }
}

export async function deleteOrder(req, res) {
    try {
        const orderId = req.params.id;
        
        // 1. result of req.params validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // get order
        let order = await sql`SELECT
            id, user_id, status, total
            FROM orders
            WHERE id = ${orderId}`
        if (!order[0]) {
            return res.status(400).send("Order not found.");
        }
        if (order[0].user_id.toString() !== req.session.user["id"].toString()) {
            return res.status(403).send("You are not authorized to access this order");
        }

        // get order items
        let orderItems = await sql`SELECT
            id, order_id, product_id, quantity
            FROM order_item
            WHERE order_id = ${orderId}`

        // bring items back to db 
        orderItems.forEach(async function(item) {
            await sql`UPDATE
                product
                SET quantity = quantity + ${item.quantity}
                WHERE id = ${item.product_id}`
        })

        // delete order
        await sql`DELETE FROM orders WHERE id = ${orderId}`

        // response
        res.status(204).send()
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}


// DO I NEED THIS ???

export async function updateOrderStatus(req, res) {
    try {
        // validate params.id
        // sql select query

        // response
        res.status(200).send()
    } catch (error) {
        res.status(400).send(error);
    }
}