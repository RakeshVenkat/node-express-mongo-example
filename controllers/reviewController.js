/* eslint-disable no-else-return */
const Review = require('../models/reviewModel');
const handler = require('./handlerFactory');

exports.setRequestBodyParams = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = handler.createOne(Review);

exports.getAllReviews = handler.getAll(Review);

exports.deleteReviews = handler.deleteOne(Review);

exports.updateReviews = handler.updateOne(Review);

exports.getReviews = handler.getOne(Review);
