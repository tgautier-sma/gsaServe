import express from "express";
const router = express.Router();
import { getConceptFromIMage } from "./clarifai";


router.get('/', (req, res) => {
    res.send("👍 Server AI working well!");
})
/**
 * API for GeoPortail access
 */
router.get('/clarifai/image/concepts', (req, res) => {
    getConceptFromIMage().then((data: any) => {
        // console.log("(i) Config", data);
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

module.exports = router;