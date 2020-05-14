const mongoose = require('mongoose');

const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must be from a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Mongoose will have to run 2 queries
// Commented out as many populates would execute
reviewSchema.pre(/^find/, function (next) {
  this./* populate({ path: 'tour', select: 'name' }). */ populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// In Group, you can select the records by using the key like '$key' in the object
// $_id : '$tour' => selects the value of the tour key in first selected document
// $avg : '$rating' => does an average of all rating values in selected documents
// $sum : 1 => count of all selected documents

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  // Aggregation on reviews
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }

  return stats;
};

/* reviewSchema.pre('save', async function(next){
  // const users = await User.find()
  // console.log('in pre save middleware:: users:: ',users)
  // throws User.find is not a function due to circular dependency 
  next()
}) */

// after review is saved in db, calculate ratingAverage & ratingsQuantity
// use the post save middleware
reviewSchema.post('save', async function () {
  this.constructor.calculateAverageRatings(this.tour);
});

// findByIdAndUpdate
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does not work here , query has already executed
  this.r.constructor.calculateAverageRatings(this.r.tour);
});

// Create index on review based on user and tour to avoid duplicate reviews on a tour by a user
// reviewSchema.index({ tour: 1, user: 1}, {unique: true})
// Moved to db : created index on review colelction

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
