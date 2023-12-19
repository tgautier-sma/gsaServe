// geo.js - Api for Geop Portail
// const Gp = require("/node_modules/geoportal-access-lib/dist/GpServices.js");
import { get } from "../request"

const urlConf = 'https://api-gsa-v4.herokuapp.com/api/app-confs?filters%5BappKey%5D=geo-portail';


export const getGeoConfig = async () => {
    return new Promise((resolve, reject) => {
        get(urlConf).then((response: any) => {
            const geoConfig = response.data[0].attributes.appConfig
            resolve(geoConfig);
        }, (error: any) => {
            reject(null)
        })
    })
}
