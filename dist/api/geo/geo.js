"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdress = exports.getGeoConfig = void 0;
// geo.js - Api for Geop Portail
// const Gp = require("/node_modules/geoportal-access-lib/dist/GpServices.js");
const request_1 = require("../../request");
const urlConf = 'https://api-gsa-v4.herokuapp.com/api/app-confs?filters%5BappKey%5D=geo-portail';
const getGeoConfig = async () => {
    return new Promise((resolve, reject) => {
        (0, request_1.get)(urlConf).then((response) => {
            const geoConfig = response.data[0].attributes.appConfig;
            resolve(geoConfig);
        }, (error) => {
            reject(null);
        });
    });
};
exports.getGeoConfig = getGeoConfig;
const getAdress = async (adr, limit) => {
    return new Promise((resolve, reject) => {
        const url = `https://api-adresse.data.gouv.fr/search?q=${adr}&limit=${limit}`;
        (0, request_1.get)(url).then((response) => {
            resolve(response);
        }, (error) => {
            reject(null);
        });
    });
};
exports.getAdress = getAdress;
//# sourceMappingURL=geo.js.map