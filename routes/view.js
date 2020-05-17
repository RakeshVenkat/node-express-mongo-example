const express = require('express');

const router = express.Router();

const { overview, tour, login, account, updateUserData } = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');

// Call the isLoggedIN middleware for every page
//router.use(isLoggedIn);

router.get('/', isLoggedIn, overview);
router.get('/tour/:slug', isLoggedIn, tour);
router.get('/login', isLoggedIn, login);
router.get('/about-me', protect, account);
router.post('/submit-user-data', protect, updateUserData);
//router.get('/error', error);

module.exports = router;
