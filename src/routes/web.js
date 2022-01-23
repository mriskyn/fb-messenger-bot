const express = require('express');
const router = express.Router();

const homepageController = require('../controllers/homepageControllers');
const chatBotController = require('../controllers/chatBotControllers');

const initWebRoutes = (app) => {
  router.get('/', homepageController.getHomepage);
  router.get('/webhook', chatBotController.getWebHook);
  router.post('/webhook', chatBotController.postWebHook);

  return app.use('/', router);
};

module.exports = initWebRoutes;
