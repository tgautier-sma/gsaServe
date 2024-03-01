"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const files_1 = require("./files");
router.get('/', (req, res) => {
    res.send("👍 Server Files working well!");
});
/**
 * API for store blob
 */
router.get('/get', (req, res) => {
    console.log("Start GET");
    (0, files_1.listBlob)(req).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
router.post('/upload', (req, res) => {
    console.log("Start upload");
    console.log(req);
    (0, files_1.uploadBlob)(req).then((data) => {
        // console.log("(i) Config", data);
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
module.exports = router;
//# sourceMappingURL=router.js.map