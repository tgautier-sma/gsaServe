"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConceptFromIMage = void 0;
/**
 * CLARIFAI AI
 */
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "7f0fab2d7d504fd6b3932c0ea8110aaa");
const getConceptFromIMage = async () => {
    return new Promise((resolve, reject) => {
        stub.PostModelOutputs({
            // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
            model_id: "aaa03c23b3724a16a56b629203edc62c",
            inputs: [{ data: { image: { url: "https://samples.clarifai.com/dog2.jpeg" } } }]
        }, metadata, (err, response) => {
            if (err) {
                console.log("Error: " + err);
                reject(err);
                return;
            }
            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                reject(err);
                return;
            }
            console.log("Predicted concepts, with confidence values:");
            for (const c of response.outputs[0].data.concepts) {
                console.log(c.name + ": " + c.value);
            }
            resolve(response.outputs[0].data.concepts);
        });
    });
};
exports.getConceptFromIMage = getConceptFromIMage;
//# sourceMappingURL=clarifai.js.map