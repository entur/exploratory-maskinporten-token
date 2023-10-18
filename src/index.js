const maskinporten = require("./maskinporten");
const grantDetails = require('./config-skyporten-public-demo.json');

function logToken(promise) {
    promise.then((data) => {
        process.stdout.write(JSON.stringify(data))
    });
}

logToken(maskinporten.createToken(grantDetails));