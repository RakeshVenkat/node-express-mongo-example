/* eslint-disable no-else-return */
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');

exports.createUser = ((req, res, next) => {
  res.status(501).json({
    status: 'Will not be implemeted. Use the /signup instead !!'
  })
})

exports.getAllUsers = handler.getAll(User)

exports.getUser = handler.getOne(User)

exports.updateUser = handler.updateOne(User);

exports.deleteUser = handler.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

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
