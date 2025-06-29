import Product from '../models/Product.js';
import slugify from 'slugify';

// ✅ Create a new product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;

    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const product = new Product({
      name,
      slug: slugify(name.toLowerCase()),
      description,
      price: parseFloat(price),
      category,
      quantity: parseInt(quantity),
      photo: {
        public_id: req.file.filename,
        url: req.file.path,
      },
    });

    await product.save();

    res.status(201).json({
      message: '✅ Product created successfully',
      product,
    });
  } catch (err) {
    console.error('❌ Product creation failed:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name slug');
    res.status(200).json(products);
  } catch (err) {
    console.error('❌ Failed to fetch products:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Get a single product by slug
export const getSingleProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (err) {
    console.error('❌ Error fetching product:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔄 Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, category, quantity } = req.body;

    product.name = name || product.name;
    product.slug = name ? slugify(name.toLowerCase()) : product.slug;
    product.description = description || product.description;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.quantity = quantity !== undefined ? parseInt(quantity) : product.quantity;

    if (req.file && req.file.path) {
      product.photo = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    await product.save();

    res.status(200).json({
      message: '✅ Product updated successfully',
      product,
    });
  } catch (err) {
    console.error('❌ Product update failed:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🗑️ Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: '🗑️ Product deleted successfully' });
  } catch (err) {
    console.error('❌ Delete failed:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔍 Search & filter products
export const searchProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    let sortOption = {};
    if (sort === 'price') sortOption.price = 1;
    else if (sort === 'price-desc') sortOption.price = -1;

    const products = await Product.find(query)
      .sort(sortOption)
      .populate('category', 'name slug');

    res.status(200).json(products);
  } catch (err) {
    console.error('❌ Search failed:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
