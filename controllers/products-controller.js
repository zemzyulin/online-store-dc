import sql from '../models/database.js';
import { validationResult } from 'express-validator';
import { checkId } from '../middleware/validation.js';

export async function getAll(req, res) {
    try {
        // sql select query
        let products = await sql`SELECT id, name, description, category, price, quantity FROM product`;
        res.status(200).send(products);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}

export async function addOne(req, res) {
    try {
        // 1. result of req.body validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let { name, description, category, price, quantity } = req.body;
        
        // 2. insert data into db
        let product = await sql`INSERT
            INTO product (name, description, category, price, quantity)
            VALUES (${name}, ${description}, ${category}, ${price}, ${quantity})
            RETURNING id, name, description, category, price, quantity`;
             
        res.status(200).send(product[0]);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}

export async function getOne(req, res) {
    try {
        // 1. result of id sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        // 2. check product in database
        let product = await checkId(req.params.id, 'product');
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.status(200).send(product)
    } catch (error) {
        res.status(400).send(error)
    }
}


export async function updateOne(req, res) {
    try {
        // 1. result of id sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        // 2. check product in database
        let product = await checkId(req.params.id, 'product');
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        
        // 3. map updated OR unchanged fields
        let id = product["id"];
        let name = req.body["name"] || product["name"];
        let description = req.body["description"] || product["description"];
        let category = req.body["category"] || product["category"];
        let price = req.body["price"] || product['price'];
        let quantity = req.body["quantity"] || product['quantity'];
        
        // 4. sql update query
        let updatedProduct = await sql`UPDATE product
            SET name = ${name},
                description = ${description},
                category = ${category},
                price = ${price},
                quantity = ${quantity}
            WHERE id = ${id}
            RETURNING id, name, description, category, price, quantity`;
        
        res.status(200).send(updatedProduct[0]);
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
}

export async function deleteOne(req, res) {
    try {
        // 1. result of id sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        // 2. check product in database
        let product = await checkId(req.params.id, 'product');
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        
        // 3. delete product
        let id = product["id"];
        await sql`DELETE FROM product WHERE id = ${id}`

        res.status(204).send()
    } catch (error) {
        res.status(400).send(error)
    }
}