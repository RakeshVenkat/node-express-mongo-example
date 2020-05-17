const AppError = require('../utils/appError');

const sendDevError = (err, req, res) => {
  console.error(err)
  if (req.originalUrl.startsWith('/api')) {
    err.statusCode = err.statusCode || 500;
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  res.status(200).render('error', {
    title: 'Error | Something went wrong',
    msg: err.message,
  });
};

const sendProdError = (err, req, res) => {
  console.error(err);
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      err.statusCode = err.statusCode || 500;
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
  }
  res.status(200).render('error', {
    title: 'Error | Something went wrong',
    msg:
      'This could be a broken link!!',
  });
  return res.status(500).json({
    status: 'fail',
    message: 'something went wrong!!',
  });
};

const handleDuplicateError = (err) => {
  const message = `${err.keyValue.name} already exists!! Try a different one.`;
  return new AppError(400, message);
};

const handleCastError = (err) => {
  const message = `${err.value} is invalid for ${err.path}`;
  return new AppError(400, message);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(400, message);
};

const handleJWTTokenError = () =>
  new AppError(401, 'Token is invalid. Login to fetch a new one.');

const handleJWTTokenExpiredError = () =>
  new AppError(401, 'Token is expired. Login to fetch a new one.');

exports.globalErrorHandler = (err, req, res, next) => {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'development') {
    return sendDevError(err, req, res);
  }
  if (nodeEnv === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.code === 11000) error = handleDuplicateError(err);

    if (error.name === 'CastError') error = handleCastError(err);

    if (error.name === 'ValidationError') error = handleValidationError(err);

    if (error.name === 'JsonWebTokenError') error = handleJWTTokenError();

    if (error.name === 'TokenExpiredError')
      error = handleJWTTokenExpiredError();

    return sendProdError(error, req, res);
  }
};
