import express from 'express';
import { createProduct, getAllProducts } from '../controllers/productController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🛍️ Admin route to create a new product
router.post('/', verifyToken, isAdmin, createProduct);

// 🌐 Public route to get all products
router.get('/', getAllProducts);

export default router;
