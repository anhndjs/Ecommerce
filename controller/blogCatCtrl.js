const asyncHandler = require('express-async-handler');
const Category = require('../models/blogCatModel');
const validateMongoDbId = require('../utils/validateMongodb');

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatetheCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatetheCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deleteaCategory = await Category.findByIdAndDelete(id);
    res.json(deleteaCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const getaCategory = await Category.findById(id);
    res.json(getaCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getallCategory = asyncHandler(async (req, res) => {
  try {
    const getCategorys = await Category.find();
    res.json(getCategorys);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getallCategory };
