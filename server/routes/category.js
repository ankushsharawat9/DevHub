import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🛡️ Protected admin route to create a category
router.post('/', verifyToken, isAdmin, createCategory);


// 🌐 Public route to fetch all categories
router.get('/', getCategories);

export default router;
