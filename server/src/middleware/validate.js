const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new Error(result.array().map(({ msg }) => msg).join(', '));
    error.statusCode = 400;
    return next(error);
  }

  next();
};

module.exports = validate;
