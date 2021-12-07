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
    console.log("API port : "+port)
    console.log("DB ip : "+process.env.DB_IP+":"+process.env.DB_PORT)
    console.log("DB user : "+process.env.DB_USER)
    console.log("DB pass : "+process.env.DB_PASS)
    console.log("DB database : "+process.env.DB_DB)

    
    
    console.log("Ready");

});