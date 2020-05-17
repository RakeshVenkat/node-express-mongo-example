const express = require('express');

const router = express.Router();
const {singup, verify: login, forgotPassword, passwordReset, updatePassword, protect, logout} = require('../controllers/authController')

router.route('/signup').post(singup)
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/updatePassword').patch(protect, updatePassword);
router.route('/resetPassword/:token').patch(passwordReset);


module.exports = router;