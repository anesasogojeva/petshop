const express   = require('express');
const upload    = require('../middleware/upload');         
const ctrl      = require('../controllers/productImageController');

const router = express.Router({ mergeParams: true });

router.post(   '/:productId/image',                        upload.single('image'), ctrl.addImage);
// router.put(    '/:imageId',               upload.single('image'), ctrl.updateImage);
router.delete( '/:productId/image/:imageId',                                           ctrl.deleteImage);
router.get('/:productId/image', ctrl.getImagesByProduct);
module.exports = router;