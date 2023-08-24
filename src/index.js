const maskinporten = require("./maskinporten");

function logToken(promise) {
    promise.then((data) => {
        process.stdout.write(JSON.stringify(data))
    });
}

const maskinportenGrantDetails =
        {
            scope: "entur:skyss.1",
            client_id: "fcae871b-4597-492e-ab9f-762ff2443fb1",
            keyname: "tryggtunnel",
            url: "https://sky.maskinporten.dev/"
        };

logToken(maskinporten.createToken(maskinportenGrantDetails));