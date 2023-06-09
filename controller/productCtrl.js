const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const fs = require('fs');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const validateMongoDbId = require('../utils/validateMongodb');
const cloudinaryUploadImg = require('../utils/cloudinary');

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json({ newProduct });
  } catch (error) {
    throw new Error(error);
  }
});
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateaProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({ updateaProduct });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: ' delete success' });
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getallProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    // sorting
    if (req.query.sort) {
      const sortBy = req.query.fields.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    // pagination
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error('this page does not exist');
    }
    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishList.find(id => id.toString() === prodId);
    if (alreadyadded) {
      const users = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        },
      );
      res.json(users);
    } else {
      const users = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        },
      );
      res.json(users);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    const alreadyRated = product.ratings.find(
      userId => userId.postedby.toString() === _id.toString(),
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
        },
        {
          new: true,
        },

      );
      res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star,
              comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        },
      );
      res.json(rateProduct);
    }
    const getallratings = await Product.findById(prodId);
    const totalRating = getallratings.ratings.length;
    const ratingsum = getallratings.ratings
      .map(item => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    const actualRating = Math.round(ratingsum / totalRating);
    const finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true },
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const uploader = path => cloudinaryUploadImg(path, 'images');
    const urls = [];
    const { files } = req;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
      // fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map(file => file),
      },
      {
        new: true,
      },
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { createProduct,
  getaProduct,
  updateProduct,
  deleteProduct,
  getallProduct,
  addToWishlist,
  rating,
  uploadImages };
