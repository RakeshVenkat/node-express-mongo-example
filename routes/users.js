const express = require('express');

const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updateMe,
  deleteMe
} = require('../controllers/userController');
const { protect, restrictTo } = require('../controllers/authController');

router.route('/updateMe').patch(protect, updateMe) 
router.route('/deleteMe').delete(protect, deleteMe) 
//router.patch('/updateMe', protect, updateMe);

router.route('/').get(protect, getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(protect, updateUserById)
  .delete(protect, restrictTo(['admin', 'lead-guide']), deleteUserById);

// NOTE: REGISTERING THE PATCH REQUEST AFTER THE ABOVE DOESNT WORK!!
// router.route('/updateMe').patch(protect, updateMe) 
// : throws 'Not yet implemented'

module.exports = router;
