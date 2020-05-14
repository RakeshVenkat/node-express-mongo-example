const mongoose = require('mongoose');
const slugify = require('slugify');
//const Validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less than or equal 40 chars'],
      minlength: [10, 'A tour name must have more than or equal 10 chars'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Requires a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have agroup size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Should have a difficulty'],
      default: 'easy',
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either one of: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on New document creation
          return this.price > val;
          // return this.price > this.priceDiscount
        },
        message: 'Discount price should be below the actual price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// You can use custom validator : https://www.npmjs.com/package/validator
// TODO: to be added and checked

// Virtual properties: derived props:: derive business logic in Model
// Thicker model layer
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// ALL MIDDLEWARES NEED TO BE CALLED BEFORE THE SCHEMA IS USED TO CREATE THE MODEL

// Document middleware: runs before the .save() comand and .create() cmd
// Not on .insertMany()
// make sure the next() is being called
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// You can add more hooks or middlewares on the same event
tourSchema.pre('save', function (next) {
  console.log('Middleware: Before save(): will save document');
  next();
});
// Fetch the user records and embed into tour
// Drawback : is user's role changes from guide to leadguide, the tour also needs update!!
/* tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (el) => await User.findById(el));
  this.guides = await Promise.all(guidesPromises);
  next();
}); */

// You can have a hook on the post event as well
tourSchema.post('save', function (doc, next) {
  console.log('Middleware: After save():');
  next();
});

// QUERY MIDDLEWARE
// 'find' => doesnt work for find*
// use regex
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({path: 'guides', select: '-__v -passwordChangedAt'});
  next();
});

// TODO: why does this run when the update event is fired
tourSchema.post(/^find/, function (docs, next) {
  //console.log(docs);
  console.log(`The query took ${Date.now() - this.start} ms to fetch records`);
  next();
});

// AGGREGATION MIDDLEWARE
// Any common function that needs to be executed for all aggregation events
/* tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
}); */

// Indexes: Create indexes 
//tourSchema.index({price: 1})
tourSchema.index({price: 1, ratingsAverage: -1})
tourSchema.index({slug: 1})
tourSchema.index({ startLocation: '2dsphere' })

// VIRTUAL POPULATE:: 
// derive all the reviews for a Tour. Tour: Parent, Review: child
// Review has the id of its parent(tour) : parent referencing
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
