const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const generateToken = require('../config/jwtToken');
const generateRefreshToken = require('../config/refreshToken');
const validateMongodbId = require('../utils/validateMongodbId');
const sendEmail = require('./emailController');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


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
    const refreshToken = await generateRefreshToken(user._id);
    const updateUser = await User.findByIdAndUpdate(user._id, {
      refreshToken: refreshToken
    }, {
      new: true
    });
    const token = await generateToken(user._id);

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
  resetPassword
}