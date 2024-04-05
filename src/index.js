const maskinporten = require("./maskinporten");

function logToken(promise) {
    promise.then((data) => {
        process.stdout.write(JSON.stringify(data))
    });
}

let clientConfig =  process.argv[2] ? require(`../configs/${process.argv[2]}.json`) : require('./grantdetails.json');

logToken(maskinporten.createToken(clientConfig));