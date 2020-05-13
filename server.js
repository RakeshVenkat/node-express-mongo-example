const mongoose = require('mongoose');
// require('dotenv').config(); // To load .env file
require('dotenv').config({ path: './config.env' });
// Make sure the config file is the first loaded before the rest of the app is initiated

process.env.NODE_ENV = process.env.NODE_ENV? process.env.NODE_ENV.trim(): 'development';

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHADLED EXCEPTION! Shutting down...');

  process.exit(1);
})

const app = require('./app');
const dbUri = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
// For handling deprecation warnings
mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log(`connection to mongo db established`);
  });

/* const tourSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  price: Number
}) */

/* const testTour = new Tour({
  name: 'The Park camper',
  price: 997
}) 

testTour.save().then(doc => {
  console.log(`The created document is: ${doc}`)
}).catch( err => {
  console.error(`Error while creating doc: ${err}`)
}) */

// Server startup
const server = app.listen(process.env.PORT, () =>
  console.log(
    `Server runnning in ${process.env.NODE_ENV} mode at http://${process.env.HOSTNAME}:${process.env.PORT}`
  )
);

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHADLED REJECTION! Shutting down...');

  server.close(() => {
    process.exit(1);
  });
});