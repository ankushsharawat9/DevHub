import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 🔧 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🗂️ Define Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'devhub_products', // or any other folder
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// ✅ Create upload middleware
const upload = multer({ storage });

// ✅ Correct Exports
export { cloudinary }; // optional named export
export default upload; // ✅ DEFAULT EXPORT
