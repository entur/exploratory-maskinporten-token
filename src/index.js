const maskinporten = require("./maskinporten");

function logToken(promise) {
    promise.then((data) => {
        console.log(data)
    });
}

const maskinportenGrantDetails =
        {
            scope: "scope_you_request",
            client_id: "client_id_from_samarbeidsportalen",
            keyname: "keyname-from-client"
        };

logToken(maskinporten.createToken(maskinportenGrantDetails));