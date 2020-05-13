class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    // Filtering: Simple and Advanced
    filter() {
      let queryObj = { ...this.queryString };
      // const queryObj = req.query // refs to same obj
      const excludedFields = ['page', 'limit', 'sort', 'fields'];
      excludedFields.forEach((eachField) => delete queryObj[eachField]);
      
      // { difficulty: 'easy', duration: {$gte: 5}}
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      queryObj = JSON.parse(queryStr);
  
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    // Sorting
    sort() {
      if (this.queryString.sort) {
        //localhost:3001/api/v1/tours?sort=price,ratingsAverage&limit=10
        // sort('price ratingsAverage')
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('--createdAt');
      }
  
      return this;
    }
  
    // Selecting specific fields: inclusion / exclusion : Projections
    // localhost:3001/api/v1/tours?fields=-name,-price,-difficulty (exclude name, price, difficulty)
    // localhost:3001/api/v1/tours?fields=name,price,difficulty (include only name, price, difficulty)
    // Also exlude from model itself (ex: createdAt)
    limitFields() {
      if (this.queryString.fields) {
        const projections = this.queryString.fields.split(',').join(' ');
        this.query.select(projections);
      } else {
        // Exclude a field b prefixing - before a field to exclude
        this.query.select('-__v');
      }
  
      return this;
    }
  
    //Pagination: Skip number of records to go to respective page
    paginate() {
      let page = this.queryString.page * 1 || 1; // convert to num and give default val
      let limit = this.queryString.limit * 1 || 100; // convert to num and give default val
      let skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  module.exports = APIFeatures