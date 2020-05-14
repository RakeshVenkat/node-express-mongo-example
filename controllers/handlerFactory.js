const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) throw new AppError(404, `No document found with that ID`);

    return res.status(200).send({ status: 'Success!! Deleted the document' });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!doc) throw new AppError(404, `No document found with that ID`);

    return res
      .status(200)
      .send({ status: 'Success!! Updated the document', data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    return res.status(201).send({
      status: 'Success!! Created a new document.',
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to allow for nested GET reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;
    return res.status(200).send({
      status: 'Success',
      length: doc.length,
      doc,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) throw new AppError(404, `No doc found with that ID`);

    return res.status(200).send({
      status: 'Success',
      body: doc,
    });
  });

//const tour = await Tour.findById(req.params.id);

// Populate the response with the guide when tour is requested without actually
// saving it in the tour document in db
// const tour = await Tour.findById(req.params.id).populate({path: 'guides', select: '-__v'});

// Moved to query middleware
// const tour = await Tour.findById(req.params.id);

// Handling for getting reviews of a tour (using virtual populate)
