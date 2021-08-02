const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const api = express();

api.use(cors());

const initRoutes = require("./src/routes/index");

api.use(express.urlencoded({extended: true}));

initRoutes(api)

let port = 5454;
api.listen(port, () => {
    console.log("Ready");
});