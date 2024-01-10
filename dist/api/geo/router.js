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
router.get('/api/geo/config', (req, res) => {
    (0, geo_1.getGeoConfig)().then((config) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error) => {
        res.send(error);
    });
});
module.exports = router;
//# sourceMappingURL=router.js.map