import { get } from "../../request"
import cheerio from 'cheerio';

export const fetchMetaTags = async (url: string) => {
    return new Promise((resolve, reject) => {
        const ds = new Date().getTime();
        get(url)
            .then((data: any) => {
                // console.log(data);
                const $ = cheerio.load(data);
                const metaTags: any = {};
                $('meta').each((i: any, element: any) => {
                    const name = $(element).attr('name')
                        || $(element).attr('property')
                        || $(element).attr('http-equiv')
                        /* || $(element).attr('Content-Security-Policy') */;
                    if (name) {
                        metaTags[name] = $(element).attr('content');
                    }
                });
                const de = new Date().getTime();
                resolve({
                    url: url,
                    ts: new Date().toJSON(),
                    duration:de-ds,
                    data: metaTags
                });
            })
            .catch(error => {
                reject({ error: error.message, ts: new Date().toJSON() });
            })
    })
}
