const express   = require('express');
const upload    = require('../middleware/upload');        
const ctrl      = require('../controllers/veterinarianImageController');

const router = express.Router({ mergeParams: true });

router.post(   '/:veterinarianId/image',                        upload.single('image'), ctrl.addImage);
// router.put(    '/:imageId',               upload.single('image'), ctrl.updateImage);
router.delete( '/:veterinarianId/image/:imageId',                                           ctrl.deleteImage);
router.get('/:veterinarianId/image', ctrl.getImagesByVeterinarian);
module.exports = router;