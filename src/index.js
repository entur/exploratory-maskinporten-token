const maskinporten = require("./maskinporten");
const grantDetails = require('./grantdetails.json');

function logToken(promise) {
    promise.then((data) => {
        process.stdout.write(JSON.stringify(data))
    });
}

logToken(maskinporten.createToken(grantDetails));