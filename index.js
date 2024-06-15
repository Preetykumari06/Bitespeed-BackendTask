const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./Backend/Config/db');
require('dotenv').config();
const cors = require('cors');
const identifyRouter = require('./Backend/Routes/identify');
const Contact = require('./Backend/Models/contact');

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/identify", identifyRouter);

app.get('/', (req, res) => {
  res.send('Hello, Welcome!');
});



app.listen(port,async()=>{
  await sequelize.authenticate();
  console.log(`Server is Running on http://localhost:${port}`)
});