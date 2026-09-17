const Veterinarian      = require('../models/Veterinarian');            // Sequelize
const VeterinarianImage = require('../models/VeterinarianImage');       // Mongoose
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/supabaseStorage');

// helper: keep only one primary image per veterinarian
async function ensureSinglePrimary(veterinarianId, currentImageId) {
  await VeterinarianImage.updateMany(
    { veterinarianId, _id: { $ne: currentImageId } },
    { $set: { isPrimary: false } }
  );
}

/**
 * POST /api/veterinarians/:veterinarianId/images
 * body (multipart): { image: <file>, isPrimary?: "true" }
 */
// exports.addImage = async (req, res, next) => {
//   try {
//     const { veterinarianId } = req.params;

//     // 1️⃣ check veterinarian exists in SQL
//     const veterinarian = await Veterinarian.findByPk(veterinarianId);
//     if (!veterinarian) return res.status(404).json({ msg: 'Veterinarian not found' });

//     // 2️⃣ pick url (local or your cloud service)
//     // const url       = req.file?.path;              
//      const url = req.file ? req.file.path : req.body.url;
//   if (!url) {    
//      return res.status(400).json({ msg: 'Provide an image file or a url field' });
//    }
//     const isPrimary = req.body.isPrimary === 'true';

//     const doc = await VeterinarianImage.create({ veterinarianId, url, isPrimary });

//     if (isPrimary) await ensureSinglePrimary(veterinarianId, doc._id);

//     res.status(201).json(doc);
//   } catch (err) { next(err); }
// };

exports.addImage = async (req, res, next) => {
  try {
    const { veterinarianId } = req.params;

    // 1️⃣ Check veterinarian exists in SQL
    const veterinarian = await Veterinarian.findByPk(veterinarianId);
    if (!veterinarian) return res.status(404).json({ msg: 'Veterinarian not found' });

    // 2️⃣ Pick image url from upload or body
    let url = req.body.url;
    if (req.file) {
      const uploaded = await uploadImage(req.file, 'veterinarians');
      url = uploaded.url;
    }
    if (!url) {
      return res.status(400).json({ msg: 'Provide an image file or a url field' });
    }

    // 3️⃣ Check if any existing image for this veterinarian has isPrimary: true
    const hasPrimary = await VeterinarianImage.exists({ veterinarianId, isPrimary: true });

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
    const doc = await VeterinarianImage.create({ veterinarianId, url, isPrimary });

    // 6️⃣ If new image isPrimary, unset isPrimary on others
    if (isPrimary) await ensureSinglePrimary(veterinarianId, doc._id);

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};



exports.getImagesByVeterinarian = async (req, res, next) => {
  try {
    const { veterinarianId } = req.params;

    // Optionally: verify veterinarian exists in SQL
    const veterinarian = await Veterinarian.findByPk(veterinarianId);
    if (!veterinarian) return res.status(404).json({ msg: 'Veterinarian not found' });

    const images = await VeterinarianImage.find({ veterinarianId }).sort({ isPrimary: -1, createdAt: 1 });


    res.json({
      veterinarian,
      images
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { veterinarianId, imageId } = req.params;

    // 1️⃣ Check if the image exists
    const image = await VeterinarianImage.findOne({ _id: imageId, veterinarianId });
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // 2️⃣ Remove the stored file (no-op if it wasn't a Supabase Storage URL)
    await deleteImage(image.url);

    // 3️⃣ Delete the document from MongoDB
    await VeterinarianImage.deleteOne({ _id: imageId });

    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    next(err);
  }
};