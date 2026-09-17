const Product      = require('../models/Product');            // Sequelize
const ProductImage = require('../models/ProductImage');       // Mongoose
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/supabaseStorage');

// helper: keep only one primary image per product
async function ensureSinglePrimary(productId, currentImageId) {
  await ProductImage.updateMany(
    { productId, _id: { $ne: currentImageId } },
    { $set: { isPrimary: false } }
  );
}

/**
 * POST /api/products/:productId/images
 * body (multipart): { image: <file>, isPrimary?: "true" }
 */
// exports.addImage = async (req, res, next) => {
//   try {
//     const { productId } = req.params;

//     // 1️⃣ check product exists in SQL
//     const product = await Product.findByPk(productId);
//     if (!product) return res.status(404).json({ msg: 'Product not found' });

//     // 2️⃣ pick url (local or your cloud service)
//     // const url       = req.file?.path;              
//      const url = req.file ? req.file.path : req.body.url;
//   if (!url) {    
//      return res.status(400).json({ msg: 'Provide an image file or a url field' });
//    }
//     const isPrimary = req.body.isPrimary === 'true';

//     const doc = await ProductImage.create({ productId, url, isPrimary });

//     if (isPrimary) await ensureSinglePrimary(productId, doc._id);

//     res.status(201).json(doc);
//   } catch (err) { next(err); }
// };

exports.addImage = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // 1️⃣ Check product exists in SQL
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    // 2️⃣ Pick image url from upload or body
    let url = req.body.url;
    if (req.file) {
      const uploaded = await uploadImage(req.file, 'products');
      url = uploaded.url;
    }
    if (!url) {
      return res.status(400).json({ msg: 'Provide an image file or a url field' });
    }

    // 3️⃣ Check if any existing image for this product has isPrimary: true
    const hasPrimary = await ProductImage.exists({ productId, isPrimary: true });

    // 4️⃣ Determine isPrimary for the new image
    let isPrimary;
    if (!hasPrimary) {
      // No primary image yet, force this one to primary
      isPrimary = true;
    } else {
      // Respect what user sent, default to false
      isPrimary = req.body.isPrimary === 'true';
    }

    // 5️⃣ Create the image document
    const doc = await ProductImage.create({ productId, url, isPrimary });

    // 6️⃣ If new image isPrimary, unset isPrimary on others
    if (isPrimary) await ensureSinglePrimary(productId, doc._id);

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};



exports.getImagesByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Optionally: verify product exists in SQL
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    const images = await ProductImage.find({ productId }).sort({ isPrimary: -1, createdAt: 1 });


    res.json({
      product,
      images
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    // 1️⃣ Check if the image exists
    const image = await ProductImage.findOne({ _id: imageId, productId });
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // 2️⃣ Remove the stored file (no-op if it wasn't a Supabase Storage URL)
    await deleteImage(image.url);

    // 3️⃣ Delete the document from MongoDB
    await ProductImage.deleteOne({ _id: imageId });

    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    next(err);
  }
};