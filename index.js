

const express = require("express");
const hb = require ("express-handlebars");
const db = require ("./db.js");
const cookieSession = require("cookie-session");
const csurf = require('csurf');
const hashing = require("./hashing.js");


const app = express();
app.engine("handlebars", hb.create({}).engine);
app.set("view engine", "handlebars");
app.use(express.static("static"));
app.use(require('body-parser')());
app.use(cookieSession({
    secret: "Whats going on?",
    maxAge: 1000 * 60 * 60 * 24 * 31 // 1 Monat
}));

app.use(express.urlencoded({
    extended: false,
}));

app.use(csurf()); 

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.get("/register",(request, response) => {

    //if userID IS in request.session
    // -> redirect to /thank-you
    response.render("register");

});

app.post("/register",(request, response) => {

    const {firstname, lastname, email, password } = request.body;
    if(!firstname || !lastname || !email || !password) {
        return response.render("register", {
            error: "All fields musst be filled out",
            firstname,
            lastname,
            email,
            password,
        });

    }

    // Hash password and save user in DB

    hashing.generateHash(password).then((password_hash) => {
        db.saveUser(firstname, lastname, email, password_hash)
            .then((result) => {
                request.session.userID = result.rows[0].id;
                response.redirect("profile", 302);
            });
    });

});


app.get("/login",(request, response) => {

    if(request.session.userID) {
        response.redirect("/", 302);
    } else {
        response.render("login");
    }

});



app.post("/login",(request, response) => {

    const {email, password } = request.body;
    if(!email || !password) {
        return response.render("login", {
            error: "All fields musst be filled out",
            email,
            password,
        });

    }

    db.getUserByEmail(email).then((result) => {
        const userPasswordHashFromDB = result.rows[0].password_hash;

        hashing.compare(password, userPasswordHashFromDB).then((isCorrect) => {
            if (isCorrect) {
                request.session.userID = result.rows[0].id;
                response.redirect("/thank-you", 302);
            
            } else {
                response.status(401).send("Uups. Something went wrong.");
            }    
        });
    }).catch(error => {
        response.status(401).send("something went wrong. Please try again.");
    });   
});


app.get('/profile', (request, response) => {
    if(request.session.userID) {
        response.render("profile");
    } else {
        response.redirect("/login", 302);
    }
});

app.post('/profile', (request, response) => {

    const { age, city, homepage } = request.body;
    if(!age || !city) {
        return response.render("profile", {
            error: "All fields musst be filled out",
            age,
            city,
            homepage
        });
    }
    const userID = request.session.userID;
    db.saveProfile(userID, age, city, homepage).then( result => {

        response.redirect("/", 302);
    }).catch(error => {
        response.status(500).send("Uups. something went wrong");
        console.log("error:", error);
    });

});

app.get("/profile-edit", (request, response) => {

    if(!request.session.userID) {
        return response.redirect("/login", 302);
    }

    db.getAllUserInfo(request.session.userID)
        .then(result => {
            const userInfo = result.rows[0];
            response.render("profile-edit", userInfo);
        })
        .catch((error) => {
            console.log("error:", error);
            response.status(500).send("something went wrong");
        });
        
});

app.post("/profile-edit", (request, response) => {

    if(!request.session.userID) {
        return response.redirect("/login", 302);
    }

    const { firstname, lastname, email, password, age, city, homepage } = request.body;
    if(!firstname || !lastname || !email || !age) {
        return response.render("profile-edit", {
            error: "All fields musst be filled out",
            firstname,
            lastname,
            email,
            password,
            age,
            city,
            homepage,

        });
    }

    const userUpdatePromise = db.updateUser(request.session.userID, firstname, lastname, email);

    let passwordUpdatePromise;
    if(password) {
        passwordUpdatePromise = hashing.generateHash(password).then(passwordHash => {
            return db.updatePasswordHash(request.session.userID, passwordHash);
        });
    }

    const upsertPromise = db.updateOrInsertUserProfile(request.session.userID, age, city, homepage);

    Promise.all([userUpdatePromise, passwordUpdatePromise, upsertPromise]).then(data => {
        response.redirect("/thank-you", 302);
    });

});


//shows sing form
app.get("/", function (request, response) {

    if(!request.session.userID) {
        return response.redirect("/login", 302);
    }

    db.getSignatureByUserID(request.session.userID).then((result) => {
        if(result.rows.lenght > 0) {
            response.redirect("/thank-you, 302");
        } {
            response.render("home");
        }
    });
});


app.post('/sign-petition', function(request, response){

    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let signatureCode = request.body.signatureCode;

    if (!signatureCode) {
        response.render("home", {
            error: "signature is missing",            
        });

        console.log(firstname);
        console.log(lastname);
        console.log(signatureCode);
        console.log(request.body);

    } else {

        // user id übergeben
        const userID = request.session.userID;
        db.saveSignature(userID, signatureCode)
            .then((result)=> {
                const signatureId = result.rows[0].id;
                request.session.signatureID = signatureId;
                console.log("session geschrieben", request.session),               
                response.redirect("/thank-you", 302);      

            }).catch (error => {
                response.send ("Sorry, something went wrong, try again or login. "); 
            });  
    }       
});


app.post("/unsign-petition", (request, response) => {

    if(!request.session.userID) {
        response.redirect("/login", 302);
    } else {
        db.deleteSignatureForUserId(request.session.userID).then(result => {
            response.redirect("/", 302);
        });
    }

});

app.get("/thank-you", (request, response) => {
    
    const userID = request.session.userID;
    // if(userID) {
    db.getSignatureByUserID(userID)
        .then((result) => {

            const firstname = result.rows[0].firstname; // fehlermeldung für fehlende unterschrift - umleitung wenn = 0        
            console.log("firstname", firstname);
            const signatureCode = result.rows[0].signature_code;

            response.render("thank-you", { signatureCode: signatureCode, firstname: firstname});    
        })
        .catch((error) => {
            response.status(401);
            console.log("error:", error);
            response.send("sorry this session....");
        });

    
    // } else {
    //     response.redirect("login");
    // }        
});


app.get ("/signers",(request, response) => {

    db.getSigners()
        .then(results => {
            response.render("signers", {
                signers: results.rows,
            });
        });
});


app.listen(8080);