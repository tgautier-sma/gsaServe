import express from "express";

const router = express.Router();

import { fetchMetaTags } from "./tools";

router.get('/', (req, res) => {
    res.send("👍 Server tools working well!");
})

router.get('/check', (req, res) => {
    const target = process.env.NODE_ENV
    const env = process.env;
    res.send({ env: { target: target, exec: env.VERCEL_ENV, host: env.POSTGRES_HOST,env:env }, lastversion: env.VERCEL_GIT_COMMIT_MESSAGE, });
});
/**
 * API for get information from request
 */
router.get('/meta', (req, res) => {
    const url: any = req.query.url || null;
    if (url) {
        fetchMetaTags(url).then((data: any) => {
            console.log("(i) Meta from url :",url);
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send({error:"You must provide an url"});
    }    
});

module.exports = router;