"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeoConfig = void 0;
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
//# sourceMappingURL=geo.js.map