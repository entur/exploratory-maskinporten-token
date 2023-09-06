const fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var fs = require('fs');
const crypto = require('crypto');

// https://sky.maskinporten.dev/.well-known/openid-configuration
// https://test.maskinporten.no/



const url = "https://test.maskinporten.no/";

const generateToken = function (client) {
    let certsPath = client.certname? `../certs/${client.certname}`:  '../certs/maskinporten.pem';
    var privateKey = fs.readFileSync(certsPath);
    return jwt.sign(
        {
            "scope": client.scope, resource: ["https://sky.organisasjonsnavn.no"]
        },
        privateKey, {
            algorithm: 'RS256',
            audience: client.url ? client.url : url,
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

    const response = await fetch(`${client.url ? client.url : url}token`,
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