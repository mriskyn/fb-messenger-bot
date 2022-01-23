require('dotenv').config();
const express = require('express');
const viwEngine = require('./config/viewEngine');
const initWebRoutes = require('./routes/web');

const app = express();
const PORT = process.env.PORT || 8888;

// config view engine
viwEngine(app);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init all web routes
initWebRoutes(app);

app.listen(PORT, () => console.log(`App is running on port:`, PORT));
