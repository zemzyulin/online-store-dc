import express from 'express';
import { getAll, addOne, getOne, updateOne, deleteOne } from '../controllers/users-controller.js';
import { validate, authenticate, authorizeUser, ensureLogout } from '../middleware/validation.js';

const router = express.Router();

// get all users
router.get('/', authenticate, getAll);
// register new user
router.post('/', validate("addUser"), ensureLogout, addOne);
// get one user by id
router.get('/:id', validate("sanitizeId"), authenticate, authorizeUser, getOne);
// update one user by id
router.put('/:id', validate("sanitizeId"), validate("updateUser"), authenticate, authorizeUser, updateOne);
// delete one user by id
router.delete('/:id', validate("sanitizeId"), authenticate, authorizeUser, deleteOne);

export default router;