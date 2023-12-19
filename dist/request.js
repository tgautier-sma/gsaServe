"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const axios_1 = __importDefault(require("axios"));
const tunnel_1 = __importDefault(require("tunnel"));
let isProxy = (process.env.useProxy ? process.env.useProxy : 'false');
let axiosProxy;
setRequester(isProxy);
const get = (url) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.get = get;
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