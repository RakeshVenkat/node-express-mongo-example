const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
//const sendEmail = require('../utils/email');
const Email = require('../utils/email');

const signToken = (user) =>
  jsonwebtoken.sign(
    { name: user.name, email: user.email, _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION_TIME }
  );

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Avoid showing the password fields in the output
  user.password = undefined;
  user.passwordConfirm = undefined;

  return res.status(statusCode).send({
    status: 'Success',
    token,
    data: user,
  });
};

exports.singup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/about-me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.verify = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError(400, `Send an email and password to validate`);

  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    throw new AppError(401, `User with the email or password doesnt exist!!`);

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) if request doesnt contain the Authorization Bearer token
  //    or if its not in the cookie called jwt,
  //    return 401 Error
  if (
    (req.headers.authorization !== undefined &&
      !req.headers.authorization.startsWith('Bearer ')) ||
    !req.cookies.jwt
  ) {
    throw new AppError(
      401,
      `request doesnot contain a valid token. Login to get one.`
    );
  }

  let token = '';
  if (req.cookies.jwt) token = req.cookies.jwt;
  else {
    token = req.headers.authorization.split(' ')[1];
  }

  const verify = promisify(jsonwebtoken.verify);
  const decoded = await verify(token, process.env.JWT_SECRET);

  // Check if user exists
  const currentUser = await User.findById(decoded._id);
  if (!currentUser) throw new AppError(401, `User doesnt exist for the token`);

  // Check if user changed the password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    throw new AppError(
      401,
      `Password has been changed after the token was issued. Login again to fetch the token`
    );

  // SAVE THE USER
  req.user = currentUser;
  // Call the next handler only after all the checks are done
  next();
});

exports.restrictTo = ([...roles]) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    next(new AppError(403, `You cannot perform this action!!`));

  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );
  if (!user) next(new AppError(404, 'User does not exist for that email'));

  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // return back the random password
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password. Submit your patch request with your new password and passwordConfirm to: ${resetURL}.\n If you didnt request your password, please ignore this email!`;

  try {
    /*   await sendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 mins',
      message,
    }); */

    await new Email(user, resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email!',
    });
  } catch (err) {
    console.error(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(500, 'There was an error in sending an email'));
  }
});

exports.passwordReset = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2) If token has not expired and there is a user, set a new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 3) Update the changed passwordChangedAt property for the user
  if (!user) {
    return next(new AppError(400, 'Token has expired'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;
  if (!currentPassword || !newPassword || !passwordConfirm)
    throw new AppError(
      400,
      `email, oldPassword or newPassword is missing in request!!`
    );

  // 1) Check whether the user exists
  const user = await User.findById(req.user.id).select('+password');
  if (!user) next(new AppError(404, `User doesnot exist`));

  // 2) Check if old password is valid
  if (!(await bcrypt.compare(currentPassword, user.password)))
    next(new AppError(401, `Invalid password!!`));

  // 3) Update the new password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  user.passwordChangedAt = Date.now();
  // User.findByIdAndUpdate will not work as the validator and middlewares of pre save() wont work
  // Mongodb cannot store the password in memory
  await user.save();

  // 4) Log user in, return a new JWT token
  createSendToken(user, 201, res);
});

exports.isLoggedIn = async (req, res, next) => {
  // req.cookies is available due to the injection of the cookie parser middleware
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    try {
      // verify token
      const verify = promisify(jsonwebtoken.verify);
      const decoded = await verify(token, process.env.JWT_SECRET);

      // Check if user exists
      const currentUser = await User.findById(decoded._id);
      if (!currentUser) next();

      // Check if user changed the password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) next();

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      console.error('Request doesnt have a valid JWT token!!');
      next();
    }
  }
  // Call the next handler only after all the checks are done
  next();
};

exports.logout = (req, res, next) => {
  try {
    res.cookie('jwt', 'LoggedOut', {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error while setting the cookie: jwt as LoggedOut!!');
    next();
  }
};
