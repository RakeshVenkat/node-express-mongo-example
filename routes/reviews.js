const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  createReview,
  getAllReviews,
  deleteReviews,
  updateReviews,
  setRequestBodyParams,
  getReviews,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo(['user']), setRequestBodyParams, createReview);

router
  .route('/:id')
  .get(protect, getReviews)
  .patch(protect, restrictTo(['user', 'admin']), updateReviews)
  .delete(protect, restrictTo(['user', 'admin']), deleteReviews);

module.exports = router;
