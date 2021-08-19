const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const api = express();

api.use(cors());

const initRoutes = require("./src/routes/index");

api.use(bodyParser.urlencoded({extended: true}));

initRoutes(api)

let port = process.env.PORT;
api.listen(port, () => {
    console.log("Ready");
});