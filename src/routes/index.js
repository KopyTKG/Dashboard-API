const express = require('express');
const router  = express.Router();
const Port    = require('../controller/init.controller')
const DB      = require('../controller/db.controller')

let routes = async (app) => {
    router.get("/Gen/pass"     , Port.PassGen);
    router.post("/auth"        , DB.verify);
    router.post("/getList"     , DB.getList);
    router.post("/getCalendar" , DB.getCalendar);
    router.post("/login"       , DB.getUser);
    router.post("/reset"       , DB.getReset);
    app.use(router);
};

module.exports = routes;