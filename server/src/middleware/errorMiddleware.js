const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = error.message || 'Internal server error';

  if (error.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(error.keyValue || {});
    message = fields.length
      ? `Duplicate value for ${fields.join(', ')}`
      : 'Duplicate value';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: error.stack }),
  });
};

module.exports = { notFound, errorHandler };
