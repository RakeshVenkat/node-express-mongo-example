const express = require('express');

const router = express.Router();

const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('../controllers/userController');
const { protect, restrictTo } = require('../controllers/authController');

// protects all routes that come after this middleware in this router
router.use(protect)

router.route('/getMe').get(getMe, getUser) 
router.route('/updateMe').patch(uploadUserPhoto, resizeUserPhoto, updateMe) 
router.route('/deleteMe').delete(deleteMe) 
//router.patch('/updateMe', updateMe);

// Only administrators can perform the following actions
router.use(restrictTo(['admin']))

router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// NOTE: REGISTERING THE PATCH REQUEST AFTER THE ABOVE DOESNT WORK!!
// router.route('/updateMe').patch(updateMe) 
// : throws 'Not yet implemented'

module.exports = router;
