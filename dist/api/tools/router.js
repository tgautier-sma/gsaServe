"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const tools_1 = require("./tools");
router.get('/', (req, res) => {
    res.send("👍 Server tools working well!");
});
/**
 * API for get information from request
 */
router.get('/meta', (req, res) => {
    const url = req.query.url || null;
    if (url) {
        (0, tools_1.fetchMetaTags)(url).then((data) => {
            console.log("(i) Meta from url :", url);
            res.send(data);
        }).catch((error) => {
            res.send(error);
        });
    }
    else {
        res.send({ error: "You must provide an url" });
    }
});
module.exports = router;
//# sourceMappingURL=router.js.map