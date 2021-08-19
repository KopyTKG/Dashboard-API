const express = require('express');
const router = express.Router();
const Port = require('../controller/init.controller')
const DB = require('../controller/db.controller')

let routes = (app) => {
    router.get("/", Port.TestInit);
    router.get("/getList", DB.getList);
    router.get("/getCalendar", DB.getCalendar);
    router.post("/login", DB.getUser);
    app.use(router);
};

module.exports = routes;