//const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopCheapTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary';
  next();
}; 

exports.createTour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.create(req.body);
    return res.status(201).send({
      status: 'Success!! Created a new tour.',
      data: { tour },
    });
  }
);

// localhost:3001/api/v1/tours?duration[gte]=5&difficulty=easy&sort=1&limit=10&price[lt]=1000
exports.getTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  return res.status(200).send({
    status: 'Success',
    length: tours.length,
    tours,
  });
});

// tours: Read API Handler based on id
exports.getTourById = catchAsync(
  async (req, res) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) throw new AppError(404, `No Tour found with that ID`);

    return res.status(200).send({
      status: 'Success',
      body: tour,
    });
  }
);

// tours: Update API Handler based on id
exports.updateTour = catchAsync(
  async (req, res) => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tour) throw new AppError(404, `No Tour found with that ID`);

    return res
      .status(200)
      .send({ status: 'Success!! Updated the tour', body: tour });
  }
);

exports.deleteTour = catchAsync(
  async (req, res) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) throw new AppError(404, `No Tour found with that ID`);

    return res.status(200).send({ status: 'Success!! Deleted the tour' });
  }
);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      /* {
        $match: { _id: { $ne: 'EASY'}}
      } */
    ]);
    return res.status(200).send({ status: 'Success!! ', stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);
    return res.status(200).send({ status: 'Success!! ', plan });
});

