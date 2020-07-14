


-- Table for signatures

DROP TABLE signatures;

CREATE TABLE signatures (

    id SERIAL PRIMARY KEY,
    firstname VARCHAR(250) NOT NULL,
    lastname VARCHAR(500) NOT NULL,
    signature_code TEXT

);
