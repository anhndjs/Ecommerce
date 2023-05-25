const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uniqid = require('uniqid');
const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const validateMongoDbId = require('../utils/validateMongodb');
const { generateRefreshTokenToken } = require('../config/refreshToken');
const sendEmail = require('./emailCtrl');

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error('user already exist');
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshTokenToken(findUser.id);
    await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken,
      },
      {
        new: true,
      },
    );
    res.cookie(
      'refreshToken',
      refreshToken,
      { httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000 },
    );
    res.json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateToken(findUser._id),
    });
  } else {
    throw new Error('invalid creden');
  }
});
const loginAmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== 'admin') throw new Error('Not Authorised');
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshTokenToken(findAdmin.id);
    await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken,
      },
      {
        new: true,
      },
    );
    res.cookie(
      'refreshToken',
      refreshToken,
      { httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000 },
    );
    res.json({
      _id: findAdmin._id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateToken(findAdmin._id),
    });
  } else {
    throw new Error('invalid creden');
  }
});
// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res, next) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error('no refresh token in cookies');
  const { refreshToken } = cookie;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error('no refresh token present in db or not matched');
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('there is something wrong with refresh token');
    }
    const accessToken = generateToken(user._id);
    res.json({ accessToken });
  });
});
// logout
const logout = asyncHandler(async (req, res, next) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error('no refresh token in cookies');
  const { refreshToken } = cookie;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(refreshToken, { refreshToken: '' });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204);
});

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req.body.address,

      },
      {
        new: true,
      },
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});
const getallUser = asyncHandler(async (req, res, next) => {
  try {
    const findallUser = await User.find();
    res.json(findallUser);
  } catch (error) {
    throw new Error(error);
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const findUser = await User.findById({ _id: id });
    if (findUser) {
      res.json(findUser);
    } else {
      throw new Error('invalid creden');
    }
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await User.findByIdAndDelete({ _id: id });
    if (findUser) {
      res.json(findUser);
    } else {
      throw new Error('invalid creden');
    }
  } catch (error) {
    throw new Error(error);
  }
});

const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const updateUS = await User.findByIdAndUpdate(_id, {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      mobile: req.body.mobile,
    }, { new: true });
    res.json(updateUS);
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res, nex) => {
  const { id } = req.params;
  try {
    validateMongoDbId(id);

    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },

      { new: true },
    );
    res.json({
      message: 'user have block',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res, nex) => {
  const { id } = req.params;
  try {
    validateMongoDbId(id);

    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },

      { new: true },
    );
    res.json({
      message: 'user have unblock',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePW = await user.save();
    res.json(updatePW);
  } else {
    res.json(user);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error('user not found with this email');
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `hi. please follow this link to reset your password/ this link is calid till 10 minutes from now <a href='http://localhost:5000/api/user/reset-password/${token}'> Click Here/a>`;
    const data = {
      to: email,
      text: 'hey User',
      subject: 'forgot pasword link',
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('token epired, please try again laer');
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate('wishlist');
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    // eslint-disable-next-line prefer-const
    let products = [];
    const user = await User.findById(_id);
    console.log(user);
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });

    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      // eslint-disable-next-line prefer-const
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      // eslint-disable-next-line prefer-const
      let getPrice = await Product.findById(cart[i]._id).select('price').exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].price * products[i].count;
    }
    const newCart = await new Cart({ products, cartTotal, orderby: user._id }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getuserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate('products.product');
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findByIdAndRemove({ orderby: user._id });
    res.json({ cart });
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error('invalid coupon');
  }
  const user = await User.findOne({ _id });
  const { products, cartTotal } = await Cart.findOne({ orderby: user._id }).populate('products.product');
  const totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true },
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error('create cash order failed');
    const user = await User.findById(_id);
    const userCarts = await Cart.findOne({ orderby: user._id });
    let finalAmout = 0;
    if (couponApplied && userCarts.totalAfterDiscount) {
      finalAmout = userCarts.totalAfterDiscount * 100;
    } else {
      finalAmout = userCarts.cartTotal * 100;
    }
    const newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: 'COD',
        amount: finalAmout,
        status: 'Cash on Delevery',
        created: Date.now(),
        currency: 'usd',
      },
      orderby: user._id,
      orderStatus: 'Cash on Delevery',
    }).save();
    const update = userCarts.products.map(item => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: success });
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createUser,
  loginAmin,
  getallUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  loginUserCtrl,
  getWishlist,
  saveAddress,
  userCart,
  getuserCart,
  emyCart,
  applyCoupon,
  createOrder,
};
