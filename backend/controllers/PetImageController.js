const Pet      = require('../models/Pet');            // Sequelize
const PetImage = require('../models/PetImage');       // Mongoose
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


async function ensureSinglePrimary(petId, currentImageId) {
  await PetImage.updateMany(
    { petId, _id: { $ne: currentImageId } },
    { $set: { isPrimary: false } }
  );
}


exports.addImage = async (req, res, next) => {
  try {
    const { petId } = req.params;

    // 1️⃣ Check pet exists in SQL
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ msg: 'Pet not found' });

    // 2️⃣ Pick image url from upload or body
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).json({ msg: 'Provide an image file or a url field' });
    }

    // 3️⃣ Check if any existing image for this pet has isPrimary: true
    const hasPrimary = await PetImage.exists({ petId, isPrimary: true });

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
    const doc = await PetImage.create({ petId, imageUrl, isPrimary });

    // 6️⃣ If new image isPrimary, unset isPrimary on others
    if (isPrimary) await ensureSinglePrimary(petId, doc._id);

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};



exports.getImagesByPet = async (req, res, next) => {
  try {
    const { petId } = req.params;

    // Optionally: verify pet exists in SQL
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ msg: 'Pet not found' });

    const images = await PetImage.find({ petId }).sort({ isPrimary: -1, createdAt: 1 });


    res.json({
      pet,
      images
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { petId, imageId } = req.params;

    // 1️⃣ Check if the image exists
    const image = await PetImage.findOne({ _id: imageId, petId });
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // 2️⃣ Optionally delete from filesystem if stored locally
    // Only do this if you know the image is stored locally (not a cloud URL)
    const isLocalPath = image.imageUrl && !image.imageUrl.startsWith('http');
    if (isLocalPath) {
      const filePath = path.resolve(image.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3️⃣ Delete the document from MongoDB
    await PetImage.deleteOne({ _id: imageId });

    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    next(err);
  }
};