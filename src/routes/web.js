const express = require('express');
const router = express.Router();

const homepageController = require('../controllers/homepageControllers');
const chatBotController = require('../controllers/chatBotControllers');
const messageController = require('../controllers/mesageController');

const initWebRoutes = (app) => {
  router.get('/', homepageController.getHomepage);
  router.get('/webhook', chatBotController.getWebHook);
  router.post('/webhook', chatBotController.postWebHook);

  router.get('/api/message', messageController.getMessages);
  router.get('/api/message/:id', messageController.getMessage);
  router.get('/api/summary', messageController.summary);

  return app.use('/', router);
};

module.exports = initWebRoutes;
