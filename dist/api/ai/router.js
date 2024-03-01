"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const clarifai_1 = require("./clarifai");
router.get('/', (req, res) => {
    res.send("👍 Server AI working well!");
});
/**
 * API for GeoPortail access
 */
router.get('/clarifai/image/concepts', (req, res) => {
    (0, clarifai_1.getConceptFromIMage)().then((data) => {
        // console.log("(i) Config", data);
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
module.exports = router;
//# sourceMappingURL=router.js.map