import express from "express";
const router = express.Router();
import { getGeoConfig } from "./geo";
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
router.get('/api/geo/config', (req, res) => {
    getGeoConfig().then((config: any) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error: any) => {
        res.send(error);
    });
});

module.exports = router;