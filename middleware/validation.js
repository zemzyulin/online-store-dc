import { body, param } from 'express-validator'
import sql from '../models/database.js';

// main validation for req.body and req.params
export function validate(method) {
  switch (method) {
    case 'addUser': {
      return [ 
        body('email', 'Invalid email').exists().isEmail(),
        body('password', 'Invalid password').exists().isLength({min: 5, max: 70}),
        body('firstName', "Please provide first name").exists(),
        body('lastName', "Please provide last name").exists()
      ]
    }
    case 'updateUser': {
      return [
        body('email', 'Invalid email').isEmail().optional(),
        body('password', 'Invalid password').isLength({min: 5, max: 70}).optional()
      ]
    }
    case 'loginUser': {
      return [
        body('email', 'Invalid email').exists().isEmail(),
        body('password', 'Invalid password').exists(),
      ]
    }
    case 'sanitizeId': {
      return [
        param('id', 'Invalid id').isNumeric({ no_symbols: true })
      ]
    }
    case 'addProduct': {
      return [
        body('name', 'Invalid name').exists().isLength({min: 2}),
        body('description', 'Invalid description').exists().isLength({min: 5}),
        body('category', 'Invalid category').exists().isLength({min: 2}),
        body('price', 'Invalid price').exists().isNumeric(),
        body('quantity', 'Invalid quantity').exists().isInt()
      ]
    }
    case 'updateProduct': {
      return [
        body('name', 'Invalid name').optional().isLength({min: 2}),
        body('description', 'Invalid description').optional().isLength({min: 5}),
        body('category', 'Invalid category').optional().isLength({min: 2}),
        body('price', 'Invalid price').optional().isNumeric(),
        body('quantity', 'Invalid quantity').optional().isInt()
      ]
    }
    case 'cartItems': {
      return [
        body('productId', 'Invalid product id').exists().isNumeric({ no_symbols: true }),
        body('quantity', 'Invalid quantity').exists().isInt({ min: 1 })
      ]
    }
  }
}

// check user id in database
export async function checkId(id, tablename) {
    try {
        switch (tablename) {
          case 'users': {
            let user = await sql`SELECT id, email, password, first_name, last_name FROM users WHERE id = ${id}`
            return user[0];
          }
          case 'product': {
            let product = await sql`SELECT id, name, description, category, price, quantity FROM product WHERE id = ${id}`
            return product[0];
          }
        }
    } catch (error) {
        console.log(error)
    }
}

// check user email in database
export async function checkEmail(email) {
    try {
        // query db
        let user = await sql`SELECT id, email, password, first_name, last_name FROM users WHERE email = ${email}`
        return user[0];
    } catch (error) {
        console.log(error);
    }
}

// check if user is authenticated
export function authenticate(req, res, next) {  
    if (!req.session.authenticated) {
        return res.status(403).send({ message: "Please login" });
    } else {
        next();
    }
}

// check if user is authorized for certain actions
export function authorizeUser(req, res, next) {  
    if (req.session.user.id.toString() !== req.params.id.toString()) {
        return res.status(403).send({ message: "You are not authorized to view this page" });
    } else {
        next();
    }
}

// ensure user is logged out when registering new user
export function ensureLogout(req, res, next) {
    if (req.session.authenticated) {
      req.session.user = null;
      req.session.authenticated = false;
    }
    next();
}