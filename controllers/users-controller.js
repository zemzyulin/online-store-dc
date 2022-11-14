import sql from '../models/database.js';
import { validationResult } from 'express-validator';
import { checkId } from '../middleware/validation.js';
import bcrypt from 'bcryptjs';
const saltRounds = 10;

export async function getAll(req, res) {
    try {
        // sql select query
        let users = await sql`SELECT id, email, first_name, last_name FROM users`;
        res.status(200).send(users);
    } catch (error) {
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
        
        let { email, password, firstName, lastName } = req.body;

        // 2. hash password with bcrypt and insert data into db
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            let user = await sql`INSERT
                INTO users (email, password, first_name, last_name)
                VALUES (${email}, ${hash}, ${firstName}, ${lastName})
                RETURNING id, email, first_name, last_name`;
            res.redirect('/');
        });
    } catch (error) {
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
        
        // 2. check user in database
        let user = await checkId(req.params.id, 'users');
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        
        // 3. remove password and send response
        delete user["password"];
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error)
    }
}

export async function updateOne(req, res) {
    try {
        // 1. result of req.body validation + id sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // 2. check user in database
        let user = await checkId(req.params.id, 'users');
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // 3. map updated OR unchanged fields
        let id = user["id"];
        let email = req.body["email"] || user["email"];
        let password = req.body["password"] || user["password"];
        let firstName = req.body["first_name"] || user["first_name"];
        let lastName = req.body["last_name"] || user['last_name'];

        // 4. sql update query
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            let updatedUser = await sql`UPDATE users
                SET email = ${email},
                    password = ${hash},
                    first_name = ${firstName},
                    last_name = ${lastName}
                WHERE id = ${id}
                RETURNING id, email, first_name, last_name`;
            res.status(200).send(updatedUser[0]);
        });
    } catch (error) {
        res.status(400).send(error);
    }
}

export async function deleteOne(req, res) {
    try {
        // 1. result of id sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // 2. check user in database
        let user = await checkId(req.params.id, 'users');
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // 3. delete user
        let id = user["id"];
        await sql`DELETE FROM users WHERE id = ${id}`

        res.status(204).send()
    } catch (error) {
        res.status(400).send(error);
    }
}