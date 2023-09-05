/* eslint-disable arrow-body-style */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
const User = require("./../model/user");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const crypto = require('crypto');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => { 
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true; // Cookie only send in encryption connection (Basically we are only using HTTPS)

  res.cookie("jwt", token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync (async (req, res, next) => {
    const email = req.body.email;
    const user = await User.findOne({ email });
    
    if (user) {
      return next(new AppError("User already exist", 401));
    }

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || undefined,
    });

    createSendToken(newUser, 200, res);
  });

exports.login = catchAsync (async (req, res, next) => {
  const {email, password}=req.body;

  // 1) Check email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 401));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (user.isActive === false) {
    return next(new AppError("User is not active", 403));
  }
  
  if (user.status !== "paid" &&  user.role === "farmer") {
    return next(new AppError(`Your payment is ${user.status}. So repay your payment...`));
  }
  delete user.password;

  createSendToken(user, 200, res);
});


exports.protect = catchAsync (async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
  };
  // console.log(token);

  if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access', 401));
  };

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
  };

  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please login again.', 401));
  };

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 401));
    }
    next();
  };
};

exports.forgotPassword = catchAsync (async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });

  if(!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/resetPassword/${resetToken}`;

  // 3) Send it to user email 
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message: `Your password reset token is: ${resetURL}`,
    });
  
    res.status(200).json({
      status: 200,
      message: 'Your password reset token sent to the email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email.',500));
  } 
});

exports.resetPassword = catchAsync (async (req, res, next) => {
  // 1) Get hashed token and check that it exists
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ 
    passwordResetToken: hashedToken, 
    passwordResetExpires: { $gt: Date.now() } 
  });

  // 2) If token has not expired and there is user then set new password
  if(!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  };

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update the passwordChangedAt property for user
  // 4) Log the user in and send JWT token
  createSendToken(user, 200, res);
});
