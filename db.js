

const spicedPG = require("spiced-pg");

const db = spicedPG("postgres:Marie1:@localhost:5432/petition");


// user id einfügen
exports.saveSignature = (userID, signatureCode) => {

    return db.query(
        'INSERT INTO signatures (user_id, signature_code) VALUES($1,$2) RETURNING id;',
        [userID, signatureCode]

    );
};

exports.saveUser = (firstname, lastname, email, password_hash) => {

    return db.query(
        'INSERT INTO users (firstname, lastname, email, password_hash) VALUES($1, $2, $3, $4) RETURNING *;',
        [firstname, lastname, email, password_hash]
    );
};

exports.getUserByEmail = (email) => {
    return db.query('SELECT * FROM users WHERE email = $1;', [email]);
};


exports.getSignatureByID = (signatureID) => {

    return db.query("SELECT * FROM signatures WHERE id = $1;", [signatureID]);

};

exports.getSignatureByUserID = (userID) => {

    return db.query("SELECT * FROM signatures WHERE user_id = $1;", [userID]);

};


exports.getSigners = () => {
    return db.query('SELECT firstname, lastname, age, city, homepage FROM signatures JOIN users ON signatures.user_id = users.id JOIN profiles ON users.id = profiles.user_id;');
};


exports.saveProfile = (userID, age, city, homepage) => {

    return db.query("INSERT INTO profiles (user_id, age, city, homepage) VALUES($1, $2, $3, $4) RETURNING *;", [userID, age, city, homepage]);
};