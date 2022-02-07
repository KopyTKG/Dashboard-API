const sec = require("../debug/debug");

const PassGen = (req, res) => {
    let pass = sec.Hash("toor", 10);
    let response = {
        headers: {
            method: "API response", 
            status: 200,
            statusText: "OK"
        },
        body: {
            data: {
                pass: pass
            }
        }
    }
    res.send(response);
}

module.exports = {
    PassGen
};