const express = require('express');
const router = express.Router();

const homepageController = require('../controllers/homepageControllers')

const initWebRoutes = (app) => {
  router.get('/', homepageController.getHomepage);

  return app.use('/', router);
};

module.exports = initWebRoutes;
