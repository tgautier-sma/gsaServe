import axios, { AxiosInstance } from 'axios';
import tunnel from 'tunnel';
import jwt, { JwtPayload, VerifyErrors, verify } from 'jsonwebtoken';
let isProxy = (process.env.useProxy ? process.env.useProxy : 'false');
let axiosProxy: AxiosInstance;
setRequester(isProxy);
const appSecret = 'supersecret';

export const get = async (url: string) => {
    console.log("(r) Get Request",url);
    return new Promise((resolve, reject) => {
        axiosProxy.get(url)
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
// Check token before execute the request
export const requireToken = (req: any, res: any, next: any) => {
    const authHeader = String(req.headers['authorization'] || '');
    // console.log("Check auth",authHeader);
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7, authHeader.length);
        jwt.verify(token, appSecret, (err:VerifyErrors, decoded: JwtPayload) => {
            if (err) {
                console.log("ERR", err.message);
                return res.status(401).send({ message: err.message });
            } else {
                // console.log("JWT=", decoded)
                if (Date.now() > decoded.exp * 1000) {
                    return res.status(401).send({ message: 'Token expired' });
                } else {
                    next()
                }
            }
        });
    } else {
        console.log("No autorization");
        next();
    }
}

/** ======================================================================
 * Common Functions
 * =======================================================================
 */
/**
 * Define the path to use proxy or not for a request
 * @param {*} active : boolean. Active (true) the proxy tunel configuration
 * @returns 
 */
function setRequester(active: any) {
    const proxy = (active === 'true' ? true : false);
    if (proxy) {
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
        });
    }
    return isProxy;
}

/**
 * Analyse error of http request
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
