import express from "express";
const router = express.Router();
import { fetchMetaTags } from "./tools";
import {
    readDb, testDb,
    getApps, createApp, getApp,
    getStores, createStoreKey, updateStoreKey, deleteStoreKey,
    getStoreKey, getStoreApp
} from "../db/controller";

router.get('/', (req, res) => {
    res.send("👍 Server tools working well!");
})
/**
 * API for GeoPortail access
 */
router.get('/meta', (req, res) => {
    const url: any = req.query.url || null;
    if (url) {
        fetchMetaTags(url).then((data: any) => {
            console.log("(i) Meta", data);
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send("You must provide an url");
    }
    
});


module.exports = router;