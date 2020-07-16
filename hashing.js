

const bcrypt = require("bcryptjs");

/**
 * This function will return a promise, which will
 * resolve into a bcrypt hash.
 */
exports.generateHash = (password) => {
    const saltPromise = bcrypt.genSalt();
    return saltPromise.then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

/**
 * Please provide input string from user and hash from
 * database, so this function can return a promise to
 * tell you if the input is correct.
 * Will return boolean (true or false).
 */
exports.compare = (input, hash) => {
    return bcrypt.compare(input, hash);
};