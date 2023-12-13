const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');


// user authorisation
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      //getting token from headers
      token = req.headers.authorization.split(' ')[1];

      //verifying token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();

    } catch (error) {
      console.log(error);

      res.status(401);
      throw new Error('Not Authorised');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not Authorised, No Token');
  }
});

//admin authorisation
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const admin = await User.findOne({ email });

  if (admin.role !== 'admin') {
    res.status(403);
    throw new Error('You are not Authorised');
  }

  next();

})
module.exports = { protect, isAdmin };