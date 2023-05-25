const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');
const validateMongoDbId = require('../utils/validateMongodb');

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const getallCoupon = asyncHandler(async (req, res) => {
  try {
    const getCoupons = await Coupon.find();
    res.json(getCoupons);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const getCoupons = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json(getCoupons);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleteaCoupon = await Coupon.findByIdAndDelete(id);
    res.json(deleteaCoupon);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { createCoupon, getallCoupon, updateCoupon, deleteCoupon };
