import express from 'express';
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  searchProducts, // 🔍 Search controller
} from '../controllers/productController.js';

import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js'; // 📸 Cloudinary upload middleware

const router = express.Router();

// 🔐 Admin: Create product (requires auth, admin, and file upload)
router.post('/', verifyToken, isAdmin, upload.single('photo'), createProduct);

// 🔍 Public: Search products (must be BEFORE '/:slug' to avoid conflict)
router.get('/search', searchProducts);

// 🌐 Public: Get all products
router.get('/', getAllProducts);

// 🌐 Public: Get a single product by slug
router.get('/:slug', getSingleProduct);

// 🔄 Admin: Update product (requires auth, admin, and optional image upload)
router.put('/:productId', verifyToken, isAdmin, upload.single('photo'), updateProduct);

// 🗑️ Admin: Delete product (requires auth and admin)
router.delete('/:productId', verifyToken, isAdmin, deleteProduct);

export default router;
