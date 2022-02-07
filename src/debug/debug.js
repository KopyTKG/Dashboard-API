const bcrypt = require('bcrypt');

let Hash = (pass, saltCount) => {
    let dump = bcrypt.hashSync(pass, saltCount);
    console.log("String password -> ", pass);
    console.log("Hash password   -> ", dump);
    return dump;
}


module.exports = {
    Hash
};