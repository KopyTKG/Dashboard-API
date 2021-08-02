
/*

    - Testing API input

*/

const TestInit = (req, res) => {
    console.log(req);
    let response = {
        headers: {
            method: "API response", 
            status: 200,
            statusText: "OK"
        },
        body: {
            data: [
                "Hello"
            ]
        }
    }
    res.send(response);
}

module.exports = {
    TestInit
};