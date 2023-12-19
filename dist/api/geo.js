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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeoConfig = void 0;
// geo.js - Api for Geop Portail
// const Gp = require("/node_modules/geoportal-access-lib/dist/GpServices.js");
const request_1 = require("../request");
const urlConf = 'https://api-gsa-v4.herokuapp.com/api/app-confs?filters%5BappKey%5D=geo-portail';
const getGeoConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        (0, request_1.get)(urlConf).then((response) => {
            const geoConfig = response.data[0].attributes.appConfig;
            resolve(geoConfig);
        }, (error) => {
            reject(null);
        });
    });
});
exports.getGeoConfig = getGeoConfig;
//# sourceMappingURL=geo.js.map