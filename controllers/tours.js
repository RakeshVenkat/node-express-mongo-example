const fs = require('fs');

const filePath = `${process.cwd()}/dev-data/data/`;

// Read the tours available in data layer
let tours = [];
let toursReadError;
fs.readFile(
  `${filePath}/tours-simple.json`,
  { encoding: 'utf-8' },
  (err, data) => {
    if (err) toursReadError = err;
    tours = JSON.parse(data);
  }
);

// tours: Read API Handler
// depends on dateMiddleware
exports.getTours = (req, res) => {
  if (toursReadError) {
    console.error(toursReadError);
    return res.status(500).send({
      status: 'Error in fetching tour records',
      date: req.requestedTime,
      body: { toursReadError },
    });
  }
  return res.status(200).send({
    status: 'Success',
    length: tours.length,
    date: req.requestedTime,
    body: tours,
  });
};

// tours: Create API handler
// depends on express.json() middleware
exports.createTour = (req, res) => {
  let tour = req.body;
  tour = { id: tours[tours.length - 1].id + 1, ...tour };
  let newTours = [...tours, tour];

  fs.writeFile(
    `${filePath}/tours-simple.json`,
    JSON.stringify(newTours),
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          status: 'Error in persisting the new tour record in data layer',
          body: { err },
        });
      }
      return res.status(201).send({
        status: 'Success!! Added the tour into data store',
        body: newTours,
      });
    }
  );
};

// tours: Read API Handler based on id
exports.getTourById = (req, res) => {
  let id = req.params.id * 1;
  let tour = tours.find((el) => el.id === id);
  return res.status(200).send({ status: 'Success', body: tour });
};

// tours: Update API Handler based on id
exports.updateTour = (req, res) => {
  let id = req.params.id * 1;
  let tour = tours.find((el) => el.id === id);
  tour = { ...tour, ...req.body };
  return res
    .status(200)
    .send({ status: 'Success!! Updated the tour', body: tour });
};

// tours: Update API Handler based on id
exports.deleteTour = (req, res) => {
  let id = req.params.id * 1;
  // TODO: add deletion logic here
  return res.status(200).send({ status: 'Success!! Deleted the tour' });
};

// Param middleware
// 3rd arg is next since its a middleware
// 4th arg is the param value defined in the middleware definition (val = id)
exports.checkId = (req, res, next, val) => {
  val = val * 1
  let tour = tours.find((el) => el.id === val);
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!',
    });
  }
  next();
};

// Middleware to check if payload contains a valid body
exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price) {
        return res.status(404).send({
            status: 'Payload missing name or price attributes'
        })
    }
    next()
}
