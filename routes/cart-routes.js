import express from 'express';
import { showCart, addItemToCart, removeItemFromCart, emptyCart } from '../controllers/cart-controller.js';
import { authenticate, validate } from '../middleware/validation.js';
const router = express.Router();

// show user cart
router.get('/', authenticate, showCart);

// add item to cart
router.post('/add', authenticate, validate("cartItems"), addItemToCart);

// delete item from cart
router.post('/remove', authenticate, validate("cartItems"), removeItemFromCart);

// empty cart
router.delete('/emptycart', authenticate, emptyCart);

export default router;