const Tour = require('../models/tourModel');
//const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.overview = catchAsync(async (req, res, next) => {
  // 1) get the data from the Tour model
  const tours = await Tour.find();
  // 2) Render the template with the model data
  return res.status(200).render('overview', { title: 'All tours', tours });
});

exports.tour = catchAsync(async (req, res, next) => {
  // 1) get the guides and reviews from the User and Review models
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) next(new AppError(404, 'Couldnot find that on the server'));
  // 2) Render the template with the data
  return res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

exports.account = catchAsync(async (req, res) => {
  return res.status(200).render('account', {
    title: 'Account',
    user: req.user
  });
});

exports.updateUserData = catchAsync(async (req, res) => {
  console.log(req.body)

})