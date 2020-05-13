/* eslint-disable no-else-return */
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createUser = catchAsync(async (req, res, next) => {
  return res.status(501).send({
    status: 'Not yet implemented',
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query);
  const users = await features.query;
  return res.status(200).send({
    status: 'Success',
    length: users.length,
    users,
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  return res.status(501).send({
    status: 'Not yet implemented',
  });
});

exports.updateUserById = catchAsync(async (req, res, next) => {
  return res.status(501).send({
    status: 'Not yet implemented',
  });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const result = await User.findByIdAndDelete(req.params.id);

  return res.status(200).send({
    status: 'Success',
    data: result,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredObj = {};
  const allowedFields = ['name', 'email'];
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
