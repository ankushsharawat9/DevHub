import Category from '../models/Category.js';
import slugify from 'slugify';

// ✅ Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });

    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await new Category({ name, slug }).save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Create Category Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error('Get Categories Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
