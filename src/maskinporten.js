import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';
import discover from './issuer.js';

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

    let header = {};

    if(client.x5c !== undefined){
        var certificateChain = fs.readFileSync(`../certs/${client.x5c}`, 'utf8');
        console.log(certificateChain)
        let x5c = cert_to_x5c(certificateChain);
        console.log(x5c)
        header.x5c = x5c;
    }

    if(client.kid !== undefined){
        // console.log(client.keyname)
        header.kid = client.kid;
    }

    return jwt.sign(
        payload,
        privateKey, {
            algorithm: 'RS256',
            audience: selectedIssuer.issuer,
            issuer: client.client_id,
            header: header,
            expiresIn: 60,
            jwtid: crypto.randomUUID()
        });
};


const createValidBearerToken = async function (client) {

    const {
        certname: cert = "maskinporten.pem",
        url = "https://test.maskinporten.no/"
    } = client;

    validate(client)

    let selectedIssuer = await discover(url);

    const jwt = createJwtForClient(client, selectedIssuer, cert);

    const grant = "urn:ietf:params:oauth:grant-type:jwt-bearer";

    const params = new URLSearchParams();
    params.append("grant_type", grant);
    params.append("assertion", jwt);

   // console.log(`Token is signed from issuer: ${selectedIssuer.issuer}`)

    const response = await fetch(`${selectedIssuer.token_endpoint}`,
        {
            method: 'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });


    const data = await response.json();


    return data;
}

function validate (client) {
    if(client.x5c == undefined && client.kid == undefined){
        console.error("kid or x5c must be set");
        process.exit(1)
    }
}
function cert_to_x5c (cert, maxdepth) {
    if (maxdepth == null) {
        maxdepth = 0;
    }
    /*
     * Convert a PEM-encoded certificate to the version used in the x5c element
     * of a [JSON Web Key](http://tools.ietf.org/html/draft-ietf-jose-json-web-key).
     *
     * `cert` PEM-encoded certificate chain
     * `maxdepth` The maximum number of certificates to use from the chain.
     */

    cert = cert.replace(/-----[^\n]+\n?/gm, ',').replace(/\n/g, '');
    cert = cert.split(',').filter(function(c) {
        return c.length > 0;
    });
    if (maxdepth > 0) {
        cert = cert.splice(0, maxdepth);
    }
    return cert;
}

export { createValidBearerToken as createToken };
