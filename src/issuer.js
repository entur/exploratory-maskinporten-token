import fetch from 'node-fetch';
const discover = async function (url) {

    const response = await fetch(`${url}.well-known/oauth-authorization-server/`)
    return await response.json();
}


export { discover as default };