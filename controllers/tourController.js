//const fs = require('fs');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.aliasTopCheapTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary';
  next();
};

exports.createTour = handler.createOne(Tour);

// localhost:3001/api/v1/tours?duration[gte]=5&difficulty=easy&sort=1&limit=10&price[lt]=1000
exports.getAllTours = handler.getAll(Tour);

// tours: Read API Handler based on id
exports.getTourById = handler.getOne(Tour, { path: 'reviews' });

// tours: Update API Handler based on id
// Do not update password with this
exports.updateTour = handler.updateOne(Tour);

exports.deleteTour = handler.deleteOne(Tour);

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/400/center/34.037167,-118.536240/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!distance || !lat || !lng) {
    next(new AppError(404, `Send distance, latitude and longitude`));
  }

  const geoFilter = {
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  };
  const tour = await Tour.find(geoFilter);

  return res.status(200).json({
    status: 'Success',
    data: {
      data: tour,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi'? 0.000621371: 0.001;

  if (!lat || !lng) {
    next(new AppError(404, `Send distance, latitude and longitude`));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  return res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
