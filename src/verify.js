var jwksClient = require('jwks-rsa');
var jwt = require('jsonwebtoken');

const token = process.argv[2];
console.log(`Token is ${token.substring(0, 15)}`);

var client = jwksClient({
    jwksUri: 'https://ver2.maskinporten.no/jwk.json'
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

jwt.verify(token, getKey, {"issuer": "https://ver2.maskinporten.no/"}, function (err, decoded) {
    if (err) {
        console.error(err)
    } else {
        console.log(`Requested scope as granted by maskinporten is ${decoded.scope}`)
        console.log(decoded)
    }
});
