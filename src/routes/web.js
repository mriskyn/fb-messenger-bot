const express = require('express');
const router = express.Router();

const initWebRoutes = (app) => {
  router.get('/', (req, res) => res.send('ok'));

  return app.use('/', router);
};

module.exports = initWebRoutes;
