const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const uniqid = require('uniqid');
const asyncHandler = require('express-async-handler');
const generateToken = require('../config/jwtToken');
const generateRefreshToken = require('../config/refreshToken');
const validateMongodbId = require('../utils/validateMongodbId');
const sendEmail = require('./emailController');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validate } = require('../models/orderModel');


// @desc: Creating a User 		@route: POST /api/users/register		@access:  Public
const registerUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const newUser = await User.create(req.body);

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email
    })
  } else {
    res.status(400);
    throw new Error('Invalid userdata');
  }
});

// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await user.isPasswordMatched(password)) {
    const refreshToken = generateRefreshToken(user._id);
    const updateUser = await User.findByIdAndUpdate(user._id, {
      refreshToken: refreshToken
    }, {
      new: true
    });
    const token = generateToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    });

    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      token: token
    });
  } else {
    res.status(400);
    throw new Error('Invalid Credentials');
  }
});


const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });

  if (admin.role !== 'admin') throw new Error('Not Authorised');

  if (admin && await admin.isPasswordMatched(password)) {
    const refreshToken = generateRefreshToken(admin._id);
    const updateAdmin = await User.findByIdAndUpdate(admin._id, {
      refreshToken: refreshToken
    }, {
      new: true
    });
    const token = generateToken(admin._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    });

    res.json({
      _id: admin._id,
      name: admin.name,
      mobile: admin.mobile,
      token: token
    });
  } else {
    res.status(400);
    throw new Error('Invalid Credentials');
  }
});



// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public  **
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users) {
    res.status(500);
    throw new Error('Didnt get users')
  }

  res.json(users);
});

// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public **
const getUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongodbId(_id);

  const user = await User.findById(_id);

  if (!user) {
    res.status(500)
    throw new Error('User not found');
  }

  res.json(user);
});

// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public **
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongodbId(_id);

  const deletedUser = await User.findByIdAndDelete(_id);

  res.json(deletedUser.id);
});

// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public **
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongodbId(_id);

  const updatedUser = await User.findByIdAndUpdate(_id, {
    name: req?.body?.name,
    email: req?.body?.email,
    mobile: req?.body?.mobile
  }, { new: true }
  );

  if (!updatedUser) {
    res.status(500);
    throw new Error('User update unsuccessful');
  }

  res.json(updatedUser);
});


const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongodbId(_id);
  try {
    const user = await User.findByIdAndUpdate(_id, {
      address: req?.body?.address
    }, {
      new: true
    });

    res.json(user)
  } catch (error) {
    throw new Error(error);
  }
})

// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public **
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const blockedUser = await User.findByIdAndUpdate(id, {
      isBlocked: true
    },
      {
        new: true
      });

    res.json({
      message: 'User Blocked'
    });

  } catch (error) {
    throw new Error(error)
  }
});

// @desc: Authenticating a User 		@route: POST /api/users/login		@access:  Public **
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);

  try {
    const unblockedUser = await User.findByIdAndUpdate(id, {
      isBlocked: false
    });

    res.json({
      message: 'User Unblocked'
    });

  } catch (error) {
    throw new Error(error)
  }
});

// handling refreshToken
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  if (!cookie) {
    throw new Error('Refresh Token Unavailable');
  }

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new Error('Cannot find Refresh Token');
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('Refresh Token is not valid');
    }

    const accessToken = generateToken(user._id);

    res.json({ accessToken });
  })
});


const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  if (!cookie) {
    throw new Error('Refresh token unavailable')
  }

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    })
    return res.sendStatus(204);
  }

  await User.findOneAndUpdate({ refreshToken }, {
    refreshToken: ''
  })

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true
  })

  res.sendStatus(204);
});


const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const password = req.body.password;
  console.log(req.body)
  validateMongodbId(_id);

  const user = await User.findById(_id);

  if (password) {
    user.password = password;

    const updatedPassword = await user.save();

    res.json(updatedPassword);
  } else {
    res.json({ message: 'Didnt succeed' })
  }
});


const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('User not found')
  }

  try {
    const token = await user.createPasswordResetToken();
    await user.save();

    const resetURL = `Hi, Please follow this link to reset your password. This link is valid for 30 minutes from now. <a href='http://localhost:8080/api/user/reset-password/${token}'>Click Here</a>`
    const data = {
      to: email,
      subject: 'Forgot Password Link',
      text: 'Hey User',
      html: resetURL
    }

    sendEmail(data)

    res.json(token)
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
});


const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash('SHA256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() }
  })

  if (!user) {
    throw new Error('Token Expired')
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();

  res.json(user);
});


const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id).populate('wishlist');

    res.json(user.wishlist);
  } catch (error) {
    throw new Error(error)
  }
});


const addToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cart } = req.body;

  validateMongodbId(_id);

  try {
    let products = [];
    const user = await User.findById(_id);

    // checking if users cart already exists
    const cartAlreadyExists = await Cart.findOne({ orderdBy: user._id });

    if (cartAlreadyExists) {
      cartAlreadyExists.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      let obj = {};
      obj.product = cart[i].product;
      obj.count = cart[i].count;
      obj.color = cart[i].color;

      let getPrice = await Product.findById(cart[i].product).select('price').exec();
      obj.price = getPrice.price;

      products.push(obj);
    }

    let cartTotal = 0;

    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].price * products[i].count;
    }

    const newCart = await new Cart({
      products,
      cartTotal,
      orderdBy: user._id
    }).save();

    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});


const getCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongodbId(_id);

  try {
    const userCart = await Cart.findOne({ orderdBy: _id }).populate('products.product');

    res.json(userCart);
  } catch (error) {
    throw new Error(error);
  }
});


const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongodbId(_id);

  try {
    const cart = await Cart.findOneAndDelete({ orderdBy: _id });

    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});


const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });

  if (validCoupon === null) throw new Error('Invalid Coupon');

  const user = await User.findById(_id);
  let { cartTotal } = await Cart.findOne({ orderdBy: _id }).populate('products.product');
  let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);

  await Cart.findOneAndUpdate({ orderdBy: _id }, {
    totalAfterDiscount: totalAfterDiscount
  });

  res.json(totalAfterDiscount);
});


const createCashOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;

  try {
    if (!COD) throw new Error('Create cash order failed');

    let userCart = await Cart.findOne({ orderdBy: _id });
    let finalAmount = 0;

    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: 'COD',
        amount: finalAmount,
        status: 'Cash on Delivery',
        created: Date.now(),
        currency: 'USD'
      },
      orderStatus: 'Cash on delivery',
      orderedBy: _id
    }).save();

    let update = userCart.products.map(item => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } }
        }
      }
    });
    const updated= await Product.bulkWrite(update, {});

    res.json({message: 'success'});

  } catch (error) {
    throw new Error(error);
  }
});


const getOrders= asyncHandler(async(req, res) =>{
  const {_id} = req.user;
  try {
    const userOrders= await Order.findOne({orderedBy: _id}).populate('products.product').exec();
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});


const updateOrderStatus= asyncHandler(async(req, res) => {
  const {status} = req.body;
  const {id}= req.params;

  validateMongodbId(id);

  try {
    const order= await Order.findByIdAndUpdate(id, {
      orderStatus: status,
      paymentIntent: {
        status: status
      }
    }, {
      new: true
    });
  
    res.json(order);
  } catch (error) {
    throw new Error(error); 
  }
})


module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  addToCart,
  getCart,
  emptyCart,
  applyCoupon,
  createCashOrder,
  getOrders,
  updateOrderStatus
}