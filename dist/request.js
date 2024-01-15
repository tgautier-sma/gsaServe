"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireToken = exports.get = void 0;
const axios_1 = __importDefault(require("axios"));
const tunnel_1 = __importDefault(require("tunnel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let isProxy = (process.env.useProxy ? process.env.useProxy : 'false');
let axiosProxy;
setRequester(isProxy);
const appSecret = 'supersecret';
const get = async (url) => {
    console.log("(r) Get Request");
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
    });
};
exports.get = get;
// Check token before execute the request
const requireToken = (req, res, next) => {
    const authHeader = String(req.headers['authorization'] || '');
    // console.log("Check auth",authHeader);
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7, authHeader.length);
        jsonwebtoken_1.default.verify(token, appSecret, (err, decoded) => {
            if (err) {
                console.log("ERR", err.message);
                return res.status(401).send({ message: err.message });
            }
            else {
                // console.log("JWT=", decoded)
                if (Date.now() > decoded.exp * 1000) {
                    return res.status(401).send({ message: 'Token expired' });
                }
                else {
                    next();
                }
            }
        });
    }
    else {
        console.log("No autorization");
        next();
    }
};
exports.requireToken = requireToken;
/** ======================================================================
 * Common Functions
 * =======================================================================
 */
/**
 * Define the path to use proxy or not for a request
 * @param {*} active : boolean. Active (true) the proxy tunel configuration
 * @returns
 */
function setRequester(active) {
    const proxy = (active === 'true' ? true : false);
    if (proxy) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const agent = tunnel_1.default.httpsOverHttp({
            proxy: {
                host: 'vip-proxypar.orleanssrv.domsma',
                port: 8090,
                proxyAuth: 'dotech:fZEw7pvm!',
            },
        });
        axiosProxy = axios_1.default.create({
            httpsAgent: agent,
            proxy: false, // Désactivation de la prise en compte des variables proxy,
            //rejectUnauthorized: false,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
        console.log(('(i) Proxy server activated'));
    }
    else {
        console.log(('(i) No proxy server activated'));
        axiosProxy = axios_1.default.create({
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
function handleError(error) {
    if (error.response) {
        // la requête a été faite et le code de réponse du serveur n’est pas dans
        // la plage 2xx
        console.log("=====ERROR=====");
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        console.log("=====END ERROR=====");
    }
    else if (error.request) {
        // la requête a été faite mais aucune réponse n’a été reçue
        // `error.request` est une instance de XMLHttpRequest dans le navigateur
        // et une instance de http.ClientRequest avec node.js
        console.log("=====ERROR REQUEST=====");
        console.log(error.request);
        console.log("=====END ERROR=====");
    }
    else {
        // quelque chose s’est passé lors de la construction de la requête et cela
        // a provoqué une erreur
        console.log('Error', error.message);
    }
    console.log(error.config);
}
//# sourceMappingURL=request.js.map