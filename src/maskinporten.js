const fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var issuer = require('./issuer');
const crypto = require('crypto');

// https://sky.maskinporten.dev/.well-known/openid-configuration
// https://test.maskinporten.no/

const createJwtForClient = function (client, selectedIssuer, cert) {

    let certsPath = `../certs/${cert}`
    var privateKey = fs.readFileSync(certsPath);

    let payload = {
        "scope": client.scope
    };
    if(client.audience !== undefined){
        payload['resource'] = client.audience;
    }
    return jwt.sign(
        payload,
        privateKey, {
            algorithm: 'RS256',
            audience: selectedIssuer.issuer,
            issuer: client.client_id,
            header: {"kid": client.keyname},
            expiresIn: 100,
            jwtid: crypto.randomUUID()
        });
};


const createValidBearerToken = async function (client) {

    const {
        certname: cert = "maskinporten.pem",
        url = "https://test.maskinporten.no/"
    } = client;

    let selectedIssuer = await issuer.discover(url);

    const jwt = createJwtForClient(client, selectedIssuer, cert);

    const grant = "urn:ietf:params:oauth:grant-type:jwt-bearer";

    const params = new URLSearchParams();
    params.append("grant_type", grant);
    params.append("assertion", jwt);

    console.log(`Token is signed from issuer: ${selectedIssuer.issuer}`)

    const response = await fetch(`${selectedIssuer.token_endpoint}`,
        {
            method: 'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });


    const data = await response.json();


    return data;
}


module.exports = {
    createToken: createValidBearerToken,

}