const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./Backend/Config/db');
require('dotenv').config();
const cors = require('cors');
const identifyRouter = require('./Backend/Routes/identify');
const Contact = require('./Backend/Models/contact');

const PORT=process.env.port;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/identify", identifyRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
