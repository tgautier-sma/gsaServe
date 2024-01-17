import express from "express";
const router = express.Router();
import { getGeoConfig, getAdress } from "./geo";
import {
    readDb, testDb,
    getApps, createApp, getApp,
    getStores, createStoreKey, updateStoreKey, deleteStoreKey,
    getStoreKey, getStoreApp
} from "../db/controller";

router.get('/', (req, res) => {
    res.send("👍 Server geo working well!");
})
/**
 * API for GeoPortail access
 */
router.get('/config', (req, res) => {
    getGeoConfig().then((config: any) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error: any) => {
        res.send(error);
    });
});
router.get('/search', (req, res) => {
    const q = req.query.q || null;
    const limit = req.query.limit || 5;
    if (q) {
        getAdress(q, limit).then((data: any) => {
            // console.log("(i) Adress", data);
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send({ message: "Search parameter required. Please fill the q variable." });
    }

});

module.exports = router;