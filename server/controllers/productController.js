import Product from '../models/Product.js';
import slugify from 'slugify';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping, photo } = req.body;
    const slug = slugify(name);

    const product = new Product({
      name,
      slug,
      description,
      price,
      category,
      quantity,
      shipping,
      photo, // URL from frontend or Cloudinary
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Product creation failed' });
  }
};

export const getAllProducts = async (req, res) => {
  const products = await Product.find()
    .populate('category')
    .sort({ createdAt: -1 });
  res.json(products);
};
