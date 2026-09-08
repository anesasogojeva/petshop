const express   = require('express');
const upload    = require('../middleware/upload');         
const ctrl      = require('../controllers/PetImageController');

const router = express.Router({ mergeParams: true });

router.post(   '/:petId/image',                        upload.single('image'), ctrl.addImage);
router.delete( '/:petId/image/:imageId',                                           ctrl.deleteImage);
router.get('/:petId/image', ctrl.getImagesByPet);
module.exports = router;