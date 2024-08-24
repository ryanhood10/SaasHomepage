const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const User = require("../models/user");



// check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {

  const { token } = req.cookies;
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('You must login', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('você deve fazer login', 401));
  }
}


//admin middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.isSeller === false) {
    return next(new ErrorResponse('You must be an admin user', 401));
  }
  next();
}



