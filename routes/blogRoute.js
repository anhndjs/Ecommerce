const express = require('express');
const { createBlog, updateBlog, getBlog, getallBlog, deleteBlog, likeBlog, disliketheBlog, uploadImages } = require('../controller/blogCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares');
const { uploadPhoto, productImgResize, blogImgResize } = require('../middlewares/uploadImages');

const router = express.Router();

router.post('/create-blog', authMiddleware, isAdmin, createBlog);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 10), blogImgResize, uploadImages);

router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, disliketheBlog);

router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.delete('/:id', deleteBlog);
router.get('/:id', getBlog);
router.get('/', getallBlog);

module.exports = router;
