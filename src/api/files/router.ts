import express from "express";
const router = express.Router();
import { listBlob, uploadBlob, deleteBlob } from "./files";


router.get('/', (req, res) => {
    res.send("👍 Server Files working well!");
})
/**
 * API for store blob
 */

router.get('/get', (req, res) => {
    console.log("Start GET");
    listBlob(req).then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
router.post('/upload', (req, res) => {
    console.log("Start upload");
    console.log(req)
    uploadBlob(req).then((data: any) => {
        // console.log("(i) Config", data);
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

module.exports = router;