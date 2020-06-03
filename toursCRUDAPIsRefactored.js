var express = require('express');
var app = express();
const port = 3001;
const fs = require('fs');
////////////////////////////////////////
// Handlers

// Read the tours available in data layer
let tours = [];
let toursReadError;
fs.readFile(
  `${__dirname}/dev-data/data/tours-simple.json`,
  { encoding: 'utf-8' },
  (err, data) => {
    if (err) toursReadError = err;
    tours = JSON.parse(data);
  }
);

// tours: Read API Handler
// depends on dateMiddleware
const readTours = (req, res) => {
  if (toursReadError) {
    console.error(toursReadError);
    return res.status(500).send({
      status: 'Error in fetching tour records',
      date: req.requestedTime,
      body: { toursReadError },
    });
  }
  return res
    .status(200)
    .send({
      status: 'Success',
      length: tours.length,
      date: req.requestedTime,
      body: tours,
    });
};

// tours: Create API handler
// depends on express.json() middleware
app.use(express.json());
const createTour = (req, res) => {
  let tour = req.body;
  tour = { id: tours[tours.length - 1].id + 1, ...tour };
  let newTours = [...tours, tour];

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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
const readTourById = (req, res) => {
  let id = req.params.id * 1;
  let tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!',
    });
  }
  return res.status(200).send({ status: 'Success', body: tour });
};

// tours: Update API Handler based on id
const updateTour = (req, res) => {
  let id = req.params.id * 1;
  let tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!',
    });
  }
  tour = { ...tour, ...req.body };
  return res
    .status(200)
    .send({ status: 'Success!! Updated the tour', body: tour });
};

// tours: Update API Handler based on id
const deleteTour = (req, res) => {
  let id = req.params.id * 1;
  let tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!',
    });
  }
  // TODO: add deletion logic here
  return res.status(200).send({ status: 'Success!! Deleted the tour' });
};
/////////////////////////////////////////////////////
// Middlewares
const helloMiddleWare = (req, res, next) => {
  //console.log('Hello from middleware :) ');
  next();
};

const dateMiddleware = (req, res, next) => {
  req.requestedTime = new Date().toDateString();
  next();
};

/////////////////////////////////////////////////////

// Middleware injections
app.use(dateMiddleware);

// Route definitions
app.route('/api/v1/tours').get(readTours).post(createTour);

app.use(helloMiddleWare);
app
  .route('/api/v1/tours/:id')
  .get(readTourById)
  .patch(updateTour)
  .delete(deleteTour);

//////////////////////////////////////////////////////
// Server startup
app.listen(port, () => console.log(`Server runnning at port: ${port}`));
