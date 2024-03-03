"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetaTags = void 0;
const request_1 = require("../../request");
// import cheerio from 'cheerio';
const fetchMetaTags = async (url) => {
    return new Promise((resolve, reject) => {
        const ds = new Date().getTime();
        (0, request_1.get)(url)
            .then((data) => {
            // console.log(data);
            const metaTags = {};
            /* const $ = cheerio.load(data);
            $('meta').each((i: any, element: any) => {
                const name = $(element).attr('name')
                    || $(element).attr('property')
                    || $(element).attr('http-equiv')
                    || $(element).attr('Content-Security-Policy');
                if (name) {
                    metaTags[name] = $(element).attr('content');
                }
            }); */
            const de = new Date().getTime();
            resolve({
                url: url,
                ts: new Date().toJSON(),
                duration: de - ds,
                data: metaTags
            });
        })
            .catch(error => {
            reject({ error: error.message, ts: new Date().toJSON() });
        });
    });
};
exports.fetchMetaTags = fetchMetaTags;
//# sourceMappingURL=tools.js.map