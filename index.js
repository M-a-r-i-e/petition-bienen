

const express = require("express");
const hb = require ("express-handlebars");
const db = require ("./db.js");
const cookieSession = require("cookie-session");


const app = express();
app.engine("handlebars", hb.create({}).engine);
app.set("view engine", "handlebars");
app.use(express.static("static"));
app.use(require('body-parser')());
app.use(cookieSession({
    secret: "",
    maxAge: 1000 * 60 * 60 * 24 * 180 // halbes Jahr
}));


app.get('/', function (request, response) {

    response.render("home");

});


app.post('/sign-petition', function(request, response){

    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let signatureCode = request.body.signatureCode;

    if(!firstname){
        response.render("home", {
            error: "firstname is missing",
            firstname: firstname,
            lastname: lastname,
        });

    } else if (!lastname) {
        response.render("home", {
            error: "lastname is missing",
            firstname: firstname,
            lastname: lastname,
        });
    } else if (!signatureCode) {
        response.render("home", {
            error: "signature is missing",
            firstname: firstname,
            lastname: lastname,
        });

        console.log(firstname);
        console.log(lastname);
        console.log(signatureCode);
        console.log(request.body);

    } else {

        db.saveSignature(firstname, lastname, signatureCode)
            .then((result)=> {
                console.log("saved to database", result),
                response.cookie("signed", true),
                response.redirect("/thank-you", 302);

            });
    }
});

app.get("/thank-you", (request, response) => {

    response.render("thank-you");

});



app.get ("/signers",(request, response) => {

    db.getSigners()
        .then(results => {
            response.render("signers", {
                signers: results.rows
            });
        });
});






app.listen(8080);