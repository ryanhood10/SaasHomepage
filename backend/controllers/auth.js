const User = require('../models/user');
const ErrorResponse = require('../utils/errorResponse');

// user sign up
exports.signup = async (req, res, next) => {
    console.log('Incoming signup request:', req.body); // Log the incoming request

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return next(new ErrorResponse("All fields are required", 400));
    }

    try {
        // Check if the email is already registered
        const userExist = await User.findOne({ email });
        if (userExist) {
            console.log('Email already registered:', email);
            return next(new ErrorResponse("E-mail already registered", 400));
        }

        // Create the new user
        const user = new User({
            name,
            email,
            password,
        });

        const newUser = await user.save();

        // Log the newly created user
        console.log('New user created:', newUser);

        res.status(201).json({
            success: true,
            user: newUser
        });
    } catch (err) {
        console.error('Error during signup:', err); // Log the error
        next(err);
    }
};



//user sign In
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email) {
      return next(new ErrorResponse('Please enter an email', 403));
    }
    if (!password) {
      return next(new ErrorResponse('Please enter a password', 403));
    }
    // check user email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('invalid credentials', 400));
    }

    //check password
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return next(new ErrorResponse('invalid credentials', 400));
    }

    sendTokenResponse(user, 200, res);
  }

  catch (err) {
    next(err)
  }
}


// send token
const sendTokenResponse = async (user, statusCode, res) => {
  const token = await user.getJwtToken();

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 1 * 60 * 60 * 1000)
    // expires: new Date(Date.now() + process.env.EXPIRE_TOKEN)
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      isAdmin: user.isAdmin,
    })
}




// LOG OUT USER
exports.logout = (req, res, next) => {

  res.clearCookie('token');

  res.status(200).json({
    success: true,
    message: "Logged out"
  })
}

//GET CURRENT LOG IN USER
exports.userProfile = async (req, res, next) => {

  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    user
  });

}