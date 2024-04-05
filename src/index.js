import {createToken} from "./maskinporten.js"
import { readFile } from 'fs/promises';

function logToken(promise) {
    promise.then((data) => {
        process.stdout.write(JSON.stringify(data))
    });
}

let filename =  process.argv[2] ? `../configs/${process.argv[2]}.json` : './grantdetails.json';
let clientConfig = JSON.parse(await readFile(filename, "utf8"));
logToken(createToken(clientConfig));