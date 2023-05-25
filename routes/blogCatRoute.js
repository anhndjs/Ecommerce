const express = require('express');

const router = express.Router();
const { createCategory, updateCategory, deleteCategory, getCategory, getallCategory } = require('../controller/blogCatCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares');

router.post('/create', authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);
router.get('/:id', authMiddleware, isAdmin, getCategory);
router.get('/', authMiddleware, isAdmin, getallCategory);

module.exports = router;
