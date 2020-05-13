const AppError = require('../utils/appError')

exports.baseRouteHandler = (req, res, next) => {
  res.send({
    title: 'Welcome, this is the default API definition.',
    supportedRoutes: ['/tours', '/users'],
  });
};

exports.notFoundHandler = (req, res, next) => {
 /* res.status(404).send({
    status: 'fail',
    message: `Couldn't find ${req.originalUrl} on this server!!`
  })*/
 /*  let err = new Error(`Couldn't find ${req.originalUrl} on this server!!`);
  err.statusCode = 404
  err.status = 'fail' */

  // Call the error hanlder when next(err) is called
  // Skips all subsequent middleware in the stack 
  // Goes directly to the global error middleware
  // next(err)
  next(new AppError(404, `Couldn't find ${req.originalUrl} on this server!!`))
}