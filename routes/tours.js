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

const {createTour, getTours, getTourById, updateTour, deleteTour, aliasTopCheapTours, getTourStats, getMonthlyPlan} = require('../controllers/tourController')
const {protect, restrictTo} = require('../controllers/authController')

/* router.get('/', getTours)
router.get('/:id', getTourById)
router.post('/', createTour)
router.patch('/:id', updateTour)
router.delete('/:id', deleteTour) */

// Consize way: combine route path definitions
// Middleware can be injected per route as well (as done for POST request below)

router.route('/top-5-cheap').get(aliasTopCheapTours, getTours)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
//router.route('/').get(getTours).post(checkBody, createTour);
router.route('/').get(getTours).post(createTour)

// CheckId middleware injection
//router.param('id', checkId);
router.route('/:id').get(getTourById).patch(updateTour).delete(protect, restrictTo(['admin', 'lead-guide']), deleteTour);

module.exports = router;
