

const spicedPG = require("spiced-pg");

const db = spicedPG(process.env.DATABASE_URL || "postgres:Marie1:@localhost:5432/petition");


// user id einfügen
exports.saveSignature = (userID, signatureCode) => {

    return db.query(
        'INSERT INTO signatures (user_id, signature_code) VALUES($1,$2) RETURNING id;',
        [userID, signatureCode]

    );
};

exports.deleteSignatureForUserId = userID => {
    return db.query("DELETE FROM signatures WHERE user_id=$1;", [userID]);
};

exports.saveUser = (firstname, lastname, email, password_hash) => {

    return db.query(
        'INSERT INTO users (firstname, lastname, email, password_hash) VALUES($1, $2, $3, $4) RETURNING *;',
        [firstname, lastname, email, password_hash]
    );
};

exports.updateUser = (userID, firstname, lastname, email) => {
    return db.query("UPDATE users SET firstname=$1, lastname=$2, email=$3 WHERE id=$4;", [firstname, lastname, email, userID]);
};

exports.updatePasswordHash = (userID, passwordHash) => {
    return db.query("UPDATE users SET password_hash=$1 WHERE id=$2;" [passwordHash, userID]);
};

exports.updateOrInsertUserProfile = (userId, age, city, homepage) => {
    return db.query('INSERT INTO profiles (user_id, age, city, homepage) VALUES ($1, $2, $3, $4) ON CONFLICT (user_ID) DO UPDATE SET age=$2, city=$3, homepage=$4;', [userId, age, city, homepage]);
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

exports.getAllUserInfo = (userID) => {
    return db.query("SELECT * FROM users LEFT JOIN profiles ON users.id = profiles.user_id WHERE users.id = $1;", [userID]);
};

exports.getUserName = (userID) => {
    return db.query("SELECT firstname FROM users WHERE id = $1;", [userID]);
};