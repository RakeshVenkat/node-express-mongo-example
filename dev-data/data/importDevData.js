const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const fs = require('fs');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const filePath = `${process.cwd()}/dev-data/data/`;

// read from file
const getResource = (model) => {
  let resource = [];
  try {
    const data = fs.readFileSync(`${filePath}/${model}.json`, {
      encoding: 'utf-8',
    });
    resource = JSON.parse(data);
    console.log(`Loaded ${resource.length} from file...`);
  } catch (error) {
    console.error(`Error while reading data from file`);
  }
  return resource;
};

//establish db connection
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
  })
  .then((con) => {
    console.log(`connection to mongo db established with : ${con.connections}`);
  });

const importData = async (Model, data) => {
  try {
    const docs = await Model.create(data, {validateBeforeSave: false});
    //console.log(`${docs.length} records successfully created in DB`);
  } catch (error) {
    console.error(`Error while importing docs into db ${error}`);
  }
};

const deleteData = async (Model) => {
  try {
    await Model.deleteMany();
    //console.log(`records successfully deleted`);
  } catch (error) {
    console.error(`Error while deleting the docs due to: ${error}`);
  }
};

// NOTE: BEFORE RUN:: comment out the pre save middleware in user model so that password doesnt get encrypted again
const myArgs = process.argv.slice(2);
if (myArgs[0] === '--import') {
  importData(Tour, getResource('tours'));
  importData(User, getResource('users'));
  importData(Review, getResource('reviews'));
} else if (myArgs[0] === '--delete') {
  deleteData(Tour);
  deleteData(User);
  deleteData(Review);
}

 