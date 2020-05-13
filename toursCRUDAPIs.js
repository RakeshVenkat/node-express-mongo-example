var express = require('express');
var app = express();
const port = 3001;
const fs = require('fs');

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
app.get('/api/v1/tours', (_, res) => {
  if (toursReadError) {
    console.error(toursReadError);
    return res.status(500).send({
      status: 'Error in fetching tour records',
      body: { toursReadError },
    });
  }
  return res
    .status(200)
    .send({ status: 'Success', length: tours.length, body: tours });
});

// tours: Read API Handler based on id
app.get('/api/v1/tours/:id', (req, res) => {
  let id = req.params.id * 1
  let tour = tours.find(el => el.id === id)
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!'
    });
  }
  return res
    .status(200)
    .send({ status: 'Success', body: tour });
});

// tours: Create API handler
// TODO: QUESTION: should a post check if a record already exists before insertion?
//    if yes, what param should it use ?
//    if not, then how do you handle multiple POST request with same data
app.use(express.json());
app.post('/api/v1/tours', function (req, res) {
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
      return res
        .status(201)
        .send({
          status: 'Success!! Added the tour into data store',
          body: newTours,
        });
    }
  );
});

// tours: Update API Handler based on id
app.patch('/api/v1/tours/:id', (req, res) => {
  let id = req.params.id * 1
  let tour = tours.find(el => el.id === id)
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!'
    });
  }
  tour = {...tour, ...req.body}
  return res
    .status(200)
    .send({ status: 'Success!! Updated the tour', body: tour });
});

// tours: Update API Handler based on id
app.delete('/api/v1/tours/:id', (req, res) => {
  let id = req.params.id * 1
  let tour = tours.find(el => el.id === id)
  if (!tour) {
    return res.status(404).send({
      status: 'Tour not found !!'
    });
  }
  // TODO: add deletion logic here  
  return res
    .status(200)
    .send({ status: 'Success!! Deleted the tour'});
});

app.listen(port, () => console.log(`Server runnning at port: ${port}`));
