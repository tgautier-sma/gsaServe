"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const geo_1 = require("./geo");
router.get('/', (req, res) => {
    res.send("👍 Server geo working well!");
});
/**
 * API for GeoPortail access
 */
router.get('/config', (req, res) => {
    (0, geo_1.getGeoConfig)().then((config) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error) => {
        res.send(error);
    });
});
router.get('/search', (req, res) => {
    const q = req.query.q || null;
    const limit = req.query.limit || 5;
    if (q) {
        (0, geo_1.getAdress)(q, limit).then((data) => {
            // console.log("(i) Adress", data);
            res.send(data);
        }).catch((error) => {
            res.send(error);
        });
    }
    else {
        res.send({ message: "Search parameter required. Please fill the q variable." });
    }
});
module.exports = router;
//# sourceMappingURL=router.js.map