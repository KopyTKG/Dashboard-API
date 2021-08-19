const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();

const private = fs.readFileSync('./src/env/private.key', "utf-8");

// Connection setup
const db = mysql.createConnection({
    host    :   process.env.DB_IP,
    port    :   process.env.DB_PORT,
    user    :   process.env.DB_USER,
    password:   process.env.DB_PASS,
    database:   process.env.DB_DB
})


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
const getUser = (req, res) => {
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
                    jwt.sign(
                        {
                            exp: Math.floor(Date.now() / 1000) + (60 * 60* 24), 
                            data: {
                                user: username, 
                                id: data[0].id
                            }
                        }, 
                        private, 
                        { 
                            algorithm: 'HS256' 
                        }, 
                        (err, token) => {
                            response = {success: true, token: token, data: {user: data[0].username, id: data[0].id}};
                            res.send(response);
                        }
                    );
                    
                }
                if(bcryptErr) {
                    res.send({success: false});
                }
            });
        }
        else {
            res.send({success: false});
        }
    })
    } catch (e) {
        res.sendStatus(500);
    }
    // let password =  bcrypt.hashSync(req.headers.pass, 9);
    // console.log(password);

    // res.send(response);
}




/**
 * getList
 * @param {*} req 
 * @param {*} res
 * @info Get data from api_todo Todos and send them in correct formate to the dashboard
 */
const getList = (req, res) => {
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


/**
 * getCalendar
 * @param {*} req 
 * @param {*} res
 * @info Same as getList but the exit formate is different 
 */
const getCalendar = (req, res) => {
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

module.exports = {
    getUser,
    getList,
    getCalendar
}