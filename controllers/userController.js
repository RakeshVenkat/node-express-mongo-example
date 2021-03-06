/* eslint-disable no-else-return */
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');
const AppError = require('../utils/appError');
//const upload = multer({ dest: 'public/img/users/' })

// While using sharp for image processing, disk storage is not needed
/* const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/users/');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1]
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  }
}); */

const storage = multer.memoryStorage();

// Additional filter configuration to silently drop invalid files
const multerFilter = function (req, file, cb) {
  if(!file) cb(null, true)

  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    cb(
      new AppError('Uploaded file is not an image. Please upload an image'),
      false
    );
  }
};

const upload = multer({ storage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.createUser = (req, res, next) => {
  res.status(501).json({
    status: 'Will not be implemeted. Use the /signup instead !!',
  });
};

exports.getAllUsers = handler.getAll(User);

exports.getUser = handler.getOne(User);

exports.updateUser = handler.updateOne(User);

exports.deleteUser = handler.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// File available via buffer: req.file.buffer
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) next();

  req.file.filename = `${req.file.fieldname}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //console.log(req.body);
  //console.log(req.file);
  const filteredObj = {};
  const allowedFields = ['name', 'email'];
  if (req.file) filteredObj.photo = req.file.filename;

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) filteredObj[key] = req.body[key];
  });

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
  });

  return res.status(200).send({
    status: 'Success',
    body: updatedUser,
  });
});

// DELETE: SETS ACTIVE AS FALSE. WE DONOT DELETE A RECORD!!
// 1) Add a active property in the model with default value as true and select false
// 2) This route marks active as false, response is null, HTTP code: 204
// 3) Use Query middleware to filter inactive users (use the pre find mw using regex /^find/) using {active: ne false}
exports.deleteMe = catchAsync(async (req, res, next) => {
  //const result = await User.findByIdAndDelete(req.user._id);
  await User.findByIdAndUpdate(req.user.id, { active: false });
  return res.status(204).send({
    status: 'Success',
    data: null,
  });
});
