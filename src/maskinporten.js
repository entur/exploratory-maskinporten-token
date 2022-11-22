const fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var fs = require('fs');
const crypto = require('crypto');


let certsPath = '../certs/maskinporten.pem';

var privateKey = fs.readFileSync(certsPath);
const generateToken = function (client) {
    return jwt.sign(
        {"scope": client.scope},
        privateKey, {
            algorithm: 'RS256',
            audience: "https://ver2.maskinporten.no/",
            issuer: client.client_id,
            header: {"kid": client.keyname},
            expiresIn: 100,
            jwtid: crypto.randomUUID()
        });
};



const fetch_access_token = async function (client) {

    const jwt = generateToken(client);

    const grant = "urn:ietf:params:oauth:grant-type:jwt-bearer";

    const params = new URLSearchParams();
    params.append("grant_type", grant);
    params.append("assertion", jwt);

    const response = await fetch(`https://ver2.maskinporten.no/token`,
        {
            method: 'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

    const data = await response.json();


    return data;
}


module.exports = {
    createToken: fetch_access_token,

}