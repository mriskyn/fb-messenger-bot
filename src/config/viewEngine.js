const express = require('express');

let configViewEngine = (app) => {
  app.set('view engine', 'ejs');
  app.set('views', './src/views');
};

module.exports = configViewEngine;
