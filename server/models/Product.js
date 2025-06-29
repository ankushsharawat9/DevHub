import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    shipping: { type: Boolean, default: false },
    photo: { type: String }, // Cloudinary URL
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
