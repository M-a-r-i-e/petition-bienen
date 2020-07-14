

const spicedPG = require("spiced-pg");

const db = spicedPG("postgres:Marie1:@localhost:5432/petition");

exports.saveSignature = (firstname, lastname, signatureCode) => {

    return db.query(
        'INSERT INTO signatures (firstname, lastname, signature_code) VALUES($1,$2,$3);',
        [firstname, lastname, signatureCode]

    );
};

exports.getSigners = () => {
    return db.query('SELECT firstname, lastname FROM signatures;');
};