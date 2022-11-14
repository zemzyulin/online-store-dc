import express from 'express';
import { login, logout } from '../controllers/index-controller.js';
import { validate, authenticate } from '../middleware/validation.js';

const router = express.Router();

// main page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Online Store' });
});

// login user 
router.post('/api/login', validate("loginUser"), login);

// logout user
router.get('/api/logout', authenticate, logout);


export default router;
