import express from 'express';
import { showUserOrders, createOrder, deleteOrder, updateOrderStatus } from '../controllers/orders-controller.js';
import { authenticate, validate } from '../middleware/validation.js';
const router = express.Router();

// show all user's orders
router.get('/', authenticate, showUserOrders);

// create order
router.post('/', authenticate, createOrder);

// cancel (delete) order
router.delete('/:id', validate("sanitizeId"), authenticate, deleteOrder);

// update oreder status
router.put('/:id', validate("sanitizeId"), authenticate, updateOrderStatus);


export default router;