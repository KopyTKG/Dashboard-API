const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
var nodemailer = require('nodemailer');

require('dotenv').config();

const fs = require('fs');
const private = fs.readFileSync('./src/env/private.key', "utf-8");

//const {signToken, verifyToken} = require("../middleware/jwt.helper")

// Connection setup
const db = mysql.createConnection({
    host    :   process.env.DB_IP,
    port    :   process.env.DB_PORT,
    user    :   process.env.DB_USER,
    password:   process.env.DB_PASS,
    database:   process.env.DB_DB
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });


// mysql connection
db.connect((err) => {
    if(err) throw err;
    else {
        console.log("connected");
    }
});

// Database query fuction
function dbQuery(sql) {
    return new Promise(data => {
        db.query(sql, (err, res) => {
            if(err) throw err;
            try {
                data(res);
            } catch (err) {
                data("Not found");
                throw err;
            }
        });
    });
}

// Async fetch data function bcs of database speed
async function getData(sql) {
    return result = await dbQuery(sql);
}

// ---------------------------------------------------
// Post / Get requests

/**
 *  getUser
 * @param {*} req 
 * @param {*} res 
 */
const getUser  =  (req, res) => {
    let username = req.headers.user;
    let password = req.headers.pass;
    let response = null;

    let SqlSelect = `Select * from Accounts where username = "${username}"`;
    try {
    getData(SqlSelect)
    .then((data)=> {
        if(data.length > 0 && data.length < 2) {
            bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
                if(verified) {
                    const payload = {
                        user: username, 
                        id: data[0].id,
                    };
                    const secret = private;
                    const options = {
                        expiresIn: Math.floor(Date.now() / 1000) + (60 * 60* 24), 
                        issuer: "https://thekrew.vercel.app",
                        algorithm: 'HS256' 
                    }
                    jwt.sign(
                        payload,
                        secret,
                        options,
                        (err, token) => {
                            if(err) {
                                console.log(err.message);
                                res.sendState(403);
                            }
                            response = {success: true, token: token, data: {user: data[0].username, id: data[0].id}};
                            res.send(response);
                        }
                    )
                    
                } else {
                    res.send({success: false});
                }
                if(bcryptErr) {
                    res.sendStatus(403);
                }
            });
        }
        else {
            res.sendStatus(401);
        }
    })
    } catch (e) {
        res.sendStatus(404);
    }
}

const verify = (req, res) => {
    if (!req.headers["token"]) res.sendStatus(401);
    const token = (req.headers["token"]).split(" ")[1];
    try {
        jwt.verify(token, private);
        res.sendStatus(200);
    }
    catch (e) {
        res.sendStatus(401);
    }
}



/**
 * getList
 * @param {*} req 
 * @param {*} res
 * @info Get data from api_todo Todos and send them in correct formate to the dashboard
 */
const getList = (req, res) => {
    let inside = true; 
    if (!req.headers["token"]) res.sendStatus(401);
    const token = (req.headers["token"]).split(" ")[1];
    try {
        jwt.verify(token, private);
    }
    catch (e) {
        inside = false;
        res.sendStatus(401);
    }
    
    if(inside) {
        let sqlCommand = "Select * from Todos;";
        let response = [];
        try {
            getData(sqlCommand)
            .then((data) => {
                data.forEach(el => {
                    let checked = ""
                    let val = ""
                    if(el["defaultChecked"] != 0) checked = "a"
                    if(el["defaultValue"] != 0) val = "a"
                    response.push({
                        defaultChecked: checked,
                        defaultValue: val,
                        title: el["title"],
                        description: el["description"],
                        date: el["date"]
                    })
                })
                res.send(response);
            })
        }
        catch (error) {
            console.log(error);
            let ress = {
                status: 404
            }
            res.send(ress);
        }
    }

}


/**
 * getCalendar
 * @param {*} req 
 * @param {*} res
 * @info Same as getList but the exit formate is different 
 */
const getCalendar = (req, res) => {   
    let inside = true; 
    if (!req.headers["token"]) res.sendStatus(401);
    const token = (req.headers["token"]).split(" ")[1];
    try {
        jwt.verify(token, private);
    }
    catch (e) {
        inside = false;
        res.sendStatus(401);
    }
    
    if(inside) {
        let sqlCommand = "Select * from Todos;";
        let response = [];
        try {
            getData(sqlCommand)
            .then((data) => {
                data.forEach(el => {
                    let split = el["date"].split(".");
                    let date = split[1] +"."+ split[0]+"."+split[2];
                    let allday = false
                    if(el["allday"] != 0) allday = true;
                    response.push({
                        id: "\""+el["id"]+"\"",
                        title: el["title"],
                        allday: allday,
                        start: el["start"] + " " + date,
                        end: el["end"] + " " + date
                    })
                })
                res.send(response);
            })
        }
        catch (error) {
            console.log(error);
            let ress = {
                status: 404
            }
            res.send(ress);
        }
    }
}

const subject = "Password reset. https://thekrew.lab.com";
let text = "This email is just for testing reason.";

const getReset = (req, res) => {
    let reciver = process.env.MAIL_TESTING;
    let mailOptions = {
        from: process.env.MAIL_USER,
        to: reciver,
        subject: subject,
        text: text
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.send({success: false});
        } else {
        //   console.log('Email sent: ' + info.response);
          res.send({success: true});
        }
      });
}

module.exports = {
    getUser,
    verify,
    getList,
    getCalendar,
    getReset
}