require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');

const viwEngine = require('./config/viewEngine');
const { sequelize } = require('./models');
const initWebRoutes = require('./routes/web');
const swaggerDocs = require('./docs');
const connectMongo = require('./db/connectMongo')

const app = express();
const PORT = process.env.PORT || 8888;

// config view engine
viwEngine(app);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation (using :8888 port)
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, { customSiteTitle: 'API Documentation' })
);

// init all web routes
initWebRoutes(app);

async function main() {
  try {
    await connectMongo(process.env.MONGO_URL)
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.log('err:', err);
  }
  app.listen(PORT, () => console.log(`App is running on port:`, PORT));
}

main();
