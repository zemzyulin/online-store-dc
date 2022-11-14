import express from 'express';
import { getAll, addOne, getOne, updateOne, deleteOne } from '../controllers/products-controller.js';
import { validate, authenticate } from '../middleware/validation.js';

const router = express.Router();

// get all products
router.get('/', getAll);
// add one products
router.post('/', validate("addProduct"), authenticate, addOne);
// get one product
router.get('/:id', validate("sanitizeId"), getOne);
// update one user by id
router.put('/:id', validate("sanitizeId"), validate("updateProduct"), authenticate, updateOne);
// delete one product
router.delete('/:id', validate("sanitizeId"), authenticate, deleteOne);



// CART ACTIONS
// This route adds this product to cart
router.get('/:id/cart', (req, res) => {
    res.send('i go to cart')
});


export default router;