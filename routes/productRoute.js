const express = require('express');

const router = express.Router();
const { createProduct,
  getaProduct,
  updateProduct,
  deleteProduct,
  getallProduct,
  addToWishlist,
  rating,
  uploadImages } = require('../controller/productCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddlewares');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

router.post('/create-product', authMiddleware, isAdmin, createProduct);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages);
router.put('/wishList', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.get('/:id', getaProduct);

router.get('/', getallProduct);
router.put('/:id', updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
