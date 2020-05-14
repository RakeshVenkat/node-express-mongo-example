const express = require('express');
const router = express.Router();
/* const {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require('../controllers/tours'); */

const {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
  aliasTopCheapTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistance
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');
const reviewRouter = require('./reviews');

/* router.get('/', getTours)
router.get('/:id', getTourById)
router.post('/', createTour)
router.patch('/:id', updateTour)
router.delete('/:id', deleteTour) */

// Consize way: combine route path definitions
// Middleware can be injected per route as well (as done for POST request below)

router.route('/top-5-cheap').get(aliasTopCheapTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistance)

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo(['admin', 'lead-guide', 'guide']), getMonthlyPlan);
//router.route('/').get(getTours).post(checkBody, createTour);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo(['admin', 'lead-guide']), createTour);

// CheckId middleware injection
//router.param('id', checkId);
router
  .route('/:id')
  .get(getTourById)
  .patch(protect, restrictTo(['admin', 'lead-guide']), updateTour)
  .delete(protect, restrictTo(['admin', 'lead-guide']), deleteTour);

// Commented as 1) its messy, 2) we are duplicating code
// Solution: use ReviewRouter and use mergeParams to get access to tourId param
/* router
  .route('/:tourId/reviews')
  .get(protect, getAllReviews)
  .post(protect, restrictTo(['user']), createReview); */

router.use('/:tourId/reviews', reviewRouter);
module.exports = router;
