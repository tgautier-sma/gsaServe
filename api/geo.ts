// geo.js - Api for Geop Portail
// const Gp = require("/node_modules/geoportal-access-lib/dist/GpServices.js");
import axios, { AxiosInstance } from 'axios';
import tunnel from 'tunnel';

const urlConf = 'https://api-gsa-v4.herokuapp.com/api/app-confs?filters%5BappKey%5D=geo-portail';

let isProxy = false;
let axiosProxy: AxiosInstance;
let geoConfig = null;
setRequester(isProxy);

export const getGeoConfig = async () => {
    readGeoConfig().then((response: any) => {
        geoConfig = response.data.attributes.appConfig
        return true;
    }, (error:any) => {
        geoConfig = null;
        return false;
    })
}

const readGeoConfig = async () => {
    console.log("(r) Geo : read config");
    return new Promise((resolve, reject) => {
        axiosProxy.get(urlConf)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                handleError(error);
                reject(error);
            })
            .finally(() => { });
    })
}
module.exports = [getGeoConfig];
/** ======================================================================
 * Common Functions
 * =======================================================================
 */

/**
 * 
 * @param {*} active : boolean. Active (true) the proxy tunel configuration
 * @returns 
 */
function setRequester(active: any) {
    isProxy = (active === 'true' || active);
    if (isProxy) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const agent = tunnel.httpsOverHttp({
            proxy: {
                host: 'vip-proxypar.orleanssrv.domsma',
                port: 8090,
                proxyAuth: 'dotech:fZEw7pvm!',
            },

        })
        axiosProxy = axios.create({
            httpsAgent: agent,
            proxy: false, // Désactivation de la prise en compte des variables proxy,
            //rejectUnauthorized: false,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
        console.log(('(i) Proxy server activated'));
    } else {
        console.log(('(i) No proxy server activated'));
        axiosProxy = axios.create({
            timeout: 10000,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });;
    }
    return isProxy;
}
/**
 * 
 * @param {*} error HTTP(s) Error object to analyse
 */
function handleError(error: any) {
    if (error.response) {
        // la requête a été faite et le code de réponse du serveur n’est pas dans
        // la plage 2xx
        console.log("=====ERROR=====");
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        console.log("=====END ERROR=====");
    } else if (error.request) {
        // la requête a été faite mais aucune réponse n’a été reçue
        // `error.request` est une instance de XMLHttpRequest dans le navigateur
        // et une instance de http.ClientRequest avec node.js
        console.log("=====ERROR REQUEST=====");
        console.log(error.request);
        console.log("=====END ERROR=====");
    } else {
        // quelque chose s’est passé lors de la construction de la requête et cela
        // a provoqué une erreur
        console.log('Error', error.message);
    }
    console.log(error.config);
}
