const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const fs = require('fs');

const Tour = require('../../models/tourModel');

const filePath = `${process.cwd()}/dev-data/data/`;

// read from file
let tours = [];
try {
    let data = fs.readFileSync(`${filePath}/tours.json`, { encoding: 'utf-8' })
    tours = JSON.parse(data);
    console.log(`Loaded ${tours.length} from file...`);
} catch (error) {
    console.error(`Error while reading data from file`)
}

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
  
const importData = async() => {
    try {
       let docs = await Tour.create(tours)
       console.log(`${docs.length} records successfully created in DB`)
    } catch (error) {
        console.error(`Error while importing docs into db ${error}`)
    }
}

const deleteData = async () => {
    try {
        const res = await Tour.deleteMany()
        console.log(`records successfully deleted`)
    } catch (error) {
        console.error(`Error while deleting the docs due to: ${error}`)
    }
}

var myArgs = process.argv.slice(2);
if(myArgs[0] == '--import'){
    importData()
} else if (myArgs[0] == '--delete'){
    deleteData()
}