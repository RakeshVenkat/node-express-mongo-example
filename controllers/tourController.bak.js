exports.createTour = (req, res, next) => {
  // await new Tour(req.body).create()
  const newTour = new Tour(req.body);
  newTour
    .save()
    .then((data) => {
      res.status(201).send({
        status: 'Success!! Added the tour into data store',
        body: data,
      });
    })
    .catch((err) => {
      //next(new AppError(500, err))
      return res.status(500).send({
        status: 'Error in persisting the new tour record in data layer',
        body: { err },
      });
    });
};

exports.createTourV1 = async (req, res, next) => {
    const newTour = new Tour(req.body);
    try {
      let tour = await Tour.create(req.body)
      return res.status(201).send({
        status: 'Success!! Created a new tour.',
        data: {tour},
      });
    } catch (error) {
      next(new AppError(500, error))
    }
  };

  exports.getTours = async (req, res) => {
    try {
      // handling for empty result if page requested is unavailble: Not needed, hence commented
      /*     if (req.query.page) {
        const numTours = await Tour.countDocuments();
        //console.log(numTours, skip);
        if (skip >= numTours) {
          throw new Error('Requested page is not available');
        }
      } */
  
      let features = new APIFeatures(Tour.find(), req.query)
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
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 'Error in fetching tour records',
        error,
      });
    }
    // Tour.find() // gets everything
    /*  Tour.find({}, (err, doc) => {
      if (err) {
        return res.status(500).send({
          status: 'Error in fetching tour records',
          date: req.requestedTime,
          body: { err },
        });
      }
      return res.status(200).send({
        status: 'Success',
        length: doc.length,
        date: req.requestedTime,
        body: doc,
      });
    }); */
  };

  exports.updateTour = (req, res) => {
    // Tour.findByIdAndUpdate()
    Tour.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true },
      (err, tour) => {
        console.error(err)
        if (err) {
          return res.status(500).send({
            status: 'Error in updating the tour record',
            body: { err },
          });
        }
        return res
          .status(200)
          .send({ status: 'Success!! Updated the tour', body: tour });
      }
    );
  };

  
const responseHandler = async (promise, res, next, successMessage) => {
  try {
    let data = await promise;
    return res.status(201).send({
      status: successMessage,
      body: data,
    });
  } catch (error) {
    next(new AppError(500, error));
  }
};