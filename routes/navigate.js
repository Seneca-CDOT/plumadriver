const navigate = require('express').Router();

// navigate
navigate.post('/', async (req, res, next) => {
  try {
    const { session } = req;
    await session.navigateTo(req.body.url);
    res.send(null);
  } catch (error) {
    next(error);
  }
});

module.exports = navigate;
